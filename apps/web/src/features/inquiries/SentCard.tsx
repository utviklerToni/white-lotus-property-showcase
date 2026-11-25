import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { EXIT, HIDDEN, SHOWN, backdrop, drift, heroLine } from '../../lib/motion';

/** How long the card stays before it closes on its own. */
const AUTO_CLOSE_MS = 3500;

type SentCardProps = {
  open: boolean;
  /** A state setter (stable), so the timer below isn't restarted by re-renders. */
  setOpen: (open: boolean) => void;
  /** Called once the card has gone if focus was on its Close button (or was lost). */
  returnFocus: () => void;
};

// "Enquiry sent" confirmation (DESIGN.md §4): a centred espresso card over a dimmed page. Not a
// dialog: it closes on its own, so it neither takes nor traps focus. Screen readers hear it
// through a status line that is always in the DOM (a live region added together with its text
// is often not announced).
export function SentCard({ open, setOpen, returnFocus }: SentCardProps) {
  const reduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // After the exit: Close may still hold focus here (it is removed just after this runs).
  function onExitComplete() {
    const active = document.activeElement;
    if (!active || active === document.body || wrapperRef.current?.contains(active)) returnFocus();
  }

  // The auto-close timer and the Escape key are outside React, so an effect. Both stop on close.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  return createPortal(
    // Centres the card in the viewport with 1rem around it (so at most 100vw - 2rem wide).
    // overflow-hidden: the drift (28px either side) is clipped and never adds a scrollbar.
    // pointer-events-none: when nothing is shown, the page underneath stays clickable.
    <div
      ref={wrapperRef}
      className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden p-4"
    >
      <p role="status" className="sr-only">
        {open ? 'Enquiry sent. Our team will be in touch shortly.' : ''}
      </p>
      {/* With reduced motion there is no exit animation, so this runs straight away. */}
      <AnimatePresence onExitComplete={onExitComplete}>
        {open && (
          <m.div
            key="backdrop"
            aria-hidden
            variants={backdrop}
            initial={reduceMotion ? false : HIDDEN}
            animate={SHOWN}
            exit={reduceMotion ? undefined : EXIT}
            onClick={() => setOpen(false)}
            className="pointer-events-auto fixed inset-0 bg-espresso/30"
          />
        )}
        {open && (
          // The thin gold frame (as on the enquiry band) keeps its edge visible over the footer.
          <m.div
            key="card"
            variants={drift}
            initial={reduceMotion ? false : HIDDEN}
            animate={SHOWN}
            exit={reduceMotion ? undefined : EXIT}
            className="pointer-events-auto relative w-full max-w-[320px] border-[0.5px] border-gold/60 bg-espresso px-7 pt-8 pb-5 text-cream"
          >
            <p className="font-serif text-[28px] leading-tight font-medium">Enquiry sent</p>
            {/* Level 1 gold line: draws from the left, 150ms after the card starts. */}
            <m.span aria-hidden variants={heroLine} className="mt-4 block h-px bg-gold" />
            <p className="mt-4 text-sm/[1.6] font-light">Our team will be in touch shortly.</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="caps mt-3 min-h-11 text-[11px] text-cream underline decoration-gold underline-offset-4"
            >
              Close
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
