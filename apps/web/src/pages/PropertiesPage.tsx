import { m } from 'motion/react';
import { PropertyListing } from '../features/properties/PropertyListing';
import { HIDDEN, SHOWN, heroLine, heroText } from '../lib/motion';
import { useIsMobile } from '../lib/viewport';

export function PropertiesPage() {
  // Hero slide on mobile only; from md the headline renders still, as before.
  const isMobile = useIsMobile();

  return (
    <>
      <title>Residences · White Lotus</title>
      <section className="page pt-10 pb-7 md:pt-24 md:pb-12">
        <p className="caps mb-3.5 text-[11px] text-gold-text">Residences · Bengaluru</p>
        {/* Starts on mount with no delay: the headline may be the LCP element. */}
        <m.h1
          initial={isMobile ? HIDDEN : false}
          animate={SHOWN}
          className="mb-4 font-serif text-[40px] leading-[1.05] font-medium text-navy md:text-[64px]"
        >
          {/* w-fit: the gold line's 65% is of the text width, not the page width. */}
          <span className="block w-fit">
            {/* The mask. Padding (cancelled by the negative margin) keeps descenders unclipped. */}
            <span className="block max-md:-my-[0.15em] max-md:overflow-hidden max-md:py-[0.15em]">
              <m.span variants={heroText} className="block">
                Homes composed
                <br />
                with quiet intent.
              </m.span>
            </span>
            <m.span
              aria-hidden
              variants={heroLine}
              className="mt-3 block h-px w-[65%] bg-gold md:hidden"
            />
          </span>
        </m.h1>
        <p className="max-w-xl text-sm/[1.7] text-slate md:text-base/[1.7]">
          Residences across the city, each designed around light, stillness and craft.
        </p>
      </section>
      <PropertyListing />
    </>
  );
}
