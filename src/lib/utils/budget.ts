export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';
export type BudgetMode = 'manual' | 'auto';

export type BudgetRow = {
  period: BudgetPeriod;
  amount: number;
  mode: BudgetMode;
};

const periodDays: Record<BudgetPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30
};

const periodLabels: Record<BudgetPeriod, string> = {
  daily: 'harian',
  weekly: 'mingguan',
  monthly: 'bulanan'
};

export function calculateBudgetAmount(sourceAmount: number, sourcePeriod: BudgetPeriod, targetPeriod: BudgetPeriod) {
  if (sourceAmount <= 0) return 0;
  const dailyAmount = sourceAmount / periodDays[sourcePeriod];
  return Math.round(dailyAmount * periodDays[targetPeriod]);
}

export function resolveAutoBudgetRows(rows: BudgetRow[], preferredSource?: BudgetPeriod) {
  const source =
    (preferredSource ? rows.find((row) => row.period === preferredSource && row.mode === 'manual' && row.amount > 0) : undefined) ??
    rows.find((row) => row.mode === 'manual' && row.amount > 0);

  if (!source) {
    return rows.map((row) => (row.mode === 'auto' ? { ...row, amount: 0 } : row));
  }

  return rows.map((row) =>
    row.mode === 'auto'
      ? {
          ...row,
          amount: calculateBudgetAmount(source.amount, source.period, row.period)
        }
      : row
  );
}

export function budgetFormulaLabel(sourcePeriod: BudgetPeriod, targetPeriod: BudgetPeriod) {
  if (sourcePeriod === targetPeriod) return 'Manual';
  const sourceDays = periodDays[sourcePeriod];
  const targetDays = periodDays[targetPeriod];
  if (targetDays > sourceDays) return `${targetDays / sourceDays}x dari jatah ${periodLabels[sourcePeriod]}`;
  return `${sourceDays / targetDays}x lebih kecil dari jatah ${periodLabels[sourcePeriod]}`;
}
