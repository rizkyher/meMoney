import { getDb } from '$lib/server/db';
import { ok, fail, readJson, requireUser } from '$lib/server/api';
import { archiveGoal, createGoal, listGoals, addMovement, updateGoal } from '$lib/server/repositories/goals.repo';
import { goalSchema, movementSchema } from '$lib/server/validators/goal.schema';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const type = event.url.searchParams.get('type');
  return ok(await listGoals(getDb(event.platform), user.id, type === 'emergency' ? 'emergency' : type === 'saving' ? 'saving' : undefined));
}

export async function POST(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const action = event.url.searchParams.get('action');
  if (action === 'movement') {
    const parsed = await readJson(event, movementSchema);
    if (parsed.error) return parsed.error;
    await addMovement(getDb(event.platform), user.id, parsed.value);
    return ok({ saved: true });
  }
  const parsed = await readJson(event, goalSchema);
  if (parsed.error) return parsed.error;
  return ok(await createGoal(getDb(event.platform), user.id, parsed.value), { status: 201 });
}

export async function PATCH(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const id = event.url.searchParams.get('id');
  if (!id) return fail('VALIDATION_ERROR', 'ID goal wajib dikirim.', 422);
  const parsed = await readJson(event, goalSchema);
  if (parsed.error) return parsed.error;
  const goal = await updateGoal(getDb(event.platform), user.id, id, parsed.value);
  return goal ? ok(goal) : fail('NOT_FOUND', 'Goal tidak ditemukan.', 404);
}

export async function DELETE(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const id = event.url.searchParams.get('id');
  if (!id) return fail('VALIDATION_ERROR', 'ID goal wajib dikirim.', 422);
  await archiveGoal(getDb(event.platform), user.id, id);
  return ok({ deleted: true });
}
