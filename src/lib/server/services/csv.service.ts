import { rowsToCsv } from '$lib/utils/csv';
import { listTransactions, sumTransactions } from '$lib/server/repositories/transactions.repo';
import { calculateRunningBalance, getBalanceBefore } from './money.service';

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
  const from = filters.from ?? '';
  const to = filters.to ?? '';
  const [openingBalance, income, expense, result, categories] = await Promise.all([
    from ? getBalanceBefore(db, userId, from) : Promise.resolve(0),
    from && to ? sumTransactions(db, userId, from, to, 'income') : Promise.resolve(0),
    from && to ? sumTransactions(db, userId, from, to, 'expense') : Promise.resolve(0),
    listTransactions(db, userId, filters),
    db
      .prepare(
        `SELECT
          COALESCE(categories.name, 'Lainnya') AS category,
          transactions.type AS type,
          COUNT(*) AS count,
          COALESCE(SUM(transactions.amount), 0) AS total
        FROM transactions
        LEFT JOIN categories ON categories.id = transactions.category_id
        WHERE transactions.user_id = ? AND transactions.deleted_at IS NULL
          AND (? = '' OR transactions.transaction_date >= ?)
          AND (? = '' OR transactions.transaction_date <= ?)
        GROUP BY category, transactions.type
        ORDER BY transactions.type ASC, total DESC`
      )
      .bind(userId, from, from, to, to)
      .all()
  ]);

  const transactions = (result.results as Record<string, unknown>[]).slice().reverse();
  let runningBalance = openingBalance;
  const rows = transactions.map((transaction, index) => {
    const type = String(transaction.type ?? '');
    const amount = Number(transaction.amount ?? 0);
    const direction = type === 'income' ? 1 : -1;
    runningBalance += amount * direction;
    return {
      no: index + 1,
      tanggal: transaction.transaction_date,
      tipe: typeLabels[type] ?? type,
      kategori: transaction.category_name ?? 'Lainnya',
      judul: transaction.title || transaction.merchant || '',
      merchant: transaction.merchant ?? '',
      catatan: transaction.note ?? '',
      pemasukan: type === 'income' ? amount : '',
      pengeluaran: type === 'expense' ? amount : '',
      nominal_bersih: amount * direction,
      saldo_berjalan: runningBalance,
      sumber: transaction.source === 'scan' ? 'Scan OCR' : 'Manual'
    };
  });

  const delimiter = ';';
  const closingBalance = calculateRunningBalance(openingBalance, income, expense);
  const summaryCsv = rowsToCsv(
    [
      { item: 'Periode mulai', nilai: from },
      { item: 'Periode selesai', nilai: to },
      { item: 'Saldo awal', nilai: openingBalance },
      { item: 'Total pemasukan', nilai: income },
      { item: 'Total pengeluaran', nilai: expense },
      { item: 'Arus kas bersih', nilai: income - expense },
      { item: 'Saldo akhir', nilai: closingBalance },
      { item: 'Jumlah transaksi', nilai: rows.length }
    ],
    {
      delimiter,
      columns: [
        { key: 'item', header: 'Ringkasan' },
        { key: 'nilai', header: 'Nilai' }
      ]
    }
  );
  const categoryRows = (categories.results as Record<string, unknown>[]).map((row) => ({
    tipe: typeLabels[String(row.type ?? '')] ?? String(row.type ?? ''),
    kategori: row.category,
    jumlah_transaksi: row.count,
    total: row.total
  }));
  const categoryCsv = rowsToCsv(categoryRows, {
    delimiter,
    columns: [
      { key: 'tipe', header: 'Tipe' },
      { key: 'kategori', header: 'Kategori' },
      { key: 'jumlah_transaksi', header: 'Jumlah Transaksi' },
      { key: 'total', header: 'Total' }
    ]
  });
  const detailCsv = rowsToCsv(rows, {
    delimiter: ';',
    columns: [
      { key: 'no', header: 'No' },
      { key: 'tanggal', header: 'Tanggal' },
      { key: 'tipe', header: 'Tipe' },
      { key: 'kategori', header: 'Kategori' },
      { key: 'judul', header: 'Judul' },
      { key: 'merchant', header: 'Merchant' },
      { key: 'catatan', header: 'Catatan' },
      { key: 'pemasukan', header: 'Pemasukan' },
      { key: 'pengeluaran', header: 'Pengeluaran' },
      { key: 'nominal_bersih', header: 'Nominal Bersih' },
      { key: 'saldo_berjalan', header: 'Saldo Berjalan' },
      { key: 'sumber', header: 'Sumber' }
    ]
  });

  return `\uFEFFsep=${delimiter}\r\nLaporan Rekap meMoney\r\n\r\n${summaryCsv}\r\n\r\nRekap Per Kategori\r\n${categoryCsv}\r\n\r\nDetail Transaksi\r\n${detailCsv}`;
}
