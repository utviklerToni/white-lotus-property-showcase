import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Inquiry, Property } from '@white-lotus/shared';
import { request } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

/** GET /api/inquiries returns at most this many rows (API `LIMIT 200`). */
export const INQUIRY_LIMIT = 200;

/** The unfiltered list, newest first. Shares its cache entry with the public listing. */
export function useAdminProperties() {
  return useQuery({
    queryKey: queryKeys.properties(''),
    queryFn: ({ signal }) => request<Property[]>('/properties', { signal }),
    staleTime: 60_000,
  });
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
