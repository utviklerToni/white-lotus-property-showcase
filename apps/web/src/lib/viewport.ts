import { useSyncExternalStore } from 'react';

// Small browser-state hooks read with useSyncExternalStore (no effect + state copy).

// Tailwind's md breakpoint (48rem).
const MD_UP = '(min-width: 48rem)';

function subscribeMd(onChange: () => void) {
  const query = window.matchMedia(MD_UP);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** True below Tailwind's md breakpoint. */
export function useIsMobile() {
  return useSyncExternalStore(subscribeMd, () => !window.matchMedia(MD_UP).matches);
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/** True once the page has scrolled at all. Re-renders only when that flips. */
export function useHasScrolled() {
  return useSyncExternalStore(subscribeScroll, () => window.scrollY > 0);
}
