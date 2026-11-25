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
  /** The detail page's longer title line, which the stats appear along. */
  titleLineIn: 1.1,
  statIn: 0.5,
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

/** Detail title line: a slower, full-width hero line (DURATION.titleLineIn). */
export const titleLine: Variants = {
  [HIDDEN]: { scaleX: 0, originX: 0 },
  [SHOWN]: {
    scaleX: 1,
    originX: 0,
    transition: { duration: DURATION.titleLineIn, ease: easeOut, delay: LINE_DELAY },
  },
};

// Where along the title line each stat appears (share of the line's length): roughly the centres
// of the four desktop columns. Each stat starts as the drawn part of the line reaches its mark.
const STAT_MARKS = [0.15, 0.4, 0.65, 0.9];

/**
 * Share of the duration at which a cubic-bezier ease has covered `progress` of the distance.
 * Bisects the curve parameter s on the progress axis (monotonic here), then reads the time axis.
 */
function timeAtProgress(ease: readonly [number, number, number, number], progress: number) {
  const [x1, y1, x2, y2] = ease;
  // One axis of a cubic bezier from (0,0) to (1,1) with control values a and b.
  const axis = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    if (axis(y1, y2, mid) < progress) low = mid;
    else high = mid;
  }
  return axis(x1, x2, (low + high) / 2);
}

// With easeOut over 1.1s: 188, 260, 358, 561ms after the name starts.
const STAT_DELAYS = STAT_MARKS.map(
  (mark) => LINE_DELAY + DURATION.titleLineIn * timeAtProgress(easeOut, mark),
);

/** Detail stats: fade in and rise 8px as the title line's tip reaches them. `custom` is the index. */
export const statReveal: Variants = {
  [HIDDEN]: { opacity: 0, y: 8 },
  [SHOWN]: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.statIn,
      ease: easeOut,
      delay: STAT_DELAYS[index] ?? LINE_DELAY + DURATION.titleLineIn,
    },
  }),
};
