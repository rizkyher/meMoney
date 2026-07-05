import { parseIndonesianDate } from '$lib/utils/date';
import { parseIDR } from '$lib/utils/money';

const preferredAmountKeywords = [
  'grand total',
  'total',
  'jumlah tagihan',
  'jumlah pembayaran',
  'total pembayaran',
  'nominal pembayaran',
  'amount due',
  'amount paid',
  'balance due'
];
const supportingAmountKeywords = ['nominal', 'pembayaran', 'transfer', 'amount', 'paid'];
const ignoredAmountKeywords = ['npwp', 'invoice #', 'invoice no', 'transaction id', 'id=', 'http', 'https'];
const secondaryAmountKeywords = ['sub total', 'subtotal', 'taxable', 'vat', 'ppn', 'pajak', 'administration fee', 'admin fee'];

export type ScanDraft = {
  type: 'income' | 'expense';
  amount: number;
  transaction_date: string;
  merchant: string | null;
  category_hint: string | null;
  note: string;
  confidence: number;
  raw: {
    amount_candidates: number[];
    date_candidates: string[];
  };
};

export function extractAmountCandidates(text: string) {
  const candidates = new Map<number, number>();
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (const [index, line] of lines.entries()) {
    const lower = line.toLowerCase();
    if (ignoredAmountKeywords.some((keyword) => lower.includes(keyword))) continue;

    const isSecondaryAmount = secondaryAmountKeywords.some((keyword) => lower.includes(keyword));
    const hasPreferredKeyword = !isSecondaryAmount && preferredAmountKeywords.some((keyword) => lower.includes(keyword));
    const hasSupportingKeyword = supportingAmountKeywords.some((keyword) => lower.includes(keyword));
    const matches = line.matchAll(/(?:rp|idr)\s*[0-9][0-9.,]*(?:,\d{2}|\.\d{2})?|[0-9]{1,3}(?:[.,][0-9]{3})+(?:,\d{2}|\.\d{2})?/gi);

    for (const match of matches) {
      const amount = parseIDR(match[0]);
      if (amount <= 0) continue;
      if (!hasPreferredKeyword && amount < 100) continue;

      const hasCurrency = /(?:rp|idr)/i.test(match[0]);
      const preferredScore = hasPreferredKeyword ? 1_000_000 : 0;
      const supportingScore = hasSupportingKeyword ? 100_000 : 0;
      const secondaryPenalty = isSecondaryAmount ? -50_000 : 0;
      const currencyScore = hasCurrency ? 10_000 : 0;
      const lineScore = Math.max(0, 1000 - index);
      const amountScore = Math.min(amount, 99_999_999) / 100_000_000;
      const score = preferredScore + supportingScore + secondaryPenalty + currencyScore + lineScore + amountScore;
      candidates.set(amount, Math.max(candidates.get(amount) ?? 0, score));
    }
  }

  return [...candidates.entries()]
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])
    .map(([value]) => value);
}

export function guessCategory(text: string) {
  const lower = text.toLowerCase();
  if (/makan|minum|resto|warung|kopi|coffee|ayam|nasi|bakso|mie/.test(lower)) return 'Makan & Minum';
  if (/gojek|grab|transport|bensin|parkir|tol|bus|kereta/.test(lower)) return 'Transportasi';
  if (/pulsa|internet|wifi|data|telkomsel|indihome/.test(lower)) return 'Internet';
  if (/tagihan|listrik|pdam|pln|pajak/.test(lower)) return 'Tagihan';
  if (/apotek|klinik|obat|dokter|hospital/.test(lower)) return 'Kesehatan';
  if (/buku|course|kursus|kelas|sekolah/.test(lower)) return 'Pendidikan';
  if (/cicilan|paylater|hutang|pinjaman/.test(lower)) return 'Cicilan/Hutang';
  if (/belanja|toko|mart|store|shopee|tokopedia|lazada/.test(lower)) return 'Belanja';
  return 'Lainnya';
}

export function guessType(text: string): 'income' | 'expense' {
  const lower = text.toLowerCase();
  if (/terima|masuk|credited|received|refund/.test(lower)) return 'income';
  if (/bayar|payment|debit|pembelian|transfer ke|paid/.test(lower)) return 'expense';
  return 'expense';
}

export function parseScanText(text: string, fallbackDate = new Date()): ScanDraft {
  const amountCandidates = extractAmountCandidates(text);
  const date = parseIndonesianDate(text, fallbackDate);
  const firstUsefulLine = text.split(/\n+/).map((line) => line.trim()).find((line) => /[A-Za-z]{3}/.test(line)) ?? null;
  const hasDate = date !== fallbackDate.toISOString().slice(0, 10);
  const amount = amountCandidates[0] ?? 0;
  const confidence = Math.min(0.95, (amount > 0 ? 0.45 : 0.1) + (hasDate ? 0.25 : 0.05) + (firstUsefulLine ? 0.15 : 0) + 0.1);

  return {
    type: guessType(text),
    amount,
    transaction_date: date,
    merchant: firstUsefulLine,
    category_hint: guessCategory(text),
    note: 'Parsed from screenshot',
    confidence,
    raw: {
      amount_candidates: amountCandidates.slice(0, 5),
      date_candidates: hasDate ? [date] : []
    }
  };
}
