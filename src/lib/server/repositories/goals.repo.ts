import { createId, nowIso } from '$lib/server/db';
import type { z } from 'zod';
import type { goalSchema, movementSchema } from '$lib/server/validators/goal.schema';

export type GoalInput = z.infer<typeof goalSchema>;
export type MovementInput = z.infer<typeof movementSchema>;

export async function listGoals(db: D1Database, userId: string, type?: 'saving' | 'emergency') {
  const query = type
    ? 'SELECT * FROM savings_goals WHERE user_id = ? AND type = ? AND archived = 0 ORDER BY created_at DESC'
    : 'SELECT * FROM savings_goals WHERE user_id = ? AND archived = 0 ORDER BY created_at DESC';
  return db.prepare(query).bind(...(type ? [userId, type] : [userId])).all();
}

export async function createGoal(db: D1Database, userId: string, input: GoalInput) {
  const id = createId('goal');
  const now = nowIso();
  await db
    .prepare(
      `INSERT INTO savings_goals
       (id, user_id, name, target_amount, current_amount, target_date, type, icon, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, userId, input.name, input.target_amount, input.current_amount, input.target_date ?? null, input.type, input.icon ?? null, input.color ?? null, now, now)
    .run();
  return db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').bind(id, userId).first();
}

export async function updateGoal(db: D1Database, userId: string, id: string, input: GoalInput) {
  const now = nowIso();
  await db
    .prepare(
      `UPDATE savings_goals
       SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, type = ?, icon = ?, color = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND archived = 0`
    )
    .bind(input.name, input.target_amount, input.current_amount, input.target_date ?? null, input.type, input.icon ?? null, input.color ?? null, now, id, userId)
    .run();
  return db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ? AND archived = 0').bind(id, userId).first();
}

export async function archiveGoal(db: D1Database, userId: string, id: string) {
  await db.prepare('UPDATE savings_goals SET archived = 1, updated_at = ? WHERE id = ? AND user_id = ?').bind(nowIso(), id, userId).run();
}

export async function addMovement(db: D1Database, userId: string, input: MovementInput) {
  const goal = await db.prepare('SELECT current_amount FROM savings_goals WHERE id = ? AND user_id = ?').bind(input.goal_id, userId).first<{ current_amount: number }>();
  if (!goal) throw new Error('Goal tidak ditemukan.');
  const nextAmount = input.type === 'withdrawal' ? Math.max(0, goal.current_amount - input.amount) : input.type === 'deposit' ? goal.current_amount + input.amount : input.amount;
  const now = nowIso();
  await db.batch([
    db
      .prepare('INSERT INTO fund_movements (id, user_id, goal_id, type, amount, note, movement_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(createId('mov'), userId, input.goal_id, input.type, input.amount, input.note ?? null, input.movement_date, now),
    db.prepare('UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ? AND user_id = ?').bind(nextAmount, now, input.goal_id, userId)
  ]);
}
