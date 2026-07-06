import { parseIndonesianDate, toDateInput } from '$lib/utils/date';
import { parseIDR } from '$lib/utils/money';

export type ChatCategory = {
  id: string;
  name: string;
  type: string;
};

export type TransactionChatDraft = {
  type: 'income' | 'expense';
  amount: number;
  transaction_date: string;
  title: string;
  note: string;
  category_id: string | null;
  category_hint: string;
  confidence: number;
  source: 'ai' | 'fallback';
};

const incomeWords = /\b(gaji|bonus|dibayar|bayaran|terima|masuk|refund|cashback|jual|penjualan|freelance|fee)\b/i;
const expenseWords = /\b(beli|bayar|makan|minum|jajan|topup|isi|belanja|transport|grab|gojek|bensin|parkir|tagihan)\b/i;

const categoryHints: Array<[RegExp, string]> = [
  [/\b(makan|minum|bakso|mie|ayam|nasi|kopi|coffee|resto|warung|jajan)\b/i, 'Makan & Minum'],
  [/\b(baju|celana|sepatu|tas|belanja|toko|mall|shopee|tokopedia|lazada)\b/i, 'Belanja'],
  [/\b(gojek|grab|transport|bensin|parkir|tol|bus|kereta)\b/i, 'Transportasi'],
  [/\b(internet|wifi|pulsa|data|telkomsel|indihome)\b/i, 'Internet'],
  [/\b(listrik|pdam|tagihan|pln|pajak)\b/i, 'Tagihan'],
  [/\b(obat|dokter|klinik|apotek|rumah sakit)\b/i, 'Kesehatan'],
  [/\b(buku|kursus|kelas|sekolah|kuliah)\b/i, 'Pendidikan'],
  [/\b(gaji|salary)\b/i, 'Gaji'],
  [/\b(freelance|fee|project|proyek)\b/i, 'Freelance'],
  [/\b(bonus)\b/i, 'Bonus'],
  [/\b(refund|cashback)\b/i, 'Refund'],
  [/\b(jual|penjualan)\b/i, 'Jual Barang']
];

function normalizeAmountToken(raw: string) {
  const clean = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  const numberPart = clean.match(/\d+(?:[.,]\d+)?/)?.[0] ?? '';
  if (!numberPart) return 0;
  const value = Number(numberPart.replace(',', '.'));
  if (!Number.isFinite(value)) return 0;
  if (/(k|rb|ribu)\b/.test(clean)) return Math.round(value * 1_000);
  if (/(jt|juta)\b/.test(clean)) return Math.round(value * 1_000_000);
  if (/rp|idr|\d{1,3}(?:[.,]\d{3})+/.test(clean)) return parseIDR(clean);
  return Math.round(value);
}

export function extractNaturalAmount(text: string) {
  const compact = text.replace(/(\d)\s+(k|rb|ribu|jt|juta)\b/gi, '$1 $2');
  const matches = compact.matchAll(/\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta)\b|(?:rp|idr)\s*\d+(?:[.,]\d+)?|\d{1,3}(?:[.,]\d{3})+(?:,\d{2})?|\b\d{4,}\b/gi);
  const amounts = [...matches].map((match) => normalizeAmountToken(match[0])).filter((amount) => amount > 0);
  return amounts[0] ?? 0;
}

export function guessTransactionType(text: string): 'income' | 'expense' {
  if (incomeWords.test(text) && !expenseWords.test(text)) return 'income';
  return 'expense';
}

export function guessCategoryName(text: string, type: 'income' | 'expense') {
  for (const [pattern, name] of categoryHints) {
    if (pattern.test(text)) return name;
  }
  return type === 'income' ? 'Lainnya' : 'Lainnya';
}

export function findCategoryId(categories: ChatCategory[], type: 'income' | 'expense', hint: string) {
  const normalized = hint.toLowerCase();
  return categories.find((category) => category.type === type && category.name.toLowerCase() === normalized)?.id ?? null;
}

function cleanTitle(text: string) {
  return text
    .replace(/(?:rp|idr)?\s*\d+(?:[.,]\d+)?(?:\s*(?:k|rb|ribu|jt|juta))?/gi, '')
    .replace(/\b(hari ini|kemarin|besok|tanggal|tgl)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function fallbackParseTransactionMessage(text: string, categories: ChatCategory[], today = toDateInput()): TransactionChatDraft {
  const fallbackDate = new Date(`${today}T00:00:00.000Z`);
  const type = guessTransactionType(text);
  const amount = extractNaturalAmount(text);
  const category_hint = guessCategoryName(text, type);
  const title = cleanTitle(text) || (type === 'income' ? 'Uang masuk' : 'Uang keluar');
  return {
    type,
    amount,
    transaction_date: parseIndonesianDate(text, fallbackDate),
    title,
    note: text,
    category_id: findCategoryId(categories, type, category_hint),
    category_hint,
    confidence: amount > 0 ? 0.72 : 0.35,
    source: 'fallback'
  };
}

function extractJsonObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function parseTransactionWithAi(ai: Ai | undefined, text: string, categories: ChatCategory[], today = toDateInput()) {
  const fallback = fallbackParseTransactionMessage(text, categories, today);
  if (!ai) return fallback;

  const categoryList = categories.map((category) => `${category.type}:${category.name}`).join(', ');
  const prompt = `Ubah kalimat user menjadi JSON transaksi. Balas hanya JSON valid tanpa markdown.
Schema: {"type":"income|expense","amount":number,"title":string,"category_hint":string,"transaction_date":"YYYY-MM-DD","note":string,"confidence":number}
Hari ini: ${today}
Kategori tersedia: ${categoryList}
Aturan:
- "20k", "20 rb", "20 ribu" = 20000.
- "1,5 juta" = 1500000.
- Jika belanja/makan/bayar/beli berarti expense.
- Jika gaji/bonus/refund/jual/freelance berarti income.
- Gunakan kategori paling cocok dari daftar.
Kalimat user: ${text}`;

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'Kamu parser transaksi keuangan pribadi Indonesia. Output harus JSON saja.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 220
    });
    const response = typeof result === 'object' && result && 'response' in result ? String(result.response) : '';
    const parsed = extractJsonObject(response);
    if (!parsed) return fallback;

    const type = parsed.type === 'income' ? 'income' : parsed.type === 'expense' ? 'expense' : fallback.type;
    const amount = Number.isFinite(Number(parsed.amount)) && Number(parsed.amount) > 0 ? Math.round(Number(parsed.amount)) : fallback.amount;
    const category_hint = typeof parsed.category_hint === 'string' && parsed.category_hint.trim() ? parsed.category_hint.trim() : fallback.category_hint;
    const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : fallback.title;
    const transaction_date = /^\d{4}-\d{2}-\d{2}$/.test(String(parsed.transaction_date)) ? String(parsed.transaction_date) : fallback.transaction_date;

    return {
      type,
      amount,
      transaction_date,
      title,
      note: text,
      category_id: findCategoryId(categories, type, category_hint),
      category_hint,
      confidence: Math.max(0.2, Math.min(0.95, Number(parsed.confidence) || 0.82)),
      source: 'ai' as const
    };
  } catch {
    return fallback;
  }
}
