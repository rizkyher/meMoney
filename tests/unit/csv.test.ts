import { describe, expect, it } from 'vitest';
import { rowsToCsv } from '../../src/lib/utils/csv';

describe('csv utils', () => {
  it('exports excel-friendly CSV with stable headers and semicolon delimiter', () => {
    const csv = rowsToCsv(
      [{ tanggal: '2026-06-30', judul: 'Kopi, susu', nominal: -25000 }],
      {
        delimiter: ';',
        excel: true,
        columns: [
          { key: 'tanggal', header: 'Tanggal' },
          { key: 'judul', header: 'Judul' },
          { key: 'nominal', header: 'Nominal' }
        ]
      }
    );

    expect(csv).toContain('sep=;');
    expect(csv).toContain('Tanggal;Judul;Nominal');
    expect(csv).toContain('2026-06-30;Kopi, susu;-25000');
  });
});
