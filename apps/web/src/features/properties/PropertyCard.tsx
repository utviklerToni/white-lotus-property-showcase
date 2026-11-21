import { useState } from 'react';
import { Link } from 'react-router';
import { BedDouble, Ruler } from 'lucide-react';
import type { Property } from '@white-lotus/shared';
import { cn } from '../../lib/cn';
import { formatArea, formatBeds, formatNumber, formatPrice } from '../../lib/format';
import { imageSources } from '../../lib/images';
import { StatusBadge } from '../../components/ui/StatusBadge';

// Rendered width of a card image per breakpoint (grid 1 / 2 / 3 columns, page padding, gaps).
const SIZES = '(min-width: 1024px) 342px, (min-width: 768px) calc(50vw - 68px), calc(100vw - 48px)';

export function PropertyCard({ property }: { property: Property }) {
  // Only for the 300 ms fade-in (DESIGN.md §5); the sand box shows until the photo arrives.
  const [loaded, setLoaded] = useState(false);
  const { src, srcSet } = imageSources(property.image_url, 4 / 3);

  return (
    // The whole card is one link: one Tab stop, no nested interactive elements.
    <Link to={`/properties/${property.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {/* Zoom on the wrapper (700 ms), fade on the image (300 ms): DESIGN.md §5. */}
        <div className="size-full transition-transform duration-700 group-hover:scale-[1.03]">
          <img
            src={src}
            srcSet={srcSet}
            sizes={SIZES}
            alt={`${property.name}, ${property.location}`}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={cn(
              'size-full object-cover opacity-0 transition-opacity duration-300',
              loaded && 'opacity-100',
            )}
          />
        </div>
        <StatusBadge status={property.status} className="absolute top-3.5 left-3.5" />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <span className="caps text-[10px] text-gold-text">{formatNumber(property.id)}</span>
        <span className="caps text-right text-[10px] text-slate">{property.location}</span>
      </div>
      <h2 className="mt-1.5 mb-3 font-serif text-[28px] leading-tight font-medium text-navy md:text-[30px]">
        {property.name}
      </h2>

      <div className="flex items-center justify-between gap-4 border-t-[0.5px] border-navy/25 pt-3">
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate">
          <span className="flex items-center gap-1.5">
            <BedDouble aria-hidden size={15} strokeWidth={1.25} className="text-gold" />
            {formatBeds(property.bedrooms)}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler aria-hidden size={15} strokeWidth={1.25} className="text-gold" />
            {formatArea(property.size_sqft)}
          </span>
        </span>
        <span className="text-[17px] font-normal whitespace-nowrap text-navy tabular-nums">
          {formatPrice(property.price)}
        </span>
      </div>

      <p className="mt-3.5 text-[13px] text-navy">
        <span className="text-link group-hover:decoration-gold">View residence</span>{' '}
        <span aria-hidden>→</span>
      </p>
    </Link>
  );
}
