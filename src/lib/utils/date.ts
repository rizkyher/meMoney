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

export const APP_TIME_ZONE = 'Asia/Jakarta';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function getZonedParts(date: Date, timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day)
  };
}

function fromUtcDateOnly(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date: Date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function toDateInput(date = new Date()) {
  const parts = getZonedParts(date);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
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
  const { year, month } = getZonedParts(date);
  const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${year}-${pad2(month)}-01`, to: `${year}-${pad2(month)}-${pad2(endDay)}` };
}

export function getTodayRange(date = new Date()) {
  const day = toDateInput(date);
  return { from: day, to: day };
}

export function getWeekRange(date = new Date(), weekStartsOn: 'monday' | 'sunday' = 'monday') {
  const currentParts = getZonedParts(date);
  const current = fromUtcDateOnly(currentParts.year, currentParts.month, currentParts.day);
  const day = current.getUTCDay();
  const startOffset = weekStartsOn === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  const start = fromUtcDateOnly(currentParts.year, currentParts.month, currentParts.day + startOffset);
  const end = fromUtcDateOnly(start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate() + 6);
  return { from: formatDateOnly(start), to: formatDateOnly(end) };
}
