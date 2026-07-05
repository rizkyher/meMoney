export type CsvColumn<T extends Record<string, unknown>> = {
  key: keyof T | string;
  header: string;
};

export function csvEscape(value: unknown, delimiter = ',') {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes('\n') || text.includes('\r') || text.includes(delimiter)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv<T extends Record<string, unknown>>(rows: T[], options: { columns?: CsvColumn<T>[]; delimiter?: string; excel?: boolean } = {}) {
  const delimiter = options.delimiter ?? ',';
  const columns = options.columns ?? Object.keys(rows[0] ?? {}).map((key) => ({ key, header: key }));
  const lines = [
    columns.map((column) => csvEscape(column.header, delimiter)).join(delimiter),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column.key], delimiter)).join(delimiter))
  ];
  const body = lines.join('\r\n');
  return options.excel ? `\uFEFFsep=${delimiter}\r\n${body}` : body;
}
