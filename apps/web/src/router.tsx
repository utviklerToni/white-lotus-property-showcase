import { createBrowserRouter, data } from 'react-router';
import { Layout } from './components/Layout';
import { PropertiesPage } from './pages/PropertiesPage';
import { RouteError } from './pages/RouteError';

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
