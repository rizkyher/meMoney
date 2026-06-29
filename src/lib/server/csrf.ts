import { fail } from './api';
import type { RequestEvent } from '@sveltejs/kit';

const CSRF_COOKIE = 'uang_csrf';

export function ensureCsrf(event: RequestEvent) {
  let token = event.cookies.get(CSRF_COOKIE);
  if (!token) {
    token = crypto.randomUUID();
    event.cookies.set(CSRF_COOKIE, token, {
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
  }
  event.locals.csrfToken = token;
  return token;
}

export function validateCsrf(event: RequestEvent) {
  const method = event.request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;
  const cookie = event.cookies.get(CSRF_COOKIE);
  const header = event.request.headers.get('x-csrf-token');
  if (!cookie || !header || cookie !== header) return fail('CSRF_INVALID', 'Sesi form sudah tidak valid. Muat ulang halaman lalu coba lagi.', 403);
  return null;
}
