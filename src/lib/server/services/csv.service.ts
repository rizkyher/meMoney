import { rowsToCsv } from '$lib/utils/csv';
import { listTransactions } from '$lib/server/repositories/transactions.repo';

export async function exportTransactionsCsv(db: D1Database, userId: string, filters: { from?: string; to?: string }) {
  const result = await listTransactions(db, userId, filters);
  return rowsToCsv(result.results as Record<string, unknown>[]);
}
