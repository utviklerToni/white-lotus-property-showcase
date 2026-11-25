import { Link, useLocation } from 'react-router';
import { readFromListing, type BackToListingState } from './listingReturn';

// Slim row under the header. Goes back to the listing with the filters and scroll position the
// user had (D76); opened directly (no state), it goes to the plain listing at the top.
export function BackToResidences() {
  const from = readFromListing(useLocation().state);
  const state: BackToListingState | undefined = from
    ? { restoreScrollY: from.listingScrollY }
    : undefined;

  return (
    <div className="page">
      <Link
        to={{ pathname: '/', search: from?.listingSearch ?? '' }}
        state={state}
        className="caps inline-flex min-h-11 items-center gap-2 text-[11px] font-normal text-navy"
      >
        <span aria-hidden>←</span> <span className="link-draw">All residences</span>
      </Link>
    </div>
  );
}
