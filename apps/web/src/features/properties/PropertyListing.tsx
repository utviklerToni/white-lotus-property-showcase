import { Link, useSearchParams } from 'react-router';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { cn } from '../../lib/cn';
import { useProperties } from './api';
import { FilterBar } from './FilterBar';
import { filtersToParams, readFilters } from './filters';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

const GRID = 'grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10 lg:grid-cols-3';

// Filter bar plus results grid, with loading, error and empty states. Filters come from the URL.
export function PropertyListing() {
  const [searchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const filtered = filtersToParams(filters).size > 0;
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProperties(filters);

  return (
    <>
      <FilterBar filters={filters} count={isError ? undefined : data?.length} />

      <section aria-label="Residences" className="page mt-7 md:mt-10">
        {isPending ? (
          <div role="status" className={GRID}>
            <span className="sr-only">Loading residences</span>
            {Array.from({ length: 6 }, (_, i) => (
              // Placeholders have no id; they never reorder, so the index is a stable key here.
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="We couldn't load the residences"
            message={error.message}
            onRetry={() => void refetch()}
          />
        ) : data.length === 0 ? (
          <EmptyState
            title={filtered ? 'No residences match these filters' : 'No residences are listed yet'}
          >
            {filtered && (
              <Link to={{ search: '' }} className="text-link text-[13px] text-navy decoration-gold">
                Clear filters
              </Link>
            )}
          </EmptyState>
        ) : (
          // Previous results stay visible, dimmed, while new filters load.
          <ul aria-busy={isPlaceholderData} className={cn(GRID, isPlaceholderData && 'opacity-60')}>
            {data.map((property) => (
              <li key={property.id}>
                <PropertyCard property={property} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
