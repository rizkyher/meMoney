import { error, redirect, type Cookies } from '@sveltejs/kit';
import { createId, nowIso } from './db';

const SESSION_COOKIE = 'uang_session';
const SESSION_DAYS = 30;
const encoder = new TextEncoder();

function toBase64(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let raw = '';
  for (const byte of view) raw += String.fromCharCode(byte);
  return btoa(raw);
}

function fromBase64(value: string) {
  const raw = atob(value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function sha256(value: string) {
  return toBase64(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

export async function hashPassword(password: string, saltBase64 = toBase64(crypto.getRandomValues(new Uint8Array(16)))) {
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromBase64(saltBase64), iterations: 210_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return { hash: toBase64(bits), salt: saltBase64 };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actual = await hashPassword(password, salt);
  return timingSafeEqual(actual.hash, expectedHash);
}

function timingSafeEqual(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.byteLength !== right.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < left.byteLength; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function createSession(db: D1Database, cookies: Cookies, userId: string) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = toBase64(tokenBytes);
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db
    .prepare('INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(createId('ses'), userId, tokenHash, expires.toISOString(), nowIso())
    .run();

  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

export async function getSessionUser(db: D1Database, cookies: Cookies) {
  const token = cookies.get(SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await db
    .prepare(
      `SELECT users.id, users.email, users.name
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`
    )
    .bind(tokenHash, nowIso())
    .first<{ id: string; email: string; name: string }>();
  return row ?? null;
}

export async function destroySession(db: D1Database, cookies: Cookies) {
  const token = cookies.get(SESSION_COOKIE);
  if (token) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  }
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function requireLogin(locals: App.Locals) {
  if (!locals.user) throw redirect(303, '/login');
  return locals.user;
}

export async function seedFirstUser(db: D1Database, email: string, name: string, password: string) {
  const existing = await db.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number }>();
  if ((existing?.count ?? 0) > 0) throw error(409, 'User pertama sudah ada.');
  const { hash, salt } = await hashPassword(password);
  const id = createId('usr');
  const now = nowIso();
  await db.batch([
    db.prepare('INSERT INTO users (id, email, name, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, email, name, hash, salt, now, now),
    db.prepare('INSERT INTO accounts (id, user_id, name, type, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(createId('acc'), id, 'Dompet Utama', 'cash', 'wallet', now, now),
    db.prepare('INSERT INTO app_settings (user_id, created_at, updated_at) VALUES (?, ?, ?)').bind(id, now, now)
  ]);
  return { id, email, name };
}
