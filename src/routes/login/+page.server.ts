import { fail as actionFail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createSession, seedFirstUser, verifyPassword } from '$lib/server/auth';
import { loginSchema, setupSchema } from '$lib/server/validators/auth.schema';

export async function load({ platform, locals }) {
  if (locals.user) throw redirect(303, '/app/dashboard');
  const db = getDb(platform);
  const row = await db.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number }>();
  return { needsSetup: (row?.count ?? 0) === 0 };
}

export const actions = {
  login: async (event) => {
    const db = getDb(event.platform);
    const form = Object.fromEntries(await event.request.formData());
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return actionFail(422, { message: 'Email atau password belum valid.' });
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(parsed.data.email.toLowerCase()).first<{
      id: string;
      email: string;
      password_hash: string;
      password_salt: string;
    }>();
    if (!user || !(await verifyPassword(parsed.data.password, user.password_salt, user.password_hash))) {
      return actionFail(401, { message: 'Email atau password tidak cocok.' });
    }
    await createSession(db, event.cookies, user.id);
    throw redirect(303, '/app/dashboard');
  },
  setup: async (event) => {
    const db = getDb(event.platform);
    const form = Object.fromEntries(await event.request.formData());
    const parsed = setupSchema.safeParse(form);
    if (!parsed.success) return actionFail(422, { message: 'Data user pertama belum valid.' });
    const user = await seedFirstUser(db, parsed.data.email.toLowerCase(), parsed.data.name, parsed.data.password);
    await createSession(db, event.cookies, user.id);
    throw redirect(303, '/app/dashboard');
  }
};
