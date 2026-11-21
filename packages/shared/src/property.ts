import { z } from 'zod';

export const PROPERTY_STATUSES = ['available', 'under_construction', 'sold'] as const;
export const propertyStatusSchema = z.enum(PROPERTY_STATUSES, {
  error: 'Status must be available, under construction or sold',
});
export type PropertyStatus = z.infer<typeof propertyStatusSchema>;

// Trimmed, non-empty, capped text field with friendly messages.
const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, { error: `${label} is required` })
    .max(max, { error: `${label} must be at most ${max} characters` });

// Whole positive number. `.int()` also rejects values beyond Number.MAX_SAFE_INTEGER.
const positiveInt = (label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .int({ error: `${label} must be a whole number` })
    .positive({ error: `${label} must be a positive number` });

/** Body for POST and PUT /api/properties. Keys match the DB columns. PUT is a full replace. */
export const propertyInputSchema = z
  .object({
    name: requiredText('Name', 120),
    location: requiredText('Location', 120),
    price: positiveInt('Price'), // integer rupees
    size_sqft: positiveInt('Size'),
    bedrooms: positiveInt('Bedrooms').max(20, { error: 'Bedrooms must be 20 or fewer' }),
    description: requiredText('Description', 300),
    // Optional long copy. Empty or missing becomes null, so the DB never stores ''.
    details: z
      .string()
      .trim()
      .max(5000, { error: 'Details must be at most 5000 characters' })
      .nullish()
      .transform((value) => value || null),
    // Trim first, then check the URL. Only http(s), so no javascript: or data: URLs.
    image_url: z
      .string({ error: 'Image URL is required' })
      .trim()
      .max(2000, { error: 'Image URL is too long' })
      .pipe(z.url({ protocol: /^https?$/, error: 'Image URL must be a valid http(s) URL' })),
    status: propertyStatusSchema,
  })
  .strict();

/** What the form/client sends (before transforms). */
export type PropertyInput = z.input<typeof propertyInputSchema>;
/** What the API gets after parsing (trimmed, details normalised to null). */
export type PropertyData = z.output<typeof propertyInputSchema>;

/** A property as returned by the API. */
export type Property = PropertyData & {
  id: number;
  created_at: string;
  updated_at: string;
};

export const SORT_OPTIONS = ['price_asc', 'price_desc', 'newest', 'size_desc'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** Query for GET /api/properties. Not strict: unknown query keys are dropped, not rejected. */
export const propertyListQuerySchema = z.object({
  location: z.string().trim().min(1).max(120).optional(),
  minBedrooms: z.coerce
    .number({ error: 'minBedrooms must be a number' })
    .int({ error: 'minBedrooms must be a whole number' })
    .min(1, { error: 'minBedrooms must be at least 1' })
    .max(20, { error: 'minBedrooms must be 20 or fewer' })
    .optional(),
  status: propertyStatusSchema.optional(),
  sort: z
    .enum(SORT_OPTIONS, { error: `sort must be one of ${SORT_OPTIONS.join(', ')}` })
    .default('newest'),
});
export type PropertyListQuery = z.output<typeof propertyListQuerySchema>;

/** `:id` route param. "abc", "0" and "1.5" all fail with 400. */
export const idParamSchema = z.object({
  id: z.coerce
    .number({ error: 'id must be a number' })
    .int({ error: 'id must be a whole number' })
    .positive({ error: 'id must be positive' }),
});
export type IdParam = z.output<typeof idParamSchema>;
