import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { cn } from '../../lib/cn';
import { AdminKeyGate } from './AdminKeyGate';

const NAV = [{ to: '/admin/properties', label: 'Properties' }];

// Admin shell: key gate, sub-nav, the lazy page, and the toasts (sonner loads with admin only).
export function AdminLayout() {
  return (
    <div className="page py-10 md:py-14">
      <AdminKeyGate>
        <nav aria-label="Admin" className="mb-8 border-b-[0.5px] border-navy/20">
          <ul className="flex gap-6">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'caps flex min-h-11 items-center text-[11px] text-slate transition-colors duration-200 hover:text-navy',
                      'decoration-gold decoration-1 underline-offset-[6px]',
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
        <Suspense fallback={<AdminLoading />}>
          <Outlet />
        </Suspense>
      </AdminKeyGate>
      <Toaster
        position="bottom-right"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'flex w-[min(356px,calc(100vw-32px))] items-center gap-3 bg-navy px-4 py-3.5 text-sm text-stone',
            error: 'bg-danger text-white',
          },
        }}
      />
    </div>
  );
}

/** Suspense fallback while an admin page's code loads. */
export function AdminLoading() {
  return (
    <p role="status" className="py-10 text-sm text-slate">
      Loading…
    </p>
  );
}
