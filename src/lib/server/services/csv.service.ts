import { rowsToCsv } from '$lib/utils/csv';
import { listTransactions } from '$lib/server/repositories/transactions.repo';

const typeLabels: Record<string, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  transfer: 'Transfer',
  savings_deposit: 'Setoran Tabungan',
  savings_withdrawal: 'Tarik Tabungan',
  emergency_deposit: 'Setoran Dana Tak Terduga',
  emergency_withdrawal: 'Tarik Dana Tak Terduga'
};

export async function exportTransactionsCsv(db: D1Database, userId: string, filters: { from?: string; to?: string }) {
  const result = await listTransactions(db, userId, filters);
  const rows = (result.results as Record<string, unknown>[]).map((transaction) => {
    const type = String(transaction.type ?? '');
    const amount = Number(transaction.amount ?? 0);
    const direction = type === 'income' ? 1 : -1;
    return {
      tanggal: transaction.transaction_date,
      jenis: typeLabels[type] ?? type,
      judul: transaction.title,
      merchant: transaction.merchant,
      catatan: transaction.note,
      nominal: amount * direction,
      sumber: transaction.source === 'scan' ? 'Scan OCR' : 'Manual'
    };
  });

  return rowsToCsv(rows, {
    delimiter: ';',
    excel: true,
    columns: [
      { key: 'tanggal', header: 'Tanggal' },
      { key: 'jenis', header: 'Jenis' },
      { key: 'judul', header: 'Judul' },
      { key: 'merchant', header: 'Merchant' },
      { key: 'catatan', header: 'Catatan' },
      { key: 'nominal', header: 'Nominal' },
      { key: 'sumber', header: 'Sumber' }
    ]
  });
}
