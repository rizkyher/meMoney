import { describe, expect, it } from 'vitest';
import { extractAmountCandidates, guessCategory, parseScanText } from '../../src/lib/server/services/scan-parser.service';

describe('scan parser', () => {
  it('extracts amount candidates with total priority', () => {
    expect(extractAmountCandidates('Subtotal Rp20.000\nTOTAL Rp45.000')[0]).toBe(45000);
  });

  it('guesses category from keywords', () => {
    expect(guessCategory('Warung nasi ayam bakar')).toBe('Makan & Minum');
  });

  it('creates a draft transaction', () => {
    const draft = parseScanText('TOKO ABC\nTOTAL Rp 45.000\n29/06/2026');
    expect(draft.amount).toBe(45000);
    expect(draft.transaction_date).toBe('2026-06-29');
    expect(draft.type).toBe('expense');
  });
});
