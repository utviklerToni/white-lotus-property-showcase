import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Property, PropertyListQuery } from '@white-lotus/shared';
import { filtersToParams } from '../lib/filters';
import { request } from './client';

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
