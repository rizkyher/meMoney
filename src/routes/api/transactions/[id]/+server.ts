import { getDb } from '$lib/server/db';
import { ok, fail, readJson, requireUser } from '$lib/server/api';
import { deleteTransaction, getTransaction, updateTransaction } from '$lib/server/repositories/transactions.repo';
import { transactionSchema } from '$lib/server/validators/transaction.schema';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const transaction = await getTransaction(getDb(event.platform), user.id, event.params.id);
  return transaction ? ok(transaction) : fail('NOT_FOUND', 'Transaksi tidak ditemukan.', 404);
}

export async function PATCH(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const parsed = await readJson(event, transactionSchema);
  if (parsed.error) return parsed.error;
  return ok(await updateTransaction(getDb(event.platform), user.id, event.params.id, parsed.value));
}

export async function DELETE(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  await deleteTransaction(getDb(event.platform), user.id, event.params.id);
  return ok({ deleted: true });
}
