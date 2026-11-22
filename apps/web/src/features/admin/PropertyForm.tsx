import { useId, useState, type ClipboardEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm, useWatch, type Control, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  PROPERTY_STATUSES,
  propertyInputSchema,
  type Property,
  type PropertyData,
  type PropertyInput,
} from '@white-lotus/shared';
import { ApiError } from '../../lib/apiClient';
import { cn } from '../../lib/cn';
import { STATUS_LABELS, formatPrice } from '../../lib/format';
import { imageSources } from '../../lib/images';
import { useSaveProperty } from './api';

type FieldName = keyof PropertyInput;

const isFieldName = (key: string): key is FieldName =>
  Object.hasOwn(propertyInputSchema.shape, key);

// DESIGN.md §4 Admin: white fill, no border, label above, error below in danger red.
const INPUT = 'block min-h-11 w-full bg-white p-3 text-sm text-navy';

// Text inputs give strings; the schema wants numbers. Commas and spaces are dropped
// ("1,25,00,000"), an empty field becomes undefined ("must be a number"), anything else
// becomes NaN and fails the same check.
function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value; // a default value from the edit form
  const text = String(value ?? '').replace(/[\s,]/g, '');
  return text === '' ? undefined : Number(text);
}

function toDefaults(property?: Property): DefaultValues<PropertyInput> {
  if (!property) {
    return {
      name: '',
      location: '',
      description: '',
      details: '',
      image_url: '',
      status: 'available',
    };
  }
  // Only the schema's keys: the API rejects unknown ones (id, created_at) with a 400.
  return {
    name: property.name,
    location: property.location,
    price: property.price,
    size_sqft: property.size_sqft,
    bedrooms: property.bedrooms,
    description: property.description,
    details: property.details ?? '',
    image_url: property.image_url,
    status: property.status,
  };
}

export function PropertyForm({ property }: { property?: Property }) {
  const formId = useId();
  const navigate = useNavigate();
  const save = useSaveProperty(property?.id);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<PropertyInput, unknown, PropertyData>({
    resolver: zodResolver(propertyInputSchema),
    defaultValues: toDefaults(property),
  });

  const submit = handleSubmit((data) => {
    save.mutate(data, {
      onSuccess: (saved) => {
        toast.success(property ? `${saved.name} was saved.` : `${saved.name} was added.`);
        void navigate('/admin/properties');
      },
      onError: (error) => {
        // A 401 brings back the key prompt (apiClient interceptor); no toast needed.
        if (error instanceof ApiError && error.status === 401) return;
        if (error instanceof ApiError && error.fields) {
          // Server field errors go onto their inputs; focus the first one.
          let first = true;
          for (const [key, message] of Object.entries(error.fields)) {
            if (!isFieldName(key)) continue;
            setError(key, { message }, { shouldFocus: first });
            first = false;
          }
          toast.error('Some fields need attention.');
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          toast.error('This property no longer exists.');
          return;
        }
        toast.error(`Could not save the property. ${error.message}`);
      },
    });
  });

  const priceField = register('price', { setValueAs: toNumber });

  // Paste "₹1,25,00,000" and the field shows 125000000. The cleaned text goes in at the cursor,
  // then through the field's own onChange, so the value is read the same way as typing.
  function pastePrice(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text');
    const cleaned = pasted.replace(/[\s,₹]/g, '');
    if (cleaned === pasted) return;
    event.preventDefault();
    const input = event.currentTarget;
    input.setRangeText(cleaned, input.selectionStart ?? 0, input.selectionEnd ?? 0, 'end');
    void priceField.onChange({ target: input, type: 'change' });
  }

  const ids = (name: FieldName) => `${formId}-${name}`;
  const fieldProps = (name: FieldName, hint?: boolean) => {
    const id = ids(name);
    const message = errors[name]?.message;
    const describedBy = [hint && `${id}-hint`, message && `${id}-error`].filter(Boolean);
    return {
      id,
      'aria-invalid': message ? true : undefined,
      'aria-describedby': describedBy.length ? describedBy.join(' ') : undefined,
    };
  };

  return (
    // noValidate: the shared Zod schema gives the messages, not the browser's bubbles.
    // Desktop: fields left, a sticky image preview right. Mobile: fields, preview, buttons.
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-12"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:col-start-1">
        <Field id={ids('name')} label="Name" error={errors.name?.message}>
          <input {...register('name')} {...fieldProps('name')} className={INPUT} />
        </Field>
        <Field id={ids('location')} label="Location" error={errors.location?.message}>
          <input {...register('location')} {...fieldProps('location')} className={INPUT} />
        </Field>

        <Field
          id={ids('price')}
          label="Price (₹)"
          error={errors.price?.message}
          hint={<PriceHint control={control} />}
        >
          <input
            {...priceField}
            {...fieldProps('price', true)}
            inputMode="numeric"
            autoComplete="off"
            onPaste={pastePrice}
            className={cn(INPUT, 'tabular-nums')}
          />
        </Field>
        <Field id={ids('size_sqft')} label="Size (sq ft)" error={errors.size_sqft?.message}>
          <input
            {...register('size_sqft', { setValueAs: toNumber })}
            {...fieldProps('size_sqft')}
            inputMode="numeric"
            autoComplete="off"
            className={cn(INPUT, 'tabular-nums')}
          />
        </Field>

        <Field id={ids('bedrooms')} label="Bedrooms" error={errors.bedrooms?.message}>
          <input
            {...register('bedrooms', { setValueAs: toNumber })}
            {...fieldProps('bedrooms')}
            inputMode="numeric"
            autoComplete="off"
            className={cn(INPUT, 'tabular-nums')}
          />
        </Field>
        <Field id={ids('status')} label="Status" error={errors.status?.message}>
          <div className="relative">
            <select
              {...register('status')}
              {...fieldProps('status')}
              className={cn(INPUT, 'appearance-none pr-9')}
            >
              {PROPERTY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              size={14}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gold"
            />
          </div>
        </Field>

        <Field
          id={ids('image_url')}
          label="Image URL"
          error={errors.image_url?.message}
          className="md:col-span-2"
        >
          <input
            {...register('image_url')}
            {...fieldProps('image_url')}
            type="url"
            inputMode="url"
            autoComplete="off"
            className={INPUT}
          />
        </Field>

        <Field
          id={ids('description')}
          label="Description"
          error={errors.description?.message}
          className="md:col-span-2"
        >
          <textarea
            {...register('description')}
            {...fieldProps('description')}
            rows={3}
            className={cn(INPUT, 'resize-y')}
          />
        </Field>
        <Field
          id={ids('details')}
          label="Details (optional)"
          error={errors.details?.message}
          className="md:col-span-2"
        >
          <textarea
            {...register('details')}
            {...fieldProps('details')}
            rows={6}
            className={cn(INPUT, 'resize-y')}
          />
        </Field>
      </div>

      <section
        aria-label="Image preview"
        className="w-full max-w-md lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none"
      >
        <p aria-hidden className="caps mb-2 text-[10px] text-slate">
          Image preview
        </p>
        <ImagePreview control={control} />
      </section>

      <div className="flex flex-wrap gap-3 lg:col-start-1">
        <button
          type="submit"
          disabled={save.isPending}
          className="btn-primary disabled:cursor-wait disabled:opacity-70"
        >
          {save.isPending ? 'Saving…' : property ? 'Save changes' : 'Add property'}
        </button>
        <Link to="/admin/properties" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Label above, the input, then an optional hint and the error (ids match `fieldProps`). */
function Field({ id, label, error, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="caps mb-2 block text-[10px] text-slate">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-slate">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type ControlProps = { control: Control<PropertyInput, unknown, PropertyData> };

/** "Whole rupees · ₹12.5 Cr": the live preview of the price as the site shows it. */
function PriceHint({ control }: ControlProps) {
  const price = useWatch({ control, name: 'price' });
  const valid = typeof price === 'number' && Number.isSafeInteger(price) && price > 0;
  return <>Whole rupees{valid && <> · reads as {formatPrice(price)}</>}</>;
}

// Same rule as the API (trimmed http(s) URL), so the preview shows only for URLs it would accept.
const imageUrlSchema = propertyInputSchema.shape.image_url;

function ImagePreview({ control }: ControlProps) {
  const value = useWatch({ control, name: 'image_url' });
  // The URL whose image failed; a new URL gets a fresh try without an effect.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const parsed = imageUrlSchema.safeParse(value);
  const url = parsed.success ? parsed.data : null;

  let content: ReactNode;
  if (!url) {
    content = <span className="px-4">The preview appears when the URL is valid.</span>;
  } else if (failedUrl === url) {
    content = <span className="px-4">This image could not be loaded.</span>;
  } else {
    const { src, srcSet } = imageSources(url, 4 / 3);
    content = (
      <img
        key={url}
        src={src}
        srcSet={srcSet}
        sizes="(min-width: 1024px) 416px, 448px"
        alt="Preview of the property image"
        width={416}
        height={312}
        decoding="async"
        onError={() => setFailedUrl(url)}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-sand text-center text-[13px] text-slate">
      {content}
    </div>
  );
}
