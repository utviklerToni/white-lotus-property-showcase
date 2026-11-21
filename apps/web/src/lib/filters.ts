import { propertyListQuerySchema, type PropertyListQuery } from '@white-lotus/shared';

// Filters live in the URL. They are parsed with the same schema the API uses,
// and derived on every render (never copied into state).
export function readFilters(params: URLSearchParams): PropertyListQuery {
  const raw = Object.fromEntries(params);
  const result = propertyListQuerySchema.safeParse(raw);
  if (result.success) return result.data;
  // Drop only the keys that failed (e.g. ?minBedrooms=lots), keep the rest.
  const bad = new Set(result.error.issues.map((issue) => String(issue.path[0])));
  const kept = Object.entries(raw).filter(([key]) => !bad.has(key));
  return propertyListQuerySchema.parse(Object.fromEntries(kept));
}

// Query string for the URL and the API call. Leaves out empty values and the default sort.
export function filtersToParams(filters: PropertyListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.location) params.set('location', filters.location);
  if (filters.minBedrooms) params.set('minBedrooms', String(filters.minBedrooms));
  if (filters.status) params.set('status', filters.status);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  return params;
}
