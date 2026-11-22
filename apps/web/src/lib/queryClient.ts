import { QueryClient } from '@tanstack/react-query';

// One client for the app. A module (not created in main.tsx) so the router can prefetch.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
