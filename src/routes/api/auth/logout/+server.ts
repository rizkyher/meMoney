import { getDb } from '$lib/server/db';
import { destroySession } from '$lib/server/auth';
import { ok } from '$lib/server/api';

export async function POST(event) {
  await destroySession(getDb(event.platform), event.cookies);
  return ok({ loggedOut: true });
}
