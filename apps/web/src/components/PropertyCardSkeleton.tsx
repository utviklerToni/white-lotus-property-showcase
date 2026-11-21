// Same layout as PropertyCard: photo block plus three bars, in sand. No pulse (no animations).
export function PropertyCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/3] bg-sand" />
      <div className="mt-4 h-2.5 w-1/3 bg-sand" />
      <div className="mt-3 h-7 w-2/3 bg-sand" />
      <div className="mt-4 h-4 w-full bg-sand" />
    </div>
  );
}
