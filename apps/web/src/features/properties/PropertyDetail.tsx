import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ErrorState } from '../../components/ui/ErrorState';
import { ApiError } from '../../lib/apiClient';
import { useProperty } from './api';
import { BackToResidences } from './BackToResidences';
import { PropertyDetailSkeleton } from './PropertyDetailSkeleton';
import { PropertyHero } from './PropertyHero';
import { PropertySpecs } from './PropertySpecs';

type PropertyDetailProps = {
  id: number;
  /** Rendered inside the navy inquiry band. A slot, so this feature never imports another (D66). */
  inquiry: ReactNode;
};

export function PropertyDetail({ id, inquiry }: PropertyDetailProps) {
  const { data: property, isPending, isError, error, refetch } = useProperty(id);
  const headingId = useId();

  if (isPending) {
    return (
      <>
        <title>Residence · White Lotus</title>
        <BackToResidences />
        <PropertyDetailSkeleton />
      </>
    );
  }
  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <PropertyNotFound />;
    return (
      <>
        <BackToResidences />
        <div className="page">
          <title>Error · White Lotus</title>
          <ErrorState
            title="We couldn't load this residence"
            message={error.message}
            onRetry={() => void refetch()}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <title>{`${property.name} · White Lotus`}</title>
      <BackToResidences />
      <PropertyHero property={property} />

      {/* Mobile: content, then a full-width band. Desktop: 60/40 columns, band sticky on the right. */}
      <div className="mx-auto max-w-[1200px] lg:grid lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-16 lg:px-12 lg:py-24">
        <div className="px-6 pt-12 pb-10 md:px-12 lg:p-0">
          <h2 className="caps mb-4 text-[10px] font-normal text-gold-text">Overview</h2>
          <p className="mb-10 indent-[2em] text-[22px]/[1.45] font-light text-navy md:text-[28px]/[1.45]">
            {property.description}
          </p>
          <PropertySpecs property={property} />
          {property.details && (
            // pre-line keeps the paragraph breaks typed into the admin form.
            <p className="mt-10 text-sm/[1.8] font-light whitespace-pre-line text-slate md:text-base/[1.8]">
              {property.details}
            </p>
          )}
        </div>

        <section
          aria-labelledby={headingId}
          className="bg-navy px-6 py-10 md:px-12 lg:sticky lg:top-8 lg:px-10"
        >
          {/* The 0.5px gold frame is the only border on the page besides hairlines. */}
          <div className="border-[0.5px] border-gold px-[22px] py-7 md:p-9">
            <p className="caps mb-3 text-[10px] text-on-navy-accent">Private viewing</p>
            <h2
              id={headingId}
              className="mb-6 font-serif text-[30px]/[1.1] font-medium text-stone md:text-4xl/[1.1]"
            >
              Arrange a visit to {property.name}
            </h2>
            {inquiry}
          </div>
        </section>
      </div>
    </>
  );
}

// Unknown or malformed id. Same look as the route-level 404 page.
export function PropertyNotFound() {
  return (
    <>
      <BackToResidences />
      <section className="page py-16 md:py-24">
        <title>Not found · White Lotus</title>
        <p className="caps mb-3.5 text-[11px] text-gold-text">Error 404</p>
        <h1 className="mb-4 font-serif text-[40px] leading-[1.05] font-medium text-navy md:text-[64px]">
          This residence could not be found
        </h1>
        <p className="mb-8 max-w-xl text-sm/[1.7] text-slate md:text-base/[1.7]">
          It may no longer be listed, or the address is mistyped.
        </p>
        <Link to="/" className="btn-primary">
          Back to residences
        </Link>
      </section>
    </>
  );
}
