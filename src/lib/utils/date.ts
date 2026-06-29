const monthMap: Record<string, number> = {
  jan: 1,
  januari: 1,
  feb: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  may: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  agu: 8,
  agustus: 8,
  aug: 8,
  sep: 9,
  september: 9,
  okt: 10,
  oktober: 10,
  oct: 10,
  nov: 11,
  november: 11,
  des: 12,
  desember: 12,
  dec: 12
};

export function toDateInput(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function parseIndonesianDate(text: string, fallback = new Date()) {
  const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;

  const numeric = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if (numeric) return `${numeric[3]}-${numeric[2].padStart(2, '0')}-${numeric[1].padStart(2, '0')}`;

  const named = text.toLowerCase().match(/\b(\d{1,2})\s+([a-zA-Z]+)\s+(20\d{2})\b/);
  if (named) {
    const month = monthMap[named[2]];
    if (month) return `${named[3]}-${String(month).padStart(2, '0')}-${named[1].padStart(2, '0')}`;
  }

  return toDateInput(fallback);
}

export function getMonthRange(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return { from: toDateInput(start), to: toDateInput(end) };
}

export function getTodayRange(date = new Date()) {
  const day = toDateInput(date);
  return { from: day, to: day };
}

export function getWeekRange(date = new Date(), weekStartsOn: 'monday' | 'sunday' = 'monday') {
  const current = new Date(date);
  const day = current.getDay();
  const startOffset = weekStartsOn === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  const start = new Date(current);
  start.setDate(current.getDate() + startOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: toDateInput(start), to: toDateInput(end) };
}
