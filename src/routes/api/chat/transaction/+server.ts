import { getDb } from '$lib/server/db';
import { fail, ok, readJson, requireUser } from '$lib/server/api';
import { listCategories } from '$lib/server/repositories/categories.repo';
import { parseTransactionWithAi, type ChatCategory } from '$lib/server/services/transaction-chat.service';
import { transactionChatSchema } from '$lib/server/validators/chat.schema';
import { toDateInput } from '$lib/utils/date';

export async function POST(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const parsed = await readJson(event, transactionChatSchema);
  if (parsed.error) return parsed.error;

  const categories = await listCategories(getDb(event.platform), user.id);
  const draft = await parseTransactionWithAi(event.platform?.env?.AI, parsed.value.message, categories.results as ChatCategory[], parsed.value.today ?? toDateInput());
  if (draft.amount <= 0) return fail('NO_AMOUNT', 'Nominal belum terbaca. Coba tulis seperti "makan bakso 20k".', 422);
  return ok(draft);
}
