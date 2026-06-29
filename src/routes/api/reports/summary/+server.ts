import { getDb } from '$lib/server/db';
import { ok, fail, requireUser } from '$lib/server/api';
import { sumTransactions, listTransactions } from '$lib/server/repositories/transactions.repo';
import { getMonthRange } from '$lib/utils/date';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const fallback = getMonthRange();
  const from = event.url.searchParams.get('from') ?? fallback.from;
  const to = event.url.searchParams.get('to') ?? fallback.to;
  const db = getDb(event.platform);
  const [income, expense, transactions, categories] = await Promise.all([
    sumTransactions(db, user.id, from, to, 'income'),
    sumTransactions(db, user.id, from, to, 'expense'),
    listTransactions(db, user.id, { from, to }),
    db
      .prepare(
        `SELECT COALESCE(categories.name, 'Lainnya') AS name, SUM(transactions.amount) AS total
         FROM transactions
         LEFT JOIN categories ON categories.id = transactions.category_id
         WHERE transactions.user_id = ? AND transactions.deleted_at IS NULL AND transactions.type = 'expense' AND transactions.transaction_date BETWEEN ? AND ?
         GROUP BY categories.name
         ORDER BY total DESC`
      )
      .bind(user.id, from, to)
      .all()
  ]);
  return ok({ from, to, income, expense, net: income - expense, transactions: transactions.results, categories: categories.results });
}
