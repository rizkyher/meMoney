import { describe, expect, it } from 'vitest';
import { statusFor } from '../../src/lib/server/services/money.service';
import { calculateBudgetAmount, resolveAutoBudgetRows } from '../../src/lib/utils/budget';

describe('budget status', () => {
  it('marks safe, warning, and over', () => {
    expect(statusFor(100000, 50000)).toBe('safe');
    expect(statusFor(100000, 85000)).toBe('warning');
    expect(statusFor(100000, 100000)).toBe('over');
  });

  it('converts a daily allowance into weekly and monthly budgets', () => {
    expect(calculateBudgetAmount(50000, 'daily', 'weekly')).toBe(350000);
    expect(calculateBudgetAmount(50000, 'daily', 'monthly')).toBe(1500000);
  });

  it('converts manual weekly or monthly budgets back into other periods', () => {
    expect(calculateBudgetAmount(350000, 'weekly', 'daily')).toBe(50000);
    expect(calculateBudgetAmount(1500000, 'monthly', 'weekly')).toBe(350000);
  });

  it('updates auto rows from the preferred manual source', () => {
    const rows = resolveAutoBudgetRows(
      [
        { period: 'daily', amount: 50000, mode: 'manual' },
        { period: 'weekly', amount: 700000, mode: 'manual' },
        { period: 'monthly', amount: 0, mode: 'auto' }
      ],
      'weekly'
    );

    expect(rows.find((row) => row.period === 'monthly')?.amount).toBe(3000000);
  });
});
