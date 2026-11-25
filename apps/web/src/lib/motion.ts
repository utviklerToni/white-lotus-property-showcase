import { stagger, type Variants } from 'motion/react';

// The motion system (DESIGN.md §5). Animated components take curves, durations and variants
// from here, never their own values. index.css mirrors the two curves as --ease-enter/--ease-exit.

/** Entrances: fast start, long settle. */
export const easeOut = [0.22, 1, 0.36, 1] as const;
/** Exits: accelerate away. */
export const easeIn = [0.64, 0, 0.78, 0] as const;

/** Seconds (Motion's unit). Entrances are slower than exits. */
export const DURATION = {
  heroIn: 0.85,
  heroOut: 0.42,
  lineIn: 0.9,
  lineOut: 0.42,
  driftIn: 0.65,
  driftOut: 0.4,
} as const;

/** The gold line starts this long after its hero text. */
export const LINE_DELAY = 0.15;
/** Gap between siblings in a drift group. */
export const STAGGER = 0.085;
/** How far a drift travels, in px. */
const DRIFT_X = 28;

// Variant labels shared by every animated component.
export const HIDDEN = 'hidden';
export const SHOWN = 'shown';
export const EXIT = 'exit';

/** Level 1 "hero slide": the text, inside an overflow-hidden mask. */
export const heroText: Variants = {
  [HIDDEN]: { x: '-105%' },
  [SHOWN]: { x: 0, transition: { duration: DURATION.heroIn, ease: easeOut } },
  [EXIT]: { x: '105%', transition: { duration: DURATION.heroOut, ease: easeIn } },
};

/** Level 1: the gold line under the text. Draws from the left, retracts to the right. */
export const heroLine: Variants = {
  [HIDDEN]: { scaleX: 0, originX: 0 },
  [SHOWN]: {
    scaleX: 1,
    originX: 0,
    transition: { duration: DURATION.lineIn, ease: easeOut, delay: LINE_DELAY },
  },
  [EXIT]: {
    scaleX: 0,
    originX: 1,
    // The origin jumps to the right first; only the scale animates.
    transition: { duration: DURATION.lineOut, ease: easeIn, originX: { duration: 0 } },
  },
};

/** Level 2 "drift": in from the left, out to the right. */
export const drift: Variants = {
  [HIDDEN]: { opacity: 0, x: -DRIFT_X },
  [SHOWN]: { opacity: 1, x: 0, transition: { duration: DURATION.driftIn, ease: easeOut } },
  [EXIT]: { opacity: 0, x: DRIFT_X, transition: { duration: DURATION.driftOut, ease: easeIn } },
};

/** Parent of drift children: staggers them in, and out in reverse (last leaves first). */
export const driftGroup: Variants = {
  [HIDDEN]: {},
  [SHOWN]: { transition: { delayChildren: stagger(STAGGER) } },
  [EXIT]: { transition: { delayChildren: stagger(STAGGER, { from: 'last' }) } },
};
