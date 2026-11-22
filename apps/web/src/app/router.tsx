import { Navigate, createBrowserRouter, data } from 'react-router';
import { queryClient } from '../lib/queryClient';
import { Layout } from './Layout';
import { PropertiesPage } from '../pages/PropertiesPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { RouteError } from './RouteError';

// Admin code is split out with route-level `lazy`: the router loads a module during the
// navigation and keeps the current page on screen until it's ready, so nothing flashes.
// Public pages never download it.
const loadAdminProperties = () => import('../pages/admin/AdminPropertiesPage');
const loadAdminPropertyNew = () => import('../pages/admin/AdminPropertyNewPage');
const loadAdminPropertyEdit = () => import('../pages/admin/AdminPropertyEditPage');
const loadAdminInquiries = () => import('../pages/admin/AdminInquiriesPage');

// Loading the admin shell also starts every admin page chunk and, with a saved key, both
// admin lists, once. Later admin clicks then find the code and data already cached.
async function loadAdminLayout() {
  void import('../features/admin/api').then((m) => m.prefetchAdminLists(queryClient));
  void loadAdminProperties();
  void loadAdminPropertyNew();
  void loadAdminPropertyEdit();
  void loadAdminInquiries();
  const m = await import('../features/admin/AdminLayout');
  return { Component: m.AdminLayout };
}

// Only on a first page load straight into /admin (the header stays; this fills the outlet).
function AdminHydrateFallback() {
  return (
    <p role="status" className="page py-10 text-sm text-slate">
      Loading admin…
    </p>
  );
}

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
            lazy: loadAdminLayout,
            HydrateFallback: AdminHydrateFallback,
            children: [
              { index: true, element: <Navigate to="properties" replace /> },
              {
                path: 'properties',
                lazy: async () => ({
                  Component: (await loadAdminProperties()).AdminPropertiesPage,
                }),
              },
              {
                path: 'properties/new',
                lazy: async () => ({
                  Component: (await loadAdminPropertyNew()).AdminPropertyNewPage,
                }),
              },
              {
                path: 'properties/:id/edit',
                lazy: async () => ({
                  Component: (await loadAdminPropertyEdit()).AdminPropertyEditPage,
                }),
              },
              {
                path: 'inquiries',
                lazy: async () => ({ Component: (await loadAdminInquiries()).AdminInquiriesPage }),
              },
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
