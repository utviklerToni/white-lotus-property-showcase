import { useSearchParams } from 'react-router';
import { useProperties } from '../api/properties';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { cn } from '../lib/cn';
import { filtersToParams, readFilters } from '../lib/filters';

const GRID = 'grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10 lg:grid-cols-3';

export function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProperties(filters);

  return (
    <>
      <title>Residences · White Lotus</title>
      <section className="page pt-10 pb-7 md:pt-24 md:pb-12">
        <p className="caps mb-3.5 text-[11px] text-gold-text">Residences · Bengaluru</p>
        <h1 className="mb-4 font-serif text-[40px] leading-[1.05] font-medium text-navy md:text-[64px]">
          Homes composed
          <br />
          with quiet intent.
        </h1>
        <p className="max-w-xl text-sm/[1.7] text-slate md:text-base/[1.7]">
          Residences across the city, each designed around light, stillness and craft.
        </p>
      </section>

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
          <ErrorState message={error.message} onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState filtered={filtersToParams(filters).size > 0} />
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
