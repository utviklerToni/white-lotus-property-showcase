import { NavLink, Outlet } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { clearAdminKey } from '../../lib/adminKey';
import { cn } from '../../lib/cn';
import { queryKeys } from '../../lib/queryKeys';
import { AdminKeyGate } from './AdminKeyGate';

const NAV = [
  { to: '/admin/properties', label: 'Properties' },
  { to: '/admin/inquiries', label: 'Enquiries' },
];

// Admin shell: key gate, sub-nav, the page, and the toasts (sonner loads with admin only).
export function AdminLayout() {
  const queryClient = useQueryClient();

  // Forget the key and the cached enquiries (personal data); the gate shows the key prompt.
  function signOut() {
    clearAdminKey();
    queryClient.removeQueries({ queryKey: queryKeys.inquiries });
    toast.success('Signed out');
  }

  return (
    <div className="page py-10 md:py-14">
      <AdminKeyGate>
        <nav aria-label="Admin" className="mb-8 border-b-[0.5px] border-navy/20">
          <ul className="flex flex-wrap gap-x-6">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'caps flex min-h-11 items-center text-[11px] text-slate transition-colors duration-200 hover:text-navy',
                      isActive && 'text-navy',
                    )
                  }
                >
                  {/* aria-current="page" on the active link keeps the gold line drawn. */}
                  <span className="link-draw">{item.label}</span>
                </NavLink>
              </li>
            ))}
            {/* A button, not a link: it changes state rather than going somewhere. */}
            <li className="ml-auto">
              <button
                type="button"
                onClick={signOut}
                className="caps flex min-h-11 items-center text-[11px] text-slate transition-colors duration-200 hover:text-navy"
              >
                Sign out
              </button>
            </li>
          </ul>
        </nav>
        <Outlet />
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

/** Shown while admin data loads (e.g. the edit form's property). */
export function AdminLoading() {
  return (
    <p role="status" className="py-10 text-sm text-slate">
      Loading…
    </p>
  );
}
