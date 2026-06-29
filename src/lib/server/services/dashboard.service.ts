import { getMonthRange, getTodayRange } from '$lib/utils/date';
import { percentage } from '$lib/utils/money';
import { sumTransactions, listTransactions } from '$lib/server/repositories/transactions.repo';
import { calculateBudgetStatus } from './money.service';

export async function getDashboard(db: D1Database, user: { id: string; name: string }) {
  const today = getTodayRange();
  const month = getMonthRange();
  const [todayExpense, monthIncome, monthExpense, dailyBudget, weeklyBudget, monthlyBudget, goals, emergency, recent] = await Promise.all([
    sumTransactions(db, user.id, today.from, today.to, 'expense'),
    sumTransactions(db, user.id, month.from, month.to, 'income'),
    sumTransactions(db, user.id, month.from, month.to, 'expense'),
    calculateBudgetStatus(db, user.id, 'daily'),
    calculateBudgetStatus(db, user.id, 'weekly'),
    calculateBudgetStatus(db, user.id, 'monthly'),
    db.prepare("SELECT COALESCE(SUM(current_amount), 0) AS current, COALESCE(SUM(target_amount), 0) AS target FROM savings_goals WHERE user_id = ? AND type = 'saving' AND archived = 0").bind(user.id).first<{ current: number; target: number }>(),
    db.prepare("SELECT COALESCE(SUM(current_amount), 0) AS current, COALESCE(SUM(target_amount), 0) AS target FROM savings_goals WHERE user_id = ? AND type = 'emergency' AND archived = 0").bind(user.id).first<{ current: number; target: number }>(),
    listTransactions(db, user.id, { from: month.from, to: month.to })
  ]);

  return {
    greeting: `Selamat datang, ${user.name}`,
    todayExpense,
    monthIncome,
    monthExpense,
    netCashflow: monthIncome - monthExpense,
    dailyBudget,
    weeklyBudget,
    monthlyBudget,
    savings: { current: goals?.current ?? 0, target: goals?.target ?? 0, percentage: percentage(goals?.current ?? 0, goals?.target ?? 0) },
    emergency: { current: emergency?.current ?? 0, target: emergency?.target ?? 0, percentage: percentage(emergency?.current ?? 0, emergency?.target ?? 0) },
    recent: recent.results.slice(0, 8)
  };
}
