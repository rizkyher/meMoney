import { parseIndonesianDate } from '$lib/utils/date';
import { parseIDR } from '$lib/utils/money';

const amountKeywords = ['grand total', 'total', 'jumlah', 'nominal', 'pembayaran', 'transfer', 'amount'];

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
  const candidates = new Set<number>();
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    const weight = amountKeywords.some((keyword) => lower.includes(keyword)) ? 2 : 1;
    const matches = line.matchAll(/(?:rp|idr)?\s*([0-9]{1,3}(?:[.,][0-9]{3})+(?:,\d{2})?|[0-9]{4,})/gi);
    for (const match of matches) {
      const amount = parseIDR(match[0]);
      if (amount > 0) {
        candidates.add(amount);
        if (weight > 1) candidates.add(amount + 0.1);
      }
    }
  }

  return [...candidates]
    .sort((a, b) => b - a)
    .map((value) => Math.floor(value))
    .filter((value, index, arr) => arr.indexOf(value) === index);
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
