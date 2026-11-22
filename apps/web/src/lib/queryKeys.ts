// TanStack Query keys in one place: admin changes refresh the public pages' cache without
// one feature importing another.
export const queryKeys = {
  /** Every properties list (any filters): use to invalidate them all. */
  allProperties: ['properties'] as const,
  /** One list; `query` is the filter query string ('' = unfiltered, newest first). */
  properties: (query: string) => ['properties', query] as const,
  property: (id: number) => ['property', id] as const,
  locations: ['locations'] as const,
  inquiries: ['inquiries'] as const,
};
