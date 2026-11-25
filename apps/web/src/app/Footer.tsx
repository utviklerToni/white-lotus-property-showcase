import { Link, NavLink } from 'react-router';
import { m, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HIDDEN, SHOWN, drift, driftGroup, footerLine } from '../lib/motion';
import { NAV } from './nav';

// Espresso footer on every page (DESIGN.md §4). Mobile: one column (CTA, gold line, links and
// city, copyright). From md a grid puts the links and city to the right of the CTA, with the
// line and copyright below both. Drifts in once, the first time it scrolls into view (§5).
export function Footer() {
  const reduceMotion = useReducedMotion();
  return (
    // overflow-x-clip: the drift starts 28px left of the padding; never let it widen anything.
    // Bottom padding below md: the listing's floating Filters pill never covers the copyright.
    <footer className="mt-16 overflow-x-clip bg-espresso text-cream md:mt-24">
      <m.div
        variants={driftGroup}
        initial={reduceMotion ? false : HIDDEN}
        whileInView={SHOWN}
        viewport={{ once: true, amount: 0.3 }}
        className="page grid gap-10 pt-14 pb-[calc(6rem+env(safe-area-inset-bottom))] md:grid-cols-[1fr_auto] md:gap-x-12 md:py-20"
      >
        <m.div variants={drift}>
          <Link to="/" className="group inline-flex items-center gap-5 md:gap-7">
            <span className="font-serif text-[32px] leading-[1.1] font-medium md:text-[48px]">
              Considering a residence?
              <span className="block text-gold">Let’s talk</span>
            </span>
            {/* Arrow in a gold circle; fills gold on hover/focus. */}
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-full border border-gold text-gold transition-colors duration-200 group-hover:bg-gold group-hover:text-espresso group-focus-visible:bg-gold group-focus-visible:text-espresso md:size-14"
            >
              <ArrowRight size={20} strokeWidth={1.5} />
            </span>
          </Link>
        </m.div>

        <m.span
          aria-hidden
          variants={footerLine}
          className="block h-px bg-gold md:col-span-2 md:row-start-2"
        />

        <m.div
          variants={drift}
          className="flex flex-col gap-4 md:col-start-2 md:row-start-1 md:items-end md:self-end"
        >
          <nav aria-label="Footer">
            <ul className="flex gap-6">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className="caps flex min-h-11 items-center text-[11px] text-cream"
                  >
                    <span className="link-draw">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="caps text-[11px] text-cream/65">Bengaluru</p>
        </m.div>

        <m.p variants={drift} className="caps text-[10px] text-cream/65 md:col-span-2">
          © {new Date().getFullYear()} White Lotus
        </m.p>
      </m.div>
    </footer>
  );
}
