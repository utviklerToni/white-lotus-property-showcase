import { useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert } from 'lucide-react';
import { inquiryInputSchema, type InquiryData, type InquiryInput } from '@white-lotus/shared';
import { ApiError } from '../../lib/apiClient';
import { useCreateInquiry } from './api';
import { SentCard } from './SentCard';

type FieldName = keyof InquiryInput;

const FIELDS: { name: FieldName; label: string; type?: string; autoComplete?: string }[] = [
  { name: 'name', label: 'Name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { name: 'message', label: 'Message' },
];

const EMPTY: InquiryInput = { name: '', email: '', phone: '', message: '' };

const isFieldName = (key: string): key is FieldName => FIELDS.some((field) => field.name === key);

// Light stone fill, no border, navy text (DESIGN.md §4 inquiry band).
const INPUT = 'block min-h-11 w-full bg-stone p-3 text-sm font-light text-navy';

/** The message shown above the button for errors that don't belong to one field. */
function formError(error: Error): string {
  if (!(error instanceof ApiError)) return "Couldn't send your enquiry. Try again.";
  if (error.status === 429) {
    return "You've sent several enquiries recently. Please try again in a few minutes.";
  }
  if (error.fields) return 'Please check the fields above.';
  if (error.status === 404) return 'This residence is no longer listed.';
  // Server unreachable (status 0, or 5xx through the dev proxy) or failing.
  return "Couldn't send your enquiry. Try again.";
}

export function InquiryForm({ propertyId }: { propertyId: number }) {
  const formId = useId();
  const mutation = useCreateInquiry(propertyId);
  // The "Enquiry sent" card, shown over the page after a successful send.
  const [cardOpen, setCardOpen] = useState(false);
  // Set from submit until the request settles: a second submit that arrives before the
  // disabled button has rendered (a fast double click, Enter) is ignored.
  const sending = useRef(false);
  const sendAnotherRef = useRef<HTMLButtonElement>(null);
  // After "Send another enquiry" the form comes back with focus in its first field.
  const [sendingAnother, setSendingAnother] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InquiryInput, unknown, InquiryData>({
    resolver: zodResolver(inquiryInputSchema),
    defaultValues: EMPTY,
  });

  // Called by handleSubmit on submit, once the fields are valid.
  function send(data: InquiryData) {
    if (sending.current) return;
    sending.current = true;
    mutation.mutate(data, {
      onSettled: () => {
        sending.current = false;
      },
      onSuccess: () => {
        reset(EMPTY);
        setCardOpen(true);
      },
      // Server field errors go onto their inputs; nothing the user typed is cleared.
      onError: (error) => {
        if (!(error instanceof ApiError) || !error.fields) return;
        for (const [key, message] of Object.entries(error.fields)) {
          if (isFieldName(key)) setError(key, { message });
        }
      },
    });
  }

  function sendAnother() {
    setCardOpen(false);
    setSendingAnother(true);
    mutation.reset();
  }

  return (
    <>
      {mutation.isSuccess ? (
        // The quiet state that stays after the card. The submit button is gone, so focus moves
        // to "Send another enquiry" (autoFocus); the card's own status line does the announcing.
        <div>
          <p className="mb-2 font-serif text-2xl/[1.2] font-medium text-stone">Enquiry sent</p>
          <button
            ref={sendAnotherRef}
            type="button"
            autoFocus
            onClick={sendAnother}
            className="text-link min-h-11 text-[13px] text-stone decoration-gold"
          >
            Send another enquiry
          </button>
        </div>
      ) : (
        // noValidate: the shared Zod schema gives the messages, not the browser's bubbles.
        <form
          onSubmit={(event) => void handleSubmit(send)(event)}
          noValidate
          className="grid gap-[18px]"
        >
          {FIELDS.map((field) => {
            const id = `${formId}-${field.name}`;
            const message = errors[field.name]?.message;
            const a11y = {
              id,
              'aria-invalid': message ? true : undefined,
              'aria-describedby': message ? `${id}-error` : undefined,
            };
            return (
              <div key={field.name}>
                <label htmlFor={id} className="caps mb-1.5 block text-[10px] text-on-navy">
                  {field.label}
                </label>
                {field.name === 'message' ? (
                  <textarea
                    {...register(field.name)}
                    {...a11y}
                    rows={4}
                    className={`${INPUT} resize-y`}
                  />
                ) : (
                  <input
                    {...register(field.name)}
                    {...a11y}
                    type={field.type ?? 'text'}
                    autoComplete={field.autoComplete}
                    // Only when the form returns after "Send another enquiry", never on page load.
                    autoFocus={sendingAnother && field.name === 'name'}
                    className={INPUT}
                  />
                )}
                {message && (
                  <p id={`${id}-error`} className="mt-1.5 text-[13px] text-on-navy-accent">
                    {message}
                  </p>
                )}
              </div>
            );
          })}

          {mutation.isError && (
            <p
              role="alert"
              className="flex items-start gap-2 text-[13px]/[1.5] text-on-navy-accent"
            >
              <CircleAlert aria-hidden size={16} strokeWidth={1.5} className="mt-px shrink-0" />
              {formError(mutation.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="caps mt-2.5 min-h-11 bg-champagne px-[22px] py-[15px] text-[11px] font-medium text-navy transition-colors duration-200 hover:bg-on-navy-accent disabled:cursor-wait disabled:opacity-70"
          >
            {mutation.isPending ? 'Sending…' : 'Send enquiry'}
          </button>
          <p className="text-center text-[13px] font-light text-on-navy">
            Our team replies within one working day.
          </p>
        </form>
      )}
      {/* Rendered beside both states, so it stays mounted (with its status line) across them. */}
      <SentCard
        open={cardOpen}
        setOpen={setCardOpen}
        returnFocus={() => sendAnotherRef.current?.focus()}
      />
    </>
  );
}
