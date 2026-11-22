import type { PropertyStatus } from '@white-lotus/shared';

const CRORE = 10_000_000;
const LAKH = 100_000;
const twoDecimals = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-IN');

/** The one price format: 125000000 → "₹12.5 Cr", 8500000 → "₹85 L". Prices are integer rupees. */
export function formatPrice(rupees: number): string {
  if (rupees >= CRORE) return `₹${twoDecimals.format(rupees / CRORE)} Cr`;
  if (rupees >= LAKH) return `₹${twoDecimals.format(rupees / LAKH)} L`;
  return `₹${whole.format(rupees)}`;
}

export function formatArea(sqft: number): string {
  return `${whole.format(sqft)} sq ft`;
}

export function formatBeds(bedrooms: number): string {
  return `${bedrooms} ${bedrooms === 1 ? 'bed' : 'beds'}`;
}

/** "No. 04": the zero-padded database id (D49). */
export function formatNumber(id: number): string {
  return `No. ${String(id).padStart(2, '0')}`;
}

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/** "22 Nov 2026, 10:15 am" in the viewer's time zone. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'Available',
  under_construction: 'Under construction',
  sold: 'Sold',
};
