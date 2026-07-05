import { describe, expect, it } from 'vitest';
import { calculateRunningBalance } from '../../src/lib/server/services/money.service';
import { formatIDR, formatIDRInput, parseIDR, percentage } from '../../src/lib/utils/money';

describe('money utils', () => {
  it('formats IDR without decimals', () => {
    expect(formatIDR(25000)).toContain('25.000');
  });

  it('parses common rupiah strings', () => {
    expect(parseIDR('Rp25.000')).toBe(25000);
    expect(parseIDR('IDR 25,000')).toBe(25000);
    expect(parseIDR('25.000,00')).toBe(25000);
  });

  it('formats money input without currency label', () => {
    expect(formatIDRInput(25000)).toBe('25.000');
    expect(formatIDRInput('Rp 1.250.000')).toBe('1.250.000');
  });

  it('calculates percentage safely', () => {
    expect(percentage(50, 100)).toBe(50);
    expect(percentage(50, 0)).toBe(0);
  });

  it('carries previous balance into the current period', () => {
    expect(calculateRunningBalance(100_000, 250_000, 75_000)).toBe(275_000);
    expect(calculateRunningBalance(-25_000, 100_000, 125_000)).toBe(-50_000);
  });
});
