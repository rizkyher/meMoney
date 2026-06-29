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
