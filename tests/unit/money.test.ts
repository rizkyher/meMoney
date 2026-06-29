import { describe, expect, it } from 'vitest';
import { formatIDR, parseIDR, percentage } from '../../src/lib/utils/money';

describe('money utils', () => {
  it('formats IDR without decimals', () => {
    expect(formatIDR(25000)).toContain('25.000');
  });

  it('parses common rupiah strings', () => {
    expect(parseIDR('Rp25.000')).toBe(25000);
    expect(parseIDR('IDR 25,000')).toBe(25000);
    expect(parseIDR('25.000,00')).toBe(25000);
  });

  it('calculates percentage safely', () => {
    expect(percentage(50, 100)).toBe(50);
    expect(percentage(50, 0)).toBe(0);
  });
});
