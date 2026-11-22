import { Skeleton } from '../../components/ui/Skeleton';

// Same shape as the detail page: hero block, overview lead, spec rows.
export function PropertyDetailSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading residence</span>
      <div aria-hidden="true">
        <Skeleton className="min-h-[520px] md:min-h-[80vh]" />
        <div className="page pt-12 pb-10 lg:w-3/5 lg:pt-24">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-5 h-6 w-full" />
          <Skeleton className="mt-3 h-6 w-4/5" />
          <Skeleton className="mt-10 h-4 w-full" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-6 h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
