import type { KeyboardEvent } from 'react';

// Tab stops inside a modal panel: links, enabled buttons, and the checked radio of each group
// (a radio group is one Tab stop; arrow keys move within it).
const TAB_STOPS = 'a[href], button:not(:disabled), input[type="radio"]:checked';

/**
 * Focus trap for a panel's onKeyDown: Tab from the last stop goes to the first, Shift+Tab from
 * the first to the last, so focus never leaves the panel (not even for the browser's own UI).
 */
export function wrapFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const stops = event.currentTarget.querySelectorAll<HTMLElement>(TAB_STOPS);
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
