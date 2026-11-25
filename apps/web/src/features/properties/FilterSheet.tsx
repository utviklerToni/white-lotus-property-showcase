import { useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, LazyMotion, m, useReducedMotion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import type { PropertyListQuery } from '@white-lotus/shared';
import { cn } from '../../lib/cn';
import { wrapFocus } from '../../lib/focusTrap';
import {
  EXIT,
  HIDDEN,
  MORPH,
  SHOWN,
  drift,
  pillLabel,
  sheetBackdrop,
  sheetChevron,
  sheetContents,
} from '../../lib/motion';
import { useIsMobile } from '../../lib/viewport';
import {
  BEDROOM_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  activeFilterCount,
  useLocationOptions,
  useSetFilter,
  type FilterOption,
} from './filterControls';
import { filtersToParams } from './filters';

// Layout animations (the morph) need domMax; loaded on its own, only where this sheet is used.
const loadDomMax = () => import('../../lib/motionMax').then((module) => module.default);

// Shared by the pill and the card, so Motion morphs one into the other.
const LAYOUT_ID = 'filter-sheet';

// Mobile filters (below md, DESIGN.md §4): a pill fixed at the bottom centre grows into a card of
// radio groups. Each choice is written to the URL at once, like the inline FilterBar from md.
export function FilterSheet({ filters }: { filters: PropertyListQuery }) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const [wantOpen, setWantOpen] = useState(false);
  // Derived: widening past md closes it (the card is hidden there and must not keep the lock).
  const open = wantOpen && isMobile;
  // After the first open the pill's label fades in as the card shrinks back into it.
  const [hasOpened, setHasOpened] = useState(false);
  const [, setSearchParams] = useSearchParams();
  const setFilter = useSetFilter();
  const locationOptions = useLocationOptions(filters.location);
  const count = activeFilterCount(filters);
  const canClear = filtersToParams(filters).size > 0;
  const cardId = useId();
  const titleId = useId();
  const pillRef = useRef<HTMLButtonElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  // Set by close(), so focus goes back to the pill only after the sheet was open.
  const returnFocus = useRef(false);

  // Syncs with the DOM outside React: on open, lock page scroll (html[data-sheet], index.css) and
  // move focus into the card; on close, back to the pill. The lock is released when the backdrop
  // has faded out (releaseLock), not when closing starts.
  useEffect(() => {
    if (open) {
      const html = document.documentElement;
      // The page is padded by the scrollbar's width while it is hidden, so nothing shifts behind
      // the backdrop. A reserved gutter would show as a light strip the backdrop can't cover.
      html.style.setProperty('--scrollbar-gap', `${window.innerWidth - html.clientWidth}px`);
      html.dataset.sheet = 'open';
      collapseRef.current?.focus({ preventScroll: true });
    } else if (returnFocus.current) {
      returnFocus.current = false;
      pillRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  function close() {
    returnFocus.current = true;
    setWantOpen(false);
  }

  function releaseLock() {
    delete document.documentElement.dataset.sheet;
    document.documentElement.style.removeProperty('--scrollbar-gap');
  }

  function clearAll() {
    setSearchParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  }

  const groups: {
    key: keyof PropertyListQuery;
    label: string;
    options: FilterOption[];
    value: string;
  }[] = [
    { key: 'location', label: 'Location', options: locationOptions, value: filters.location ?? '' },
    {
      key: 'minBedrooms',
      label: 'Bedrooms',
      options: BEDROOM_OPTIONS,
      value: filters.minBedrooms ? String(filters.minBedrooms) : '',
    },
    { key: 'status', label: 'Status', options: STATUS_OPTIONS, value: filters.status ?? '' },
    { key: 'sort', label: 'Sort', options: SORT_OPTIONS, value: filters.sort },
  ];

  return (
    <LazyMotion features={loadDomMax}>
      <AnimatePresence onExitComplete={releaseLock}>
        {open && (
          // Tap outside the card to close. Not a control of its own: Escape and the chevron are.
          <m.div
            key="backdrop"
            aria-hidden
            initial={reduceMotion ? false : HIDDEN}
            animate={SHOWN}
            exit={reduceMotion ? undefined : EXIT}
            variants={sheetBackdrop}
            onClick={close}
            className="fixed inset-0 z-[45] bg-espresso/40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Full-width row that centres the pill or card, so neither needs a centring transform
          (Motion's layout animation owns the transform). Clicks pass through around them. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[46] flex justify-center px-4 md:hidden">
        {open ? (
          <m.div
            key="card"
            layoutId={LAYOUT_ID}
            transition={MORPH}
            id={cardId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduceMotion ? false : HIDDEN}
            animate={SHOWN}
            onKeyDown={(event) => {
              if (event.key === 'Escape') close();
              wrapFocus(event);
            }}
            // borderRadius in style, so Motion keeps the corners round while it scales the card.
            style={{ borderRadius: 16 }}
            className="pointer-events-auto flex w-[180px] max-w-full flex-col overflow-hidden bg-espresso/95 text-cream backdrop-blur-md"
          >
            <div className="flex items-center justify-between py-2 pr-2 pl-5">
              <h2 id={titleId} className="text-[13px]">
                Filters
              </h2>
              <button
                ref={collapseRef}
                type="button"
                onClick={close}
                aria-label="Close filters"
                className="grid size-11 place-items-center rounded-full"
              >
                <m.span
                  variants={sheetChevron}
                  className="grid size-7 place-items-center rounded-full border border-cream/30"
                >
                  <ChevronUp aria-hidden size={13} strokeWidth={1.5} />
                </m.span>
              </button>
            </div>

            {/* Scrolls inside past 60vh. relative: the sr-only radios are positioned against it,
                so they can't escape and widen anything; overflow-x-hidden: the drift never shows
                a sideways scrollbar (the menu's lesson, F21). Right side: 14px padding plus a
                stable scrollbar gutter (0 on phones, 6px with desktop scrollbars), so the rows
                always get at least 140px and "Under construction" (138px) stays on one line. */}
            <m.div
              variants={sheetContents}
              className="sheet-scroll relative max-h-[60vh] overflow-x-hidden overflow-y-auto pr-3.5 pb-2 pl-5"
            >
              {groups.map((group) => (
                <m.fieldset key={group.key} variants={drift} className="pt-3 pb-1">
                  <legend className="caps pt-3 text-[10px] text-cream/65">{group.label}</legend>
                  {group.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                    >
                      <input
                        type="radio"
                        name={`${cardId}-${group.key}`}
                        value={option.value}
                        checked={group.value === option.value}
                        onChange={() => setFilter(group.key, option.value)}
                        className="peer sr-only"
                      />
                      {/* The circle: outlined, filled gold when chosen, ringed on keyboard focus. */}
                      <span
                        aria-hidden
                        className={cn(
                          'size-4 shrink-0 rounded-full border border-cream/50',
                          'peer-checked:border-gold peer-checked:bg-gold',
                          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold',
                        )}
                      />
                      {option.label}
                    </label>
                  ))}
                </m.fieldset>
              ))}
            </m.div>

            <div className="border-t-[0.5px] border-cream/20 px-5 py-1">
              <button
                type="button"
                onClick={clearAll}
                disabled={!canClear}
                className="caps min-h-11 text-[11px] text-cream underline decoration-gold underline-offset-4 disabled:no-underline disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </m.div>
        ) : (
          <m.button
            key="pill"
            ref={pillRef}
            layoutId={LAYOUT_ID}
            transition={MORPH}
            type="button"
            aria-haspopup="dialog"
            aria-controls={cardId}
            aria-expanded={false}
            onClick={() => {
              setWantOpen(true);
              setHasOpened(true);
            }}
            initial={hasOpened && !reduceMotion ? HIDDEN : false}
            animate={SHOWN}
            style={{ borderRadius: 24 }}
            className="pointer-events-auto flex min-h-12 items-center gap-3 bg-espresso/85 py-2 pr-2 pl-5 text-cream backdrop-blur-md"
          >
            <m.span variants={pillLabel} className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[13px]">
                Filters
                {count > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-gold text-[11px] font-medium text-espresso tabular-nums">
                    {count}
                    <span className="sr-only"> active</span>
                  </span>
                )}
              </span>
              <span className="grid size-8 place-items-center rounded-full border border-cream/30">
                <ChevronUp aria-hidden size={14} strokeWidth={1.5} />
              </span>
            </m.span>
          </m.button>
        )}
      </div>
    </LazyMotion>
  );
}
