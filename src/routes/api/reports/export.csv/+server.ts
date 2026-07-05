import { getDb } from '$lib/server/db';
import { fail, requireUser } from '$lib/server/api';
import { exportTransactionsCsv } from '$lib/server/services/csv.service';
import { getMonthRange } from '$lib/utils/date';

export async function GET(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const fallback = getMonthRange();
  const csv = await exportTransactionsCsv(getDb(event.platform), user.id, {
    from: event.url.searchParams.get('from') ?? fallback.from,
    to: event.url.searchParams.get('to') ?? fallback.to
  });
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="memoney-transaksi-${event.url.searchParams.get('from') ?? fallback.from}-${event.url.searchParams.get('to') ?? fallback.to}.csv"`
    }
  });
}
