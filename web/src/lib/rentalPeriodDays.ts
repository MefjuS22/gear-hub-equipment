/** Minimum 1 calendar day; used for portal checkout totals. */
export function countRentalPeriodDays(
  rentalStartYyyyMmDd: string,
  rentalEndYyyyMmDd: string,
): number {
  return Math.max(
    1,
    Math.ceil(
      (new Date(rentalEndYyyyMmDd).getTime() -
        new Date(rentalStartYyyyMmDd).getTime()) /
        (1000 * 60 * 60 * 24),
    ) || 1,
  );
}
