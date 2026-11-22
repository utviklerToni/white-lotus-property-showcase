import { useState } from 'react';
import type { Property } from '@white-lotus/shared';
import { cn } from '../../lib/cn';
import { formatArea, formatNumber, formatPrice } from '../../lib/format';
import { imageSources } from '../../lib/images';
import { StatusBadge } from '../../components/ui/StatusBadge';

// Warm dark, not navy, so photos keep their colour (D74). Measured on a near-white photo:
// .75 over the bottom 200px (fact labels 6.2:1), .65 from there to 75% height (small caps line
// 4.6:1, title 5.8:1), fading to .15 at the top. Pixel stops keep the facts covered at any height.
const SCRIM =
  'linear-gradient(to top, rgb(20 18 16 / .75) 0, rgb(20 18 16 / .75) 200px, ' +
  'rgb(20 18 16 / .65) calc(200px + 15%), rgb(20 18 16 / .65) 75%, rgb(20 18 16 / .15) 100%)';

// Full-bleed photo with a scrim, title in the middle, facts along the bottom (DESIGN.md §4).
export function PropertyHero({ property }: { property: Property }) {
  // Only for the 300 ms fade-in (DESIGN.md §5); the navy box shows until the photo arrives.
  const [loaded, setLoaded] = useState(false);
  const { src, srcSet } = imageSources(property.image_url, 3 / 2);

  const facts = [
    { label: 'Price', value: formatPrice(property.price) },
    { label: 'Bedrooms', value: String(property.bedrooms) },
    { label: 'Size', value: formatArea(property.size_sqft) },
    { label: 'Location', value: property.location },
  ];

  return (
    <section className="relative overflow-hidden bg-navy">
      <img
        src={src}
        srcSet={srcSet}
        sizes="100vw"
        alt={`${property.name}, ${property.location}`}
        width={1200}
        height={800}
        fetchPriority="high"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300',
          loaded && 'opacity-100',
        )}
      />
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: SCRIM }} />

      {/* Fixed min-height, so the photo loading never shifts the layout. */}
      <div className="page relative flex min-h-[520px] flex-col justify-between gap-10 pt-7 pb-6 md:min-h-[80vh] md:pt-10 md:pb-10">
        <StatusBadge status={property.status} className="self-start" />

        <div className="text-center">
          <p className="caps mb-3.5 text-[11px] text-champagne md:text-xs">
            {formatNumber(property.id)} · {property.location}
          </p>
          <h1 className="font-serif text-[48px] leading-none font-medium text-balance text-white md:text-[80px]">
            {property.name}
          </h1>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t-[0.5px] border-white/35 pt-4 md:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="caps mb-1 text-[11px] text-on-navy md:text-xs">{fact.label}</dt>
              <dd className="text-[17px] font-normal text-white tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
