import { redirect, type Handle } from '@sveltejs/kit';
import { getSessionUser } from '$lib/server/auth';
import { ensureCsrf, validateCsrf } from '$lib/server/csrf';
import { fail } from '$lib/server/api';

export const handle: Handle = async ({ event, resolve }) => {
  ensureCsrf(event);

  if (event.platform?.env.DB) {
    event.locals.user = await getSessionUser(event.platform.env.DB, event.cookies);
  } else {
    event.locals.user = null;
  }

  const pathname = event.url.pathname;
  const isApi = pathname.startsWith('/api/');
  const isPublicApi = pathname === '/api/auth/login';

  if (isApi && !isPublicApi) {
    if (!event.locals.user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
    const csrfError = validateCsrf(event);
    if (csrfError) return csrfError;
  }

  if (pathname.startsWith('/app') && !event.locals.user) {
    throw redirect(303, '/login');
  }

  if (pathname === '/' && event.locals.user) {
    throw redirect(303, '/app/dashboard');
  }

  return resolve(event);
};
