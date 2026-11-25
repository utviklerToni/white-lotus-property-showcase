import { Link } from 'react-router';
import type { PropertyListQuery } from '@white-lotus/shared';
import { Select } from '../../components/ui/Select';
import {
  BEDROOM_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  useLocationOptions,
  useSetFilter,
} from './filterControls';
import { filtersToParams } from './filters';

type FilterBarProps = { filters: PropertyListQuery; count: number | undefined };

// Inline selects from md; below md they are hidden and FilterSheet takes over. The result count
// and "Clear filters" line shows on every size.
export function FilterBar({ filters, count }: FilterBarProps) {
  const setFilter = useSetFilter();
  const locationOptions = useLocationOptions(filters.location);
  const hasFilters = filtersToParams(filters).size > 0;

  return (
    <div className="page">
      <form
        role="search"
        aria-label="Filter residences"
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-2 gap-3 max-md:hidden lg:grid-cols-4 lg:gap-6"
      >
        <Select
          label="Location"
          value={filters.location ?? ''}
          options={locationOptions}
          onChange={(value) => setFilter('location', value)}
        />
        <Select
          label="Bedrooms"
          value={filters.minBedrooms ? String(filters.minBedrooms) : ''}
          options={BEDROOM_OPTIONS}
          onChange={(value) => setFilter('minBedrooms', value)}
        />
        <Select
          label="Status"
          value={filters.status ?? ''}
          options={STATUS_OPTIONS}
          onChange={(value) => setFilter('status', value)}
        />
        <Select
          label="Sort"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(value) => setFilter('sort', value)}
        />
      </form>

      <div className="flex min-h-6 items-center justify-between gap-4 text-[13px] md:mt-4">
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
