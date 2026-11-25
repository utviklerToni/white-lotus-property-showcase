import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';
import {
  EXIT,
  HIDDEN,
  SHOWN,
  drift,
  menuContents,
  menuFoot,
  menuIconLine,
  menuItem,
  menuItemLine,
  menuItems,
  menuOverlay,
  menuRule,
  menuWordmark,
} from '../lib/motion';
import { NAV } from './nav';

type MobileMenuProps = {
  open: boolean;
  id: string;
  onClose: () => void;
  /** The header's Menu button: focus goes back to it when the menu closes. */
  triggerRef: RefObject<HTMLButtonElement | null>;
};

// Full-screen menu below md (DESIGN.md §4, §5). Rendered into <body>, outside #root, so the
// whole page behind can be made inert: focus stays in the menu without a hand-written trap.
export function MobileMenu({ open, id, onClose, triggerRef }: MobileMenuProps) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Syncs with the DOM outside React (an effect is right here): while open, #root is inert and
  // dimmed with page scroll locked (html[data-menu], index.css). On close, focus returns to the
  // trigger; the dim stays until the overlay has left (onExitComplete below).
  useEffect(() => {
    if (!open) return;
    const root = document.getElementById('root');
    const trigger = triggerRef.current; // always rendered (hidden by CSS from md), so stable
    document.documentElement.dataset.menu = 'open';
    if (root) root.inert = true;
    closeRef.current?.focus();
    return () => {
      if (root) root.inert = false;
      trigger?.focus();
    };
  }, [open, triggerRef]);

  return createPortal(
    <AnimatePresence onExitComplete={() => delete document.documentElement.dataset.menu}>
      {open && (
        <m.div
          key="menu"
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          // Reduced motion: no entrance and no exit, so it appears and goes at once.
          initial={reduceMotion ? false : HIDDEN}
          animate={SHOWN}
          exit={reduceMotion ? undefined : EXIT}
          variants={menuOverlay}
          // Focus is always in the menu (the page is inert), so its keys are caught here.
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'Tab') wrapFocus(event);
          }}
          // The panel: always full screen, it only fades (menuOverlay). The contents drift.
          className="fixed inset-0 z-50 overflow-y-auto bg-espresso text-cream md:hidden"
        >
          {/* w-full on each row: `page` centres with auto margins, which shrinks flex children. */}
          <m.div variants={menuContents} className="flex min-h-full flex-col">
            {/* Same row as the header, so Close sits exactly where Menu was. */}
            <div className="page flex w-full items-center justify-between py-[18px]">
              {/* The mask for the wordmark's slide. */}
              <span className="flex min-h-11 items-center overflow-hidden">
                <m.span
                  variants={menuWordmark}
                  className="block font-serif text-[22px] leading-none font-semibold"
                >
                  White Lotus
                </m.span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="caps flex min-h-11 items-center gap-3 text-[11px] text-cream"
              >
                Close<span className="sr-only"> menu</span>
                <MenuIcon />
              </button>
            </div>

            <nav
              aria-label="Main"
              className="page flex w-full flex-1 flex-col justify-center py-10"
            >
              <m.ul variants={menuItems} className="flex flex-col gap-4">
                {NAV.map((item, index) => (
                  <m.li key={item.to} variants={menuItem}>
                    {/* A navigation closes the menu on its own (Header); onClick covers a tap on
                      the page you are already on. */}
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className="block py-2"
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-baseline gap-4">
                            <span aria-hidden className="caps text-[11px] text-gold tabular-nums">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="font-serif text-[36px] leading-tight font-medium">
                              {item.label}
                            </span>
                          </span>
                          {/* Every item has a hairline; the current page's is full gold. */}
                          <m.span
                            aria-hidden
                            variants={menuItemLine}
                            className={cn('mt-3 block h-px bg-gold', !isActive && 'opacity-35')}
                          />
                        </>
                      )}
                    </NavLink>
                  </m.li>
                ))}
              </m.ul>
            </nav>

            <m.div variants={menuFoot} className="page w-full pb-10">
              <m.span aria-hidden variants={menuRule} className="block h-px w-10 bg-gold" />
              <m.p variants={drift} className="caps mt-4 text-[11px] text-cream">
                Bengaluru
              </m.p>
            </m.div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Focus trap: Tab from the last control goes to the first, Shift+Tab from the first to the last.
 * The inert page already keeps focus off it; this also keeps it out of the browser's own UI.
 */
function wrapFocus(event: KeyboardEvent<HTMLElement>) {
  const controls = event.currentTarget.querySelectorAll<HTMLElement>('a[href], button');
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

/**
 * Two lines, 6px apart. Inside the menu they follow its variants and turn into an X; in the
 * header there is no variant to follow, so they stay two lines.
 */
export function MenuIcon() {
  return (
    <span aria-hidden className="relative block h-[7px] w-5">
      <m.span
        custom={1}
        variants={menuIconLine}
        className="absolute inset-x-0 top-0 h-px bg-current"
      />
      <m.span
        custom={-1}
        variants={menuIconLine}
        className="absolute inset-x-0 bottom-0 h-px bg-current"
      />
    </span>
  );
}
