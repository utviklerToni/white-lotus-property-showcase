import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Property, PropertyListQuery } from '@white-lotus/shared';
import { filtersToParams } from './filters';
import { ApiError, request } from '../../lib/apiClient';

export function useProperties(filters: PropertyListQuery) {
  const query = filtersToParams(filters).toString();
  return useQuery({
    queryKey: ['properties', query],
    queryFn: ({ signal }) => request<Property[]>(`/properties${query && `?${query}`}`, { signal }),
    staleTime: 60_000,
    // Keep showing the previous results (dimmed) while new filters load.
    placeholderData: keepPreviousData,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: ({ signal }) => request<string[]>('/locations', { signal }),
    // Locations change only when listings are added; 5 minutes is plenty.
    staleTime: 5 * 60_000,
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: ({ signal }) => request<Property>(`/properties/${id}`, { signal }),
    staleTime: 60_000,
    // An unknown id stays unknown: skip the default retry on 404.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
  });
}
