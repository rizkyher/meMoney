import { json, type RequestEvent } from '@sveltejs/kit';
import { ZodError } from 'zod';

export function ok<T>(data: T, init?: ResponseInit) {
  return json({ ok: true, data }, init);
}

export function fail(code: string, message: string, status = 400, fields?: Record<string, string>) {
  return json({ ok: false, error: { code, message, fields } }, { status });
}

export function zodFail(error: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) fields[issue.path.join('.') || 'form'] = issue.message;
  return fail('VALIDATION_ERROR', 'Data belum lengkap atau belum valid.', 422, fields);
}

export function requireUser(event: RequestEvent) {
  if (!event.locals.user) return null;
  return event.locals.user;
}

export async function readJson<T>(event: RequestEvent, schema: { parse: (input: unknown) => T }) {
  try {
    return { value: schema.parse(await event.request.json()) };
  } catch (error) {
    if (error instanceof ZodError) return { error: zodFail(error) };
    return { error: fail('BAD_JSON', 'Request JSON tidak bisa dibaca.', 400) };
  }
}
