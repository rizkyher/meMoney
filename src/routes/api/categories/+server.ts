import { getDb } from '$lib/server/db';
import { ok, requireUser } from '$lib/server/api';
import { listCategories } from '$lib/server/repositories/categories.repo';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) throw new Error('Unauthorized');
  return ok(await listCategories(getDb(event.platform), user.id));
}
