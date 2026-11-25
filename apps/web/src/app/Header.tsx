import { useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { cn } from '../lib/cn';
import { useHasScrolled, useIsMobile } from '../lib/viewport';
import { MenuIcon, MobileMenu } from './MobileMenu';
import { NAV } from './nav';

// Sticky on all sizes, solid stone like the page. The hairline appears once the page scrolls.
// Inline links from md; below md a Menu button opens the full-screen menu (supersedes D50).
export function Header() {
  const scrolled = useHasScrolled();
  const location = useLocation();
  const isMobile = useIsMobile();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The location the menu was opened on. Derived, no effect: any navigation (a menu link,
  // Back) gives a new location key and closes it, and so does widening the screen past md.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const menuOpen = isMobile && openedOn === location.key;
  // True from opening until the close animation has finished (MobileMenu's onExited), so the
  // button's state changes only once the page is released, like everything else.
  const [menuShown, setMenuShown] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b-[0.5px] bg-stone',
        'transition-colors duration-300 ease-enter',
        scrolled ? 'border-navy/20' : 'border-transparent',
      )}
    >
      <div className="page flex items-center justify-between py-[18px]">
        <Link
          to="/"
          className="flex min-h-11 items-center font-serif leading-none font-semibold text-navy"
        >
          {/* Monogram on mobile, wordmark from md. Screen readers always hear the full name. */}
          <span aria-hidden className="text-[24px] tracking-[0.04em] md:hidden">
            WL
          </span>
          <span className="text-[22px] max-md:sr-only">White Lotus</span>
        </Link>
        <nav aria-label="Main" className="max-md:hidden">
          <ul className="flex gap-6">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  // "Residences" is active on "/" only; "Admin" on every /admin page. The active
                  // link gets aria-current="page", which keeps its gold line drawn (link-draw).
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'caps flex min-h-11 items-center text-[11px] font-normal text-slate',
                      'transition-colors duration-200 hover:text-navy',
                      isActive && 'text-navy',
                    )
                  }
                >
                  <span className="link-draw">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={menuShown}
          aria-controls={menuId}
          onClick={() => {
            setOpenedOn(location.key);
            setMenuShown(true);
          }}
          className="caps flex min-h-11 items-center gap-3 text-[11px] text-navy md:hidden"
        >
          {menuShown ? 'Close' : 'Menu'}
          <MenuIcon />
        </button>
      </div>
      <MobileMenu
        open={menuOpen}
        id={menuId}
        onClose={() => setOpenedOn(null)}
        onExited={() => setMenuShown(false)}
        triggerRef={triggerRef}
      />
    </header>
  );
}
