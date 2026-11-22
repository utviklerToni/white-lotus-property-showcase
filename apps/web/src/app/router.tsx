import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter, data } from 'react-router';
import { Layout } from './Layout';
import { PropertiesPage } from '../pages/PropertiesPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { RouteError } from './RouteError';

// Admin code is split out (React.lazy), so the public pages never download it.
const AdminLayout = lazy(() =>
  import('../features/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const AdminPropertiesPage = lazy(() =>
  import('../pages/admin/AdminPropertiesPage').then((m) => ({ default: m.AdminPropertiesPage })),
);

const AdminPropertyNewPage = lazy(() =>
  import('../pages/admin/AdminPropertyNewPage').then((m) => ({ default: m.AdminPropertyNewPage })),
);
const AdminPropertyEditPage = lazy(() =>
  import('../pages/admin/AdminPropertyEditPage').then((m) => ({
    default: m.AdminPropertyEditPage,
  })),
);

const AdminInquiriesPage = lazy(() =>
  import('../pages/admin/AdminInquiriesPage').then((m) => ({ default: m.AdminInquiriesPage })),
);

// Shown while the admin shell's code loads (pages inside have their own fallback).
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
