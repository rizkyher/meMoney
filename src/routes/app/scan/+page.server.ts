import { getDb } from '$lib/server/db';
import { listCategories } from '$lib/server/repositories/categories.repo';

export async function load({ platform, parent }) {
  const { user, csrfToken } = await parent();
  const categories = await listCategories(getDb(platform), user.id);
  return { categories: categories.results, csrfToken };
}
