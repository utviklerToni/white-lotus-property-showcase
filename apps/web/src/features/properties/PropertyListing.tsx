import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { cn } from '../../lib/cn';
import { useProperties } from './api';
import { FilterBar } from './FilterBar';
import { FilterSheet } from './FilterSheet';
import { filtersToParams, readFilters } from './filters';
import { readRestoreScrollY } from './listingReturn';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

const GRID = 'grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10 lg:grid-cols-3';

// Filter bar plus results grid, with loading, error and empty states. Filters come from the URL.
export function PropertyListing() {
  const [searchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const filtered = filtersToParams(filters).size > 0;
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProperties(filters);

  // Reached through "← All residences": scroll back to where the card was clicked (D76), once the
  // results are on the page. Runs after ScrollRestoration's reset to the top (a layout effect).
  const location = useLocation();
  const restoreScrollY = readRestoreScrollY(location.state);
  const ready = !isPending;
  useEffect(() => {
    if (ready && restoreScrollY !== undefined) window.scrollTo(0, restoreScrollY);
  }, [ready, restoreScrollY, location.key]);

  return (
    <>
      <FilterBar filters={filters} count={isError ? undefined : data?.length} />
      {/* Below md: the floating Filters pill and its card. */}
      <FilterSheet filters={filters} />

      {/* Min height of about one card row: going from a few results to none doesn't shrink the
          page, so the browser never clamps the scroll position upward. Below md, bottom padding
          keeps the last card clear of the floating Filters pill. */}
      <section
        aria-label="Residences"
        className="page mt-7 min-h-[440px] max-md:pb-24 md:mt-10 md:min-h-[60vh]"
      >
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
          // pt: about 44px below the count line (section margin + this padding).
          <EmptyState
            title={filtered ? 'No residences match these filters' : 'No residences are listed yet'}
            className="pt-4 md:pt-1"
          >
            {filtered && (
              <Link
                to={{ search: '' }}
                preventScrollReset
                className="text-link text-[13px] text-navy decoration-gold"
              >
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
