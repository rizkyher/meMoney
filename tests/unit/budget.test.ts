import { describe, expect, it } from 'vitest';
import { statusFor } from '../../src/lib/server/services/money.service';

describe('budget status', () => {
  it('marks safe, warning, and over', () => {
    expect(statusFor(100000, 50000)).toBe('safe');
    expect(statusFor(100000, 85000)).toBe('warning');
    expect(statusFor(100000, 100000)).toBe('over');
  });
});
