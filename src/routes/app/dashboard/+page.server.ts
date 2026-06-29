import { getDb } from '$lib/server/db';
import { getDashboard } from '$lib/server/services/dashboard.service';

export async function load({ platform, parent }) {
  const { user } = await parent();
  return { dashboard: await getDashboard(getDb(platform), user) };
}
