import { useId, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminKeyWasRejected,
  getAdminKey,
  setAdminKey,
  subscribeAdminKey,
} from '../../lib/adminKey';
import { ApiError } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';
import { verifyAdminKey } from './api';

const REJECTED = "That key wasn't accepted.";

// Shows the admin pages once a key is stored; otherwise (or after a 401 cleared it) the key form.
export function AdminKeyGate({ children }: { children: ReactNode }) {
  const key = useSyncExternalStore(subscribeAdminKey, getAdminKey);
  return key ? children : <AdminKeyForm />;
}

function AdminKeyForm() {
  const queryClient = useQueryClient();
  const inputId = useId();
  const [empty, setEmpty] = useState(false);
  const verify = useMutation({
    mutationFn: verifyAdminKey,
    onSuccess: (inquiries, key) => {
      queryClient.setQueryData(queryKeys.inquiries, inquiries);
      setAdminKey(key); // the gate re-renders and shows the admin pages
    },
  });

  const message = empty
    ? 'Enter the admin key.'
    : verify.error
      ? verify.error instanceof ApiError && verify.error.status === 401
        ? REJECTED
        : verify.error.message
      : adminKeyWasRejected()
        ? REJECTED
        : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = String(new FormData(event.currentTarget).get('key') ?? '').trim();
    setEmpty(!key);
    if (key) verify.mutate(key);
  }

  return (
    <section className="max-w-md py-4">
      <title>Admin · White Lotus</title>
      <p className="caps mb-3.5 text-[11px] text-gold-text">Admin</p>
      <h1 className="mb-4 font-serif text-[40px] leading-[1.05] font-medium text-navy">
        Enter the admin key
      </h1>
      <p className="mb-8 text-sm/[1.7] text-slate">
        Manage listings and read enquiries. The key is kept for this browser tab only.
      </p>
      <form onSubmit={submit} noValidate>
        <label htmlFor={inputId} className="caps mb-2 block text-[10px] text-slate">
          Admin key
        </label>
        <input
          id={inputId}
          name="key"
          type="password"
          autoComplete="off"
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${inputId}-error` : undefined}
          className="block min-h-11 w-full bg-white p-3 text-sm text-navy"
        />
        {message && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-[13px] text-danger">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={verify.isPending}
          className="btn-primary mt-6 disabled:cursor-wait disabled:opacity-70"
        >
          {verify.isPending ? 'Checking…' : 'Unlock admin'}
        </button>
      </form>
    </section>
  );
}
