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

  it('prefers invoice total over tax IDs and other large reference numbers', () => {
    const invoiceText = `Transaction Date Gateway Transaction ID Amount
02/07/2026 QRIS 7f6803cb-844a-4715-bba6-5efad5197961 Rp 807.495,00
Balance Rp 0,00
Invoice #2218565
NPWP: 80.820.685.8-542.000
Description Amount
Upgrade/Downgrade Options: Mailspace Max - unibiz.co.id
Rp 725.671,23
Administration Fee Rp 2.000,00
Sub Total Rp 727.671,23
Taxable Base Rp 665.198,63
VAT Rp 79.823,84
Total Rp 807.495,00`;

    const draft = parseScanText(invoiceText, new Date('2026-07-05T00:00:00.000Z'));
    expect(draft.amount).toBe(807495);
    expect(draft.raw.amount_candidates[0]).toBe(807495);
    expect(draft.raw.amount_candidates).not.toContain(80820685);
  });
});
