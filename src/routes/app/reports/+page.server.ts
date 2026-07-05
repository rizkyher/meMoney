import { getDb } from '$lib/server/db';
import { sumTransactions, listTransactions } from '$lib/server/repositories/transactions.repo';
import { calculateRunningBalance, getBalanceBefore } from '$lib/server/services/money.service';
import { getMonthRange } from '$lib/utils/date';

export async function load({ platform, parent, url }) {
  const { user } = await parent();
  const fallback = getMonthRange();
  const from = url.searchParams.get('from') ?? fallback.from;
  const to = url.searchParams.get('to') ?? fallback.to;
  const db = getDb(platform);
  const [openingBalance, income, expense, transactions] = await Promise.all([
    getBalanceBefore(db, user.id, from),
    sumTransactions(db, user.id, from, to, 'income'),
    sumTransactions(db, user.id, from, to, 'expense'),
    listTransactions(db, user.id, { from, to })
  ]);
  return { from, to, openingBalance, income, expense, closingBalance: calculateRunningBalance(openingBalance, income, expense), transactions: transactions.results };
}
