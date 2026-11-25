import { stagger, type Transition, type Variants } from 'motion/react';

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
  overlayIn: 0.6,
  overlayOut: 0.45,
  iconIn: 0.45,
  iconOut: 0.35,
  /** The filter pill growing into its card and back (shared layoutId). */
  morph: 0.45,
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

/**
 * A gold line that draws from the left and retracts to the right on exit. Leave `delay` out when
 * a parent times it (delayChildren): a child's own delay replaces the one its parent hands down.
 */
function goldLine(duration: number, delay?: number): Variants {
  const timing = delay === undefined ? {} : { delay };
  return {
    [HIDDEN]: { scaleX: 0, originX: 0 },
    [SHOWN]: { scaleX: 1, originX: 0, transition: { duration, ease: easeOut, ...timing } },
    [EXIT]: {
      scaleX: 0,
      originX: 1,
      // The origin jumps to the right first; only the scale animates.
      transition: { duration: DURATION.lineOut, ease: easeIn, originX: { duration: 0 } },
    },
  };
}

/** Level 1: the gold line under the text, 150ms after it. */
export const heroLine = goldLine(DURATION.lineIn, LINE_DELAY);

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
export const titleLine = goldLine(DURATION.titleLineIn, LINE_DELAY);

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

// Mobile menu overlay (DESIGN.md §5). Opening: overlay, wordmark, items, their hairlines, then
// the foot. Closing runs the other way and everything leaves to the right. Children timed by a
// parent (items, hairlines, foot) have no delay of their own, as it would replace the parent's.
const MENU = {
  /** How far the overlay's contents drift, in px. */
  overlayX: 24,
  wordmarkIn: 0.12,
  /** The wordmark leaves after the items have started to. */
  wordmarkOut: 0.2,
  itemsIn: 0.26,
  /** Menu items are 90ms apart (a touch slower than other drift groups). */
  itemGap: 0.09,
  /** Each hairline starts once its item has nearly landed. */
  itemLine: 0.35,
  /** The foot (rule, then the city) starts after the last of the two items. */
  footIn: 0.75,
  footGap: 0.15,
} as const;

// The overlay leaves once its contents have: the wordmark is last (its delay plus its slide).
const MENU_CONTENTS_OUT = MENU.wordmarkOut + DURATION.heroOut;

/**
 * The overlay's background panel: opacity only. It never moves, so it covers the whole screen at
 * every frame (a drifting panel showed a strip of page beside it).
 */
export const menuOverlay: Variants = {
  [HIDDEN]: { opacity: 0 },
  [SHOWN]: { opacity: 1, transition: { duration: DURATION.overlayIn, ease: easeOut } },
  [EXIT]: {
    opacity: 0,
    transition: { duration: DURATION.overlayOut, ease: easeIn, delay: MENU_CONTENTS_OUT },
  },
};

/**
 * Everything on the panel: drifts in from the left with the panel's fade, out to the right as it
 * fades out. Both exits use the same explicit delay (no `when: 'afterChildren'` on the panel, which
 * would wait for this drift too and run the two one after the other).
 */
export const menuContents: Variants = {
  [HIDDEN]: { x: -MENU.overlayX },
  [SHOWN]: { x: 0, transition: { duration: DURATION.overlayIn, ease: easeOut } },
  [EXIT]: {
    x: MENU.overlayX,
    transition: { duration: DURATION.overlayOut, ease: easeIn, delay: MENU_CONTENTS_OUT },
  },
};

/** Overlay wordmark: the Level 1 slide, a little after the overlay. */
export const menuWordmark: Variants = {
  [HIDDEN]: heroText[HIDDEN] ?? {},
  [SHOWN]: {
    x: 0,
    transition: { duration: DURATION.heroIn, ease: easeOut, delay: MENU.wordmarkIn },
  },
  [EXIT]: {
    x: '105%',
    transition: { duration: DURATION.heroOut, ease: easeIn, delay: MENU.wordmarkOut },
  },
};

/** The list of menu items: staggered in from 260ms, out last-first. */
export const menuItems: Variants = {
  [HIDDEN]: {},
  [SHOWN]: { transition: { delayChildren: stagger(MENU.itemGap, { startDelay: MENU.itemsIn }) } },
  [EXIT]: { transition: { delayChildren: stagger(MENU.itemGap, { from: 'last' }) } },
};

/** One menu item: a drift whose hairline (its child) starts once the item has nearly landed. */
export const menuItem: Variants = {
  [HIDDEN]: drift[HIDDEN] ?? {},
  [SHOWN]: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.driftIn, ease: easeOut, delayChildren: MENU.itemLine },
  },
  // Leaves with its hairline retracting at the same time, last item first (menuItems).
  [EXIT]: drift[EXIT] ?? {},
};

/** The hairline under a menu item, timed by its item. */
export const menuItemLine = goldLine(DURATION.lineIn);

/** The menu foot: the short rule, then the city. */
export const menuFoot: Variants = {
  [HIDDEN]: {},
  [SHOWN]: { transition: { delayChildren: stagger(MENU.footGap, { startDelay: MENU.footIn }) } },
  [EXIT]: {},
};

/** The foot's short rule, timed by the foot group. */
export const menuRule = goldLine(DURATION.lineIn);

/**
 * One line of the two-line menu icon; `custom` is 1 for the top line, -1 for the bottom one.
 * Shown, the lines meet in the middle (they sit 6px apart) and turn into an X.
 */
export const menuIconLine: Variants = {
  [HIDDEN]: { y: 0, rotate: 0 },
  [SHOWN]: (side: number) => ({
    y: 3 * side,
    rotate: 45 * side,
    transition: { duration: DURATION.iconIn, ease: easeOut },
  }),
  [EXIT]: { y: 0, rotate: 0, transition: { duration: DURATION.iconOut, ease: easeIn } },
};

// Mobile filter sheet (DESIGN.md §5): the pill grows into the card, then the card's sections
// drift in. Closing shrinks the card back into the pill.

/** The pill-to-card morph (a layout animation, so it needs domMax: see lib/motionMax.ts). */
export const MORPH: Transition = { duration: DURATION.morph, ease: easeOut };

/** Card sections: Level 2 drift, starting once the morph has nearly settled. */
export const sheetContents: Variants = {
  [HIDDEN]: {},
  [SHOWN]: {
    transition: { delayChildren: stagger(STAGGER, { startDelay: DURATION.morph * 0.6 }) },
  },
};

/** The card's collapse chevron: turns from pointing up (the pill's) to pointing down. */
export const sheetChevron: Variants = {
  [HIDDEN]: { rotate: 0 },
  [SHOWN]: { rotate: 180, transition: MORPH },
};

/** The pill's label after a close: fades in as the card finishes shrinking into it. */
export const pillLabel: Variants = {
  [HIDDEN]: { opacity: 0 },
  [SHOWN]: {
    opacity: 1,
    transition: { duration: 0.3, ease: easeOut, delay: DURATION.morph * 0.6 },
  },
};

/** The dimmed backdrop behind the card. */
export const sheetBackdrop: Variants = {
  [HIDDEN]: { opacity: 0 },
  [SHOWN]: { opacity: 1, transition: { duration: DURATION.morph, ease: easeOut } },
  [EXIT]: { opacity: 0, transition: { duration: DURATION.morph, ease: easeIn } },
};
