/**
 * Format a number as currency (USD) with 2 decimal places.
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "49.99")
 */
export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};
