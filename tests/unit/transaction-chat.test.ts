import { describe, expect, it } from 'vitest';
import { extractNaturalAmount, fallbackParseTransactionMessage } from '../../src/lib/server/services/transaction-chat.service';

const categories = [
  { id: 'food', name: 'Makan & Minum', type: 'expense' },
  { id: 'shopping', name: 'Belanja', type: 'expense' },
  { id: 'salary', name: 'Gaji', type: 'income' }
];

describe('transaction chat parser', () => {
  it('parses compact Indonesian amounts', () => {
    expect(extractNaturalAmount('makan bakso 20k')).toBe(20000);
    expect(extractNaturalAmount('beli baju 100 ribu')).toBe(100000);
    expect(extractNaturalAmount('gaji freelance 1,5 juta')).toBe(1500000);
  });

  it('creates an expense draft from natural language', () => {
    const draft = fallbackParseTransactionMessage('makan bakso 20k', categories, '2026-07-06');
    expect(draft.type).toBe('expense');
    expect(draft.amount).toBe(20000);
    expect(draft.category_id).toBe('food');
    expect(draft.title).toContain('makan bakso');
  });

  it('detects shopping category from casual text', () => {
    const draft = fallbackParseTransactionMessage('beli baju 100 ribu', categories, '2026-07-06');
    expect(draft.amount).toBe(100000);
    expect(draft.category_id).toBe('shopping');
  });
});
