import { Link, useSearchParams } from 'react-router';
import { PROPERTY_STATUSES, type PropertyListQuery } from '@white-lotus/shared';
import { useLocations } from './api';
import { filtersToParams } from './filters';
import { STATUS_LABELS } from '../../lib/format';
import { Select } from '../../components/ui/Select';

const ANY = { value: '', label: 'Any' };
const BEDROOMS = [ANY, ...[3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` }))];
const STATUSES = [ANY, ...PROPERTY_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'size_desc', label: 'Largest first' },
];

type FilterBarProps = { filters: PropertyListQuery; count: number | undefined };

export function FilterBar({ filters, count }: FilterBarProps) {
  const [, setSearchParams] = useSearchParams();
  const locations = useLocations().data ?? [];
  // A shared link may name a location that no longer exists: still show it as selected.
  const locationNames =
    filters.location && !locations.includes(filters.location)
      ? [filters.location, ...locations]
      : locations;
  const hasFilters = filtersToParams(filters).size > 0;

  // Writes one filter to the URL; "Any" (empty) removes it. Replace, so filter changes
  // don't pile up in the back-button history; preventScrollReset, so the page stays put.
  function setFilter(key: keyof PropertyListQuery, value: string) {
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

  return (
    <div className="page">
      <form
        role="search"
        aria-label="Filter residences"
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6"
      >
        <Select
          label="Location"
          value={filters.location ?? ''}
          options={[ANY, ...locationNames.map((name) => ({ value: name, label: name }))]}
          onChange={(value) => setFilter('location', value)}
        />
        <Select
          label="Bedrooms"
          value={filters.minBedrooms ? String(filters.minBedrooms) : ''}
          options={BEDROOMS}
          onChange={(value) => setFilter('minBedrooms', value)}
        />
        <Select
          label="Status"
          value={filters.status ?? ''}
          options={STATUSES}
          onChange={(value) => setFilter('status', value)}
        />
        <Select
          label="Sort"
          value={filters.sort}
          options={SORTS}
          onChange={(value) => setFilter('sort', value)}
        />
      </form>

      <div className="mt-4 flex min-h-6 items-center justify-between gap-4 text-[13px]">
        {/* Announced to screen readers when the results change. */}
        <p aria-live="polite" className="text-slate">
          {count !== undefined && `${count} ${count === 1 ? 'residence' : 'residences'}`}
        </p>
        {/* With no results, the empty state's "Clear filters" is the only one. */}
        {hasFilters && count !== 0 && (
          <Link
            to={{ search: '' }}
            replace
            preventScrollReset
            className="text-link text-navy decoration-gold"
          >
            Clear filters
          </Link>
        )}
      </div>
    </div>
  );
}
