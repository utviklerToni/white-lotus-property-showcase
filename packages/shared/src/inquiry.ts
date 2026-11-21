import { z } from 'zod';

// Digits, spaces, "+" and "-" only (e.g. "+91 98450 12345").
const PHONE_CHARS = /^\+?[\d\s-]+$/;
const countDigits = (value: string) => value.replace(/\D/g, '').length;

/** Body for POST /api/properties/:id/inquiries. The property id comes from the URL. */
export const inquiryInputSchema = z
  .object({
    name: z
      .string({ error: 'Name is required' })
      .trim()
      .min(2, { error: 'Name must be at least 2 characters' })
      .max(100, { error: 'Name must be at most 100 characters' }),
    // Trim before the email check, so pasted addresses with spaces still pass.
    email: z
      .string({ error: 'Email is required' })
      .trim()
      .max(254, { error: 'Email is too long' })
      .pipe(z.email({ error: 'Enter a valid email address' })),
    phone: z
      .string({ error: 'Phone is required' })
      .trim()
      .regex(PHONE_CHARS, { error: 'Phone may only contain digits, spaces, + and -' })
      .refine((value) => countDigits(value) >= 10 && countDigits(value) <= 15, {
        error: 'Phone must have 10 to 15 digits',
      }),
    message: z
      .string({ error: 'Message is required' })
      .trim()
      .min(10, { error: 'Message must be at least 10 characters' })
      .max(2000, { error: 'Message must be at most 2000 characters' }),
  })
  .strict();

export type InquiryInput = z.input<typeof inquiryInputSchema>;
export type InquiryData = z.output<typeof inquiryInputSchema>;

/** An inquiry as returned by GET /api/inquiries (joined with the property name). */
export type Inquiry = InquiryData & {
  id: number;
  property_id: number;
  property_name: string;
  created_at: string;
};
