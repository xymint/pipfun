// Numeric formatting utilities for pipfun

/**
 * Format a numeric value with a fixed maximum decimals and trim trailing zeros.
 * - Prevents scientific notation by using toFixed for maximum decimals first
 * - Trims trailing zeros and removes a dangling decimal point
 * - Returns '0' for undefined, null, NaN, or non-finite values
 *
 * @param value Input number or numeric string
 * @param maxDecimals Maximum decimals to display (default: 9 for SOL)
 */
export function formatAmount(value: string | number | undefined | null, maxDecimals: number = 9): string {
  if (value === undefined || value === null) return '0';
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  const fixed = num.toFixed(maxDecimals);
  // Trim trailing zeros and optional trailing decimal point
  const trimmed = fixed.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
  return trimmed === '' ? '0' : trimmed;
}
