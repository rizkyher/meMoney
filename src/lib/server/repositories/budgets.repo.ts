import { createId, nowIso } from '$lib/server/db';
import type { z } from 'zod';
import type { budgetSchema } from '$lib/server/validators/budget.schema';

export type BudgetInput = z.infer<typeof budgetSchema>;

export async function listBudgets(db: D1Database, userId: string) {
  return db.prepare('SELECT * FROM budgets WHERE user_id = ? ORDER BY period').bind(userId).all();
}

export async function upsertBudgets(db: D1Database, userId: string, budgets: BudgetInput[]) {
  const now = nowIso();
  const periods = [...new Set(budgets.map((budget) => budget.period))];
  const statements = [
    ...periods.map((period) => db.prepare('DELETE FROM budgets WHERE user_id = ? AND period = ?').bind(userId, period)),
    ...budgets.map((budget) =>
      db
        .prepare(
          `INSERT INTO budgets (id, user_id, period, amount, category_id, start_date, end_date, mode, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(createId('bud'), userId, budget.period, budget.amount, budget.category_id ?? null, budget.start_date ?? null, budget.end_date ?? null, budget.mode, now, now)
    )
  ];
  await db.batch(statements);
  return listBudgets(db, userId);
}
