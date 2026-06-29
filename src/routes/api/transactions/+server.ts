import { getDb } from '$lib/server/db';
import { ok, fail, readJson, requireUser, zodFail } from '$lib/server/api';
import { createTransaction, listTransactions } from '$lib/server/repositories/transactions.repo';
import { transactionQuerySchema, transactionSchema } from '$lib/server/validators/transaction.schema';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const query = transactionQuerySchema.safeParse(Object.fromEntries(event.url.searchParams));
  if (!query.success) return zodFail(query.error);
  return ok(await listTransactions(getDb(event.platform), user.id, query.data));
}

export async function POST(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const parsed = await readJson(event, transactionSchema);
  if (parsed.error) return parsed.error;
  if (!['income', 'expense'].includes(parsed.value.type) && parsed.value.source === 'manual') {
    return fail('INVALID_TYPE', 'Transaksi manual cepat hanya untuk uang masuk atau uang keluar.', 422);
  }
  return ok(await createTransaction(getDb(event.platform), user.id, parsed.value), { status: 201 });
}
