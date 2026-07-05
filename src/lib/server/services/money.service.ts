import { getMonthRange, getTodayRange, getWeekRange } from '$lib/utils/date';
import { percentage } from '$lib/utils/money';
import { sumTransactions } from '$lib/server/repositories/transactions.repo';

export type BudgetStatus = {
  period: 'daily' | 'weekly' | 'monthly';
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'over';
};

export function statusFor(budget: number, spent: number): BudgetStatus['status'] {
  if (budget <= 0) return 'safe';
  const ratio = spent / budget;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'safe';
}

export function calculateRunningBalance(openingBalance: number, income: number, expense: number) {
  return openingBalance + income - expense;
}

export async function getBalanceBefore(db: D1Database, userId: string, beforeDate: string) {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(
        CASE
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          ELSE 0
        END
      ), 0) AS balance
      FROM transactions
      WHERE user_id = ? AND deleted_at IS NULL AND transaction_date < ?`
    )
    .bind(userId, beforeDate)
    .first<{ balance: number }>();
  return row?.balance ?? 0;
}

export async function calculateBudgetStatus(db: D1Database, userId: string, period: 'daily' | 'weekly' | 'monthly') {
  const range = period === 'daily' ? getTodayRange() : period === 'weekly' ? getWeekRange() : getMonthRange();
  const spent = await sumTransactions(db, userId, range.from, range.to, 'expense');
  const budget = await db.prepare('SELECT amount FROM budgets WHERE user_id = ? AND period = ? LIMIT 1').bind(userId, period).first<{ amount: number }>();
  const amount = budget?.amount ?? 0;
  return {
    period,
    budget: amount,
    spent,
    remaining: amount - spent,
    percentage: percentage(spent, amount),
    status: statusFor(amount, spent)
  };
}
