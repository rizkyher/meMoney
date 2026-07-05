export function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function parseIDR(input: string) {
  let normalized = input.replace(/[^\d.,-]/g, '');
  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    normalized = normalized.replace(new RegExp(`\\${decimalSeparator}\\d{1,2}$`), '');
  } else if (lastComma > -1) {
    normalized = normalized.replace(/,\d{1,2}$/, '');
  } else if (lastDot > -1) {
    normalized = normalized.replace(/\.\d{1,2}$/, '');
  }

  const digits = normalized.replace(/\D/g, '');
  return digits ? Number.parseInt(digits, 10) : 0;
}

export function formatIDRInput(amount: number | string | null | undefined) {
  const value = typeof amount === 'number' ? amount : parseIDR(String(amount ?? ''));
  return value > 0 ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value) : '';
}

export function percentage(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(999, Math.round((current / target) * 100));
}
