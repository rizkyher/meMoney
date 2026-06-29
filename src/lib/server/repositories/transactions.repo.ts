import { createId, nowIso } from '$lib/server/db';
import type { z } from 'zod';
import type { transactionSchema } from '$lib/server/validators/transaction.schema';

export type TransactionInput = z.infer<typeof transactionSchema>;

export async function listTransactions(db: D1Database, userId: string, filters: { from?: string; to?: string; type?: string; category_id?: string; q?: string } = {}) {
  const where = ['user_id = ?', 'deleted_at IS NULL'];
  const values: unknown[] = [userId];
  if (filters.from) {
    where.push('transaction_date >= ?');
    values.push(filters.from);
  }
  if (filters.to) {
    where.push('transaction_date <= ?');
    values.push(filters.to);
  }
  if (filters.type) {
    where.push('type = ?');
    values.push(filters.type);
  }
  if (filters.category_id) {
    where.push('category_id = ?');
    values.push(filters.category_id);
  }
  if (filters.q) {
    where.push('(title LIKE ? OR merchant LIKE ? OR note LIKE ?)');
    values.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
  }

  return db
    .prepare(
      `SELECT * FROM transactions
       WHERE ${where.join(' AND ')}
       ORDER BY transaction_date DESC, created_at DESC
       LIMIT 200`
    )
    .bind(...values)
    .all();
}

export async function createTransaction(db: D1Database, userId: string, input: TransactionInput) {
  const id = createId('trx');
  const now = nowIso();
  await db
    .prepare(
      `INSERT INTO transactions
       (id, user_id, account_id, category_id, type, amount, title, merchant, note, transaction_date, source, receipt_image_key, ocr_text, confidence, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      userId,
      input.account_id ?? null,
      input.category_id ?? null,
      input.type,
      input.amount,
      input.title ?? null,
      input.merchant ?? null,
      input.note ?? null,
      input.transaction_date,
      input.source,
      input.receipt_image_key ?? null,
      input.ocr_text ?? null,
      input.confidence ?? null,
      now,
      now
    )
    .run();
  return getTransaction(db, userId, id);
}

export async function getTransaction(db: D1Database, userId: string, id: string) {
  return db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ? AND deleted_at IS NULL').bind(id, userId).first();
}

export async function updateTransaction(db: D1Database, userId: string, id: string, input: TransactionInput) {
  await db
    .prepare(
      `UPDATE transactions
       SET account_id = ?, category_id = ?, type = ?, amount = ?, title = ?, merchant = ?, note = ?,
           transaction_date = ?, source = ?, receipt_image_key = ?, ocr_text = ?, confidence = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`
    )
    .bind(
      input.account_id ?? null,
      input.category_id ?? null,
      input.type,
      input.amount,
      input.title ?? null,
      input.merchant ?? null,
      input.note ?? null,
      input.transaction_date,
      input.source,
      input.receipt_image_key ?? null,
      input.ocr_text ?? null,
      input.confidence ?? null,
      nowIso(),
      id,
      userId
    )
    .run();
  return getTransaction(db, userId, id);
}

export async function deleteTransaction(db: D1Database, userId: string, id: string) {
  await db.prepare('UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?').bind(nowIso(), nowIso(), id, userId).run();
}

export async function sumTransactions(db: D1Database, userId: string, from: string, to: string, type?: string) {
  const query = type
    ? 'SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND deleted_at IS NULL AND transaction_date BETWEEN ? AND ? AND type = ?'
    : 'SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND deleted_at IS NULL AND transaction_date BETWEEN ? AND ?';
  const row = await db.prepare(query).bind(...(type ? [userId, from, to, type] : [userId, from, to])).first<{ total: number }>();
  return row?.total ?? 0;
}
