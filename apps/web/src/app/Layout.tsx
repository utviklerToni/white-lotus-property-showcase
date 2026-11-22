import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hidden until focused: first Tab stop, jumps past the header. */}
      <a
        href="#main"
        className="caps sr-only bg-navy px-4 py-3 text-[11px] text-stone focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Header />
      {/* tabIndex -1 so the skip link can move focus here. */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      {/* New pages open at the top; browser Back restores the previous scroll position.
          Filter changes opt out with preventScrollReset; "← All residences" restores its own (D76). */}
      <ScrollRestoration />
    </div>
  );
}
