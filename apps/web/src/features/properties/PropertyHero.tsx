import { useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import type { Property } from '@white-lotus/shared';
import { cn } from '../../lib/cn';
import { formatArea, formatNumber, formatPrice } from '../../lib/format';
import { imageSources } from '../../lib/images';
import { HIDDEN, SHOWN, heroText, statReveal, titleLine } from '../../lib/motion';
import { StatusBadge } from '../../components/ui/StatusBadge';

// Warm dark, not navy, so photos keep their colour (D74). Measured on a near-white photo:
// .75 over the bottom 200px (fact labels 6.2:1), .65 from there to 75% height (small caps line
// 4.6:1, title 5.8:1), fading to .15 at the top. Pixel stops keep the facts covered at any height.
const SCRIM =
  'linear-gradient(to top, rgb(20 18 16 / .75) 0, rgb(20 18 16 / .75) 200px, ' +
  'rgb(20 18 16 / .65) calc(200px + 15%), rgb(20 18 16 / .65) 75%, rgb(20 18 16 / .15) 100%)';

// Full-bleed photo with a scrim, title in the middle, facts along the bottom (DESIGN.md §4).
// Title sequence (DESIGN.md §5): the name slides in, a gold line draws under the title block and
// the facts appear along it. The photo itself never animates beyond its load fade (LCP).
export function PropertyHero({ property }: { property: Property }) {
  // Only for the 300 ms fade-in (DESIGN.md §5); the navy box shows until the photo arrives.
  const [loaded, setLoaded] = useState(false);
  // Reduced motion: start in the final state. MotionConfig alone would still fade the facts.
  const reduceMotion = useReducedMotion();
  // Cropped by Unsplash to the box's shape, so object-cover barely scales it: 4:5 on phones, 3:2
  // from md. sizes 100vw matches: a 390px phone at 3x loads the 1200px file at about 1:1.
  const mobile = imageSources(property.image_url, 4 / 5);
  const desktop = imageSources(property.image_url, 3 / 2);

  const facts = [
    { label: 'Price', value: formatPrice(property.price) },
    { label: 'Bedrooms', value: String(property.bedrooms) },
    { label: 'Size', value: formatArea(property.size_sqft) },
    { label: 'Location', value: property.location },
  ];

  return (
    <section className="relative overflow-hidden bg-navy">
      <picture>
        {desktop.srcSet && (
          <source media="(min-width: 48rem)" srcSet={desktop.srcSet} sizes="100vw" />
        )}
        <img
          src={mobile.src}
          srcSet={mobile.srcSet}
          sizes="100vw"
          alt={`${property.name}, ${property.location}`}
          width={1200}
          height={1500}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300',
            loaded && 'opacity-100',
          )}
        />
      </picture>
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: SCRIM }} />

      {/* Fixed size before the photo loads, so it never shifts the layout: 4:5 on phones (grows
          only if the content needs more), at least 80vh from md. */}
      <m.div
        // Starts on mount with no delay. The parent passes the variant to every m child.
        initial={reduceMotion ? false : HIDDEN}
        animate={SHOWN}
        className="page relative flex aspect-[4/5] flex-col justify-between gap-10 pt-7 pb-6 md:aspect-auto md:min-h-[80vh] md:pt-10 md:pb-10"
      >
        <StatusBadge status={property.status} className="self-start" />

        <div className="text-center">
          <p className="caps mb-3.5 text-[11px] text-champagne md:text-xs">
            {formatNumber(property.id)} · {property.location}
          </p>
          <h1 className="font-serif text-[48px] leading-none font-medium text-balance text-white md:text-[80px]">
            {/* The mask. Padding (cancelled by the negative margin) keeps descenders unclipped. */}
            <span className="-my-[0.15em] block overflow-hidden py-[0.15em]">
              <m.span variants={heroText} className="block">
                {property.name}
              </m.span>
            </span>
          </h1>
          {/* Full width of the title block; the facts below appear as it passes 15/40/65/90%. */}
          <m.span aria-hidden variants={titleLine} className="mt-5 block h-px bg-gold md:mt-7" />
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t-[0.5px] border-white/35 pt-4 md:grid-cols-4">
          {facts.map((fact, index) => (
            <m.div key={fact.label} custom={index} variants={statReveal}>
              <dt className="caps mb-1 text-[11px] text-on-navy md:text-xs">{fact.label}</dt>
              <dd className="text-[17px] font-normal text-white tabular-nums">{fact.value}</dd>
            </m.div>
          ))}
        </dl>
      </m.div>
    </section>
  );
}
