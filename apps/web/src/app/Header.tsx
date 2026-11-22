import { Link, NavLink } from 'react-router';
import { cn } from '../lib/cn';

// Inline links on every screen size (no menu button, D50).
const NAV = [
  { to: '/', label: 'Residences' },
  { to: '/admin', label: 'Admin' },
];

export function Header() {
  return (
    <header className="border-b-[0.5px] border-navy/20">
      <div className="page flex items-center justify-between py-[18px]">
        <Link to="/" className="caps flex min-h-11 items-center text-[11px] font-medium text-navy">
          White Lotus
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-6">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  // "Residences" is active on "/" only; "Admin" on every /admin page.
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'caps flex min-h-11 items-center text-[11px] font-normal text-slate',
                      'decoration-gold decoration-1 underline-offset-[6px] transition-colors duration-200 hover:text-navy',
                      isActive && 'text-navy underline',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
