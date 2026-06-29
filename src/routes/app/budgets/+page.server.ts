import { getDb } from '$lib/server/db';
import { listBudgets } from '$lib/server/repositories/budgets.repo';

export async function load({ platform, parent }) {
  const { user, csrfToken } = await parent();
  const budgets = await listBudgets(getDb(platform), user.id);
  return { budgets: budgets.results, csrfToken };
}
