import { ok } from '$lib/server/api';

export async function GET({ locals }) {
  return ok({ user: locals.user });
}
