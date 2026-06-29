import { getDb } from '$lib/server/db';
import { ok, requireUser } from '$lib/server/api';
import { getDashboard } from '$lib/server/services/dashboard.service';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) throw new Error('Unauthorized');
  return ok(await getDashboard(getDb(event.platform), user));
}
