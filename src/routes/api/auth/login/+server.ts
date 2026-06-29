import { getDb } from '$lib/server/db';
import { createSession, verifyPassword } from '$lib/server/auth';
import { ok, fail, readJson } from '$lib/server/api';
import { loginSchema } from '$lib/server/validators/auth.schema';

export async function POST(event) {
  const parsed = await readJson(event, loginSchema);
  if (parsed.error) return parsed.error;
  const db = getDb(event.platform);
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(parsed.value.email.toLowerCase()).first<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
    password_salt: string;
  }>();
  if (!user || !(await verifyPassword(parsed.value.password, user.password_salt, user.password_hash))) {
    return fail('INVALID_LOGIN', 'Email atau password tidak cocok.', 401);
  }
  await createSession(db, event.cookies, user.id);
  return ok({ user: { id: user.id, email: user.email, name: user.name } });
}
