import { getDb } from '$lib/server/db';
import { listGoals } from '$lib/server/repositories/goals.repo';

export async function load({ platform, parent }) {
  const { user, csrfToken } = await parent();
  const goals = await listGoals(getDb(platform), user.id, 'emergency');
  return { goals: goals.results, csrfToken };
}
