export function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function parseIDR(input: string) {
  const normalized = input.replace(/[^\d,-]/g, '').replace(/,00$/, '').replace(/,/g, '');
  const digits = normalized.replace(/\D/g, '');
  return digits ? Number.parseInt(digits, 10) : 0;
}

export function percentage(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(999, Math.round((current / target) * 100));
}
