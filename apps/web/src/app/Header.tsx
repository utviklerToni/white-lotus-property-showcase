import { Link, NavLink } from 'react-router';
import { cn } from '../lib/cn';
import { useHasScrolled } from '../lib/viewport';

// Inline links on every screen size (no menu button, D50).
const NAV = [
  { to: '/', label: 'Residences' },
  { to: '/admin', label: 'Admin' },
];

// Sticky on all sizes, solid stone like the page. The hairline appears once the page scrolls.
export function Header() {
  const scrolled = useHasScrolled();

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
        <nav aria-label="Main">
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
      </div>
    </header>
  );
}
