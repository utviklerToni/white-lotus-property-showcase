import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter, data } from 'react-router';
import { queryClient } from '../lib/queryClient';
import { Layout } from './Layout';
import { PropertiesPage } from '../pages/PropertiesPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { RouteError } from './RouteError';

// Admin code is split out (React.lazy), so the public pages never download it.
const loadAdminProperties = () => import('../pages/admin/AdminPropertiesPage');
const loadAdminPropertyNew = () => import('../pages/admin/AdminPropertyNewPage');
const loadAdminPropertyEdit = () => import('../pages/admin/AdminPropertyEditPage');
const loadAdminInquiries = () => import('../pages/admin/AdminInquiriesPage');

// Loading the admin shell also starts every admin page chunk, once. The browser caches each
// module, so the first click between admin pages doesn't show the Suspense fallback. It also
// prefetches both admin lists (only with a saved key), so the first click shows data at once.
const AdminLayout = lazy(() => {
  void import('../features/admin/api').then((m) => m.prefetchAdminLists(queryClient));
  void loadAdminProperties();
  void loadAdminPropertyNew();
  void loadAdminPropertyEdit();
  void loadAdminInquiries();
  return import('../features/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }));
});
const AdminPropertiesPage = lazy(() =>
  loadAdminProperties().then((m) => ({ default: m.AdminPropertiesPage })),
);
const AdminPropertyNewPage = lazy(() =>
  loadAdminPropertyNew().then((m) => ({ default: m.AdminPropertyNewPage })),
);
const AdminPropertyEditPage = lazy(() =>
  loadAdminPropertyEdit().then((m) => ({ default: m.AdminPropertyEditPage })),
);
const AdminInquiriesPage = lazy(() =>
  loadAdminInquiries().then((m) => ({ default: m.AdminInquiriesPage })),
);

// Shown while the admin shell's code loads. AdminLayout has the one boundary around its outlet.
const adminFallback = (
  <p role="status" className="page py-10 text-sm text-slate">
    Loading admin…
  </p>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    // Last resort if the layout itself fails to render (no header then).
    errorElement: <RouteError />,
    children: [
      {
        // Pathless route: a page error renders RouteError inside the layout, keeping the header.
        errorElement: <RouteError />,
        children: [
          { index: true, element: <PropertiesPage /> },
          { path: 'properties/:id', element: <PropertyDetailPage /> },
          {
            path: 'admin',
            element: (
              <Suspense fallback={adminFallback}>
                <AdminLayout />
              </Suspense>
            ),
            children: [
              { index: true, element: <Navigate to="properties" replace /> },
              { path: 'properties', element: <AdminPropertiesPage /> },
              { path: 'properties/new', element: <AdminPropertyNewPage /> },
              { path: 'properties/:id/edit', element: <AdminPropertyEditPage /> },
              { path: 'inquiries', element: <AdminInquiriesPage /> },
            ],
          },
          // Unknown URL: throw a real 404, so RouteError (the errorElement above) shows not-found.
          {
            path: '*',
            loader: () => {
              throw data(null, { status: 404 });
            },
          },
        ],
      },
    ],
  },
]);
