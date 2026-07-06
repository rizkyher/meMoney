import { describe, expect, it } from 'vitest';
import { getMonthRange, getTodayRange, getWeekRange, parseIndonesianDate, toDateInput } from '../../src/lib/utils/date';

describe('date utils', () => {
  it('parses Indonesian numeric dates', () => {
    expect(parseIndonesianDate('Tanggal 29/06/2026')).toBe('2026-06-29');
  });

  it('parses Indonesian named dates', () => {
    expect(parseIndonesianDate('29 Juni 2026')).toBe('2026-06-29');
  });

  it('formats today using Asia/Jakarta instead of UTC', () => {
    const lateUtc = new Date('2026-07-06T17:30:00.000Z');
    expect(toDateInput(lateUtc)).toBe('2026-07-07');
    expect(getTodayRange(lateUtc)).toEqual({ from: '2026-07-07', to: '2026-07-07' });
  });

  it('builds month and week ranges from the Jakarta calendar date', () => {
    const lateUtc = new Date('2026-06-30T17:30:00.000Z');
    expect(getMonthRange(lateUtc)).toEqual({ from: '2026-07-01', to: '2026-07-31' });
    expect(getWeekRange(lateUtc)).toEqual({ from: '2026-06-29', to: '2026-07-05' });
  });
});
