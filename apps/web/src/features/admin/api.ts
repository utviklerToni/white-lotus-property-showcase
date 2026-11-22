import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Inquiry, Property, PropertyData } from '@white-lotus/shared';
import { getAdminKey } from '../../lib/adminKey';
import { ApiError, request } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

/** GET /api/inquiries returns at most this many rows (API `LIMIT 200`). */
export const INQUIRY_LIMIT = 200;

/** The unfiltered list, newest first. Shares its cache entry with the public listing. */
const adminPropertiesQuery = queryOptions({
  queryKey: queryKeys.properties(''),
  queryFn: ({ signal }) => request<Property[]>('/properties', { signal }),
  staleTime: 60_000,
});

/** Every inquiry (newest first, capped at INQUIRY_LIMIT). Personal data: admin only. */
const adminInquiriesQuery = queryOptions({
  queryKey: queryKeys.inquiries,
  queryFn: ({ signal }) => request<Inquiry[]>('/inquiries', { signal, admin: true }),
  staleTime: 30_000,
});

export function useAdminProperties() {
  return useQuery(adminPropertiesQuery);
}

/** One property for the edit form. Shares its cache entry with the public detail page. */
export function useAdminProperty(id: number) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: ({ signal }) => request<Property>(`/properties/${id}`, { signal }),
    staleTime: 60_000,
    // An unknown id stays unknown: skip the retry on 404.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
  });
}

export function useAdminInquiries() {
  return useQuery(adminInquiriesQuery);
}

/**
 * Fills both admin tables' cache before the first click, so switching tabs shows data
 * at once. Only with a saved key: without one the gate shows the prompt and nothing loads.
 * The properties request is public and carries no key. Errors are swallowed by
 * prefetchQuery; the page's own query then retries and shows its error state.
 */
export function prefetchAdminLists(client: QueryClient) {
  if (getAdminKey() === null) return;
  void client.prefetchQuery(adminPropertiesQuery);
  void client.prefetchQuery(adminInquiriesQuery);
}

/**
 * Checks a key with one admin request. Not marked `admin`: the key isn't stored yet, and a
 * 401 here only means "wrong key". The inquiries it returns seed the cache.
 */
export function verifyAdminKey(key: string) {
  return request<Inquiry[]>('/inquiries', { headers: { 'x-admin-key': key } });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request<void>(`/properties/${id}`, { method: 'DELETE', admin: true }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.property(id) });
      // The delete cascades to its inquiries (FK ON DELETE CASCADE).
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries });
    },
    // Success or not (e.g. a 404 because it was already deleted), refresh the lists.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.allProperties });
      void queryClient.invalidateQueries({ queryKey: queryKeys.locations });
    },
  });
}

/** Create (no id) or full update (PUT) of a property. */
export function useSaveProperty(id?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PropertyData) =>
      id === undefined
        ? request<Property>('/properties', { method: 'POST', body: input, admin: true })
        : request<Property>(`/properties/${id}`, { method: 'PUT', body: input, admin: true }),
    onSuccess: (property) => {
      queryClient.setQueryData(queryKeys.property(property.id), property);
      void queryClient.invalidateQueries({ queryKey: queryKeys.allProperties });
      void queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      // Inquiries show the property name, which an edit may have changed.
      if (id !== undefined) void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries });
    },
  });
}
