import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  idParamSchema,
  inquiryInputSchema,
  propertyInputSchema,
  propertyListQuerySchema,
  type InquiryInput,
  type PropertyInput,
} from '../src';

const property: PropertyInput = {
  name: 'Test Villa',
  location: 'Hebbal',
  price: 50_000_000,
  size_sqft: 3000,
  bedrooms: 3,
  description: 'A test listing.',
  details: null,
  image_url: 'https://images.example.com/villa.jpg',
  status: 'available',
};

const inquiry: InquiryInput = {
  name: 'Asha Nair',
  email: 'asha.nair@example.com',
  phone: '+91 98450 12345',
  message: 'Is this home still available?',
};

// First error message for a field, or undefined if the input is valid.
const errorFor = (schema: z.ZodType, input: unknown, field: string) =>
  schema.safeParse(input).error?.issues.find((issue) => issue.path[0] === field)?.message;

describe('propertyInputSchema', () => {
  it('accepts a valid property', () => {
    expect(propertyInputSchema.safeParse(property).success).toBe(true);
  });

  it.each([
    [0, 'Price must be a positive number'],
    [-1, 'Price must be a positive number'],
    [1.5, 'Price must be a whole number'],
    ['5', 'Price must be a number'],
  ])('rejects price %s', (price, message) => {
    expect(errorFor(propertyInputSchema, { ...property, price }, 'price')).toBe(message);
  });

  it('rejects a blank name after trimming', () => {
    expect(errorFor(propertyInputSchema, { ...property, name: '   ' }, 'name')).toBe(
      'Name is required',
    );
  });

  it('turns blank details into null', () => {
    expect(propertyInputSchema.parse({ ...property, details: '   ' }).details).toBeNull();
  });

  it('only allows http(s) image URLs', () => {
    const bad = { ...property, image_url: 'javascript:alert(1)' };
    expect(errorFor(propertyInputSchema, bad, 'image_url')).toBeDefined();
  });

  it('rejects unknown keys', () => {
    expect(propertyInputSchema.safeParse({ ...property, id: 1 }).success).toBe(false);
  });
});

describe('inquiryInputSchema', () => {
  it('accepts a valid inquiry and trims the email', () => {
    const parsed = inquiryInputSchema.parse({ ...inquiry, email: '  asha.nair@example.com ' });
    expect(parsed.email).toBe('asha.nair@example.com');
  });

  it('rejects a bad email', () => {
    expect(errorFor(inquiryInputSchema, { ...inquiry, email: 'asha@' }, 'email')).toBe(
      'Enter a valid email address',
    );
  });

  it.each(['12345', '+91 1234', '1234567890123456'])('rejects phone %s (digit count)', (phone) => {
    expect(errorFor(inquiryInputSchema, { ...inquiry, phone }, 'phone')).toBe(
      'Phone must have 10 to 15 digits',
    );
  });

  it.each(['', '   '])('asks for a phone number when phone is %j', (phone) => {
    expect(errorFor(inquiryInputSchema, { ...inquiry, phone }, 'phone')).toBe(
      'Enter a phone number',
    );
  });

  it('rejects letters in the phone number', () => {
    expect(errorFor(inquiryInputSchema, { ...inquiry, phone: '98450abc12' }, 'phone')).toBe(
      'Phone may only contain digits, spaces, + and -',
    );
  });

  it('rejects a message shorter than 10 characters', () => {
    expect(errorFor(inquiryInputSchema, { ...inquiry, message: 'Hi there' }, 'message')).toBe(
      'Message must be at least 10 characters',
    );
  });
});

describe('query and param schemas', () => {
  it('defaults sort to newest and drops unknown query keys', () => {
    expect(propertyListQuerySchema.parse({ foo: 'bar' })).toEqual({ sort: 'newest' });
  });

  it('rejects an unknown sort', () => {
    expect(propertyListQuerySchema.safeParse({ sort: 'name' }).success).toBe(false);
  });

  it.each(['abc', '0', '1.5'])('rejects id %s', (id) => {
    expect(idParamSchema.safeParse({ id }).success).toBe(false);
  });
});
