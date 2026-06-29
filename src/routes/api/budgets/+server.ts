import { getDb } from '$lib/server/db';
import { ok, fail, readJson, requireUser } from '$lib/server/api';
import { listBudgets, upsertBudgets } from '$lib/server/repositories/budgets.repo';
import { budgetsSchema } from '$lib/server/validators/budget.schema';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  return ok(await listBudgets(getDb(event.platform), user.id));
}

export async function PUT(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const parsed = await readJson(event, budgetsSchema);
  if (parsed.error) return parsed.error;
  return ok(await upsertBudgets(getDb(event.platform), user.id, parsed.value.budgets));
}
