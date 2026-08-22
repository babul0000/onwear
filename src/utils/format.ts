/**
 * Formats a number amount into Bangladeshi Taka (Tk) format with comma separators.
 * Example: 1450 -> "Tk 1,450"
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'Tk 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Tk 0';
  return `Tk ${num.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
