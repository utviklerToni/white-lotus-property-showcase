import { Skeleton } from '../../components/ui/Skeleton';

// Same layout as PropertyCard: photo block plus three bars.
export function PropertyCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[4/3]" />
      <Skeleton className="mt-4 h-2.5 w-1/3" />
      <Skeleton className="mt-3 h-7 w-2/3" />
      <Skeleton className="mt-4 h-4 w-full" />
    </div>
  );
}
