import { requireLogin } from '$lib/server/auth';

export async function load({ locals }) {
  const user = await requireLogin(locals);
  return { user, csrfToken: locals.csrfToken };
}
