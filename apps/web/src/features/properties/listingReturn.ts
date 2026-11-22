// Returning from a detail page to the listing as the user left it (D76): a card click stores
// the listing's search and scroll position in router state, the detail page's back link sends
// the scroll position back, and the listing restores it once its results have rendered.

/** Router state on a detail page opened from a card. */
export type FromListingState = { listingSearch: string; listingScrollY: number };
/** Router state on the listing when reached through "← All residences". */
export type BackToListingState = { restoreScrollY: number };

// Router state is `unknown` (any history entry can hold anything), so check each field.
export function readFromListing(state: unknown): FromListingState | null {
  const value = state as Partial<FromListingState> | null;
  if (typeof value?.listingSearch !== 'string' || typeof value.listingScrollY !== 'number') {
    return null;
  }
  return { listingSearch: value.listingSearch, listingScrollY: value.listingScrollY };
}

export function readRestoreScrollY(state: unknown): number | undefined {
  const value = state as Partial<BackToListingState> | null;
  return typeof value?.restoreScrollY === 'number' ? value.restoreScrollY : undefined;
}
