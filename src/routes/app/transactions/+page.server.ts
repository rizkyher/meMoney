import { getDb } from '$lib/server/db';
import { listCategories } from '$lib/server/repositories/categories.repo';
import { listTransactions } from '$lib/server/repositories/transactions.repo';
import { getMonthRange } from '$lib/utils/date';

export async function load({ platform, parent }) {
  const { user, csrfToken } = await parent();
  const range = getMonthRange();
  const [categories, transactions] = await Promise.all([
    listCategories(getDb(platform), user.id),
    listTransactions(getDb(platform), user.id, range)
  ]);
  return { categories: categories.results, transactions: transactions.results, csrfToken };
}
