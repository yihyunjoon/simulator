/**
 * Shared utility functions for the Chronicles simulator
 */

/**
 * Format a year number to display format (BC/AD)
 * @param year - Negative for BC, positive for AD
 * @returns Formatted string like "8000 BC" or "2024 AD"
 */
export function formatYear(year: number): string {
  if (year <= 0) return `${Math.abs(year)} BC`;
  return `${year} AD`;
}
