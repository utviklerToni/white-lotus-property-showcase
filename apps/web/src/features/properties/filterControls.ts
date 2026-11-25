import { useSearchParams } from 'react-router';
import { PROPERTY_STATUSES, type PropertyListQuery } from '@white-lotus/shared';
import { STATUS_LABELS } from '../../lib/format';
import { useLocations } from './api';

// Filter options and the URL writer, shared by the inline FilterBar (md and up) and the mobile
// FilterSheet, so both filter in exactly the same way.

export type FilterOption = { value: string; label: string };

const ANY: FilterOption = { value: '', label: 'Any' };
export const BEDROOM_OPTIONS = [
  ANY,
  ...[3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` })),
];
export const STATUS_OPTIONS = [
  ANY,
  ...PROPERTY_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
];
export const SORT_OPTIONS: FilterOption[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'size_desc', label: 'Largest first' },
];

/** "Any" plus every location. A shared link may name a location that no longer exists: keep it. */
export function useLocationOptions(selected: string | undefined): FilterOption[] {
  const locations = useLocations().data ?? [];
  const names = selected && !locations.includes(selected) ? [selected, ...locations] : locations;
  return [ANY, ...names.map((name) => ({ value: name, label: name }))];
}

/**
 * Writes one filter to the URL; "Any" (empty) removes it. Replace, so filter changes don't pile
 * up in the back-button history; preventScrollReset, so the page stays put.
 */
export function useSetFilter() {
  const [, setSearchParams] = useSearchParams();
  return (key: keyof PropertyListQuery, value: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && !(key === 'sort' && value === 'newest')) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
}

/** Filters that narrow the results (sort only orders them). */
export function activeFilterCount(filters: PropertyListQuery): number {
  return [filters.location, filters.minBedrooms, filters.status].filter(Boolean).length;
}
