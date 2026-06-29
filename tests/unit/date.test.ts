import { describe, expect, it } from 'vitest';
import { parseIndonesianDate } from '../../src/lib/utils/date';

describe('date utils', () => {
  it('parses Indonesian numeric dates', () => {
    expect(parseIndonesianDate('Tanggal 29/06/2026')).toBe('2026-06-29');
  });

  it('parses Indonesian named dates', () => {
    expect(parseIndonesianDate('29 Juni 2026')).toBe('2026-06-29');
  });
});
