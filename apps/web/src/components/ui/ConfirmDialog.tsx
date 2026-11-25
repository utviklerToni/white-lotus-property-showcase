import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Shown on the confirm button while the action runs, e.g. "Deleting…". */
  pendingLabel: string;
  /** Disables both buttons while the action runs. */
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

// Native <dialog> opened with showModal(): the browser traps focus inside, makes the page
// behind inert, closes on Escape, and returns focus to the button that opened it. Page scroll
// is locked by `html:has(dialog[open])` in index.css.
export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, children, confirmLabel, pendingLabel, pending, onConfirm, onClose } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Syncs React's `open` with the DOM dialog (an external API, so an effect is right here).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus(); // the safe choice gets focus first
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Escape fires `cancel`; while the action runs, keep the dialog open.
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      // Fixed and centred on the viewport at every size; never wider or taller than the screen
      // minus 1rem a side and the safe-area insets (notches), scrolling inside if it must.
      className={cn(
        'fixed inset-0 m-auto h-fit w-[28rem] overflow-y-auto overscroll-contain',
        'max-w-[calc(100vw-2rem-env(safe-area-inset-left)-env(safe-area-inset-right))]',
        'max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]',
        'bg-stone p-7 text-navy backdrop:bg-navy/60',
      )}
    >
      <h2 id={titleId} className="mb-3 font-serif text-2xl/[1.2] font-medium text-navy">
        {title}
      </h2>
      <div className="mb-7 text-sm/[1.7] text-slate">{children}</div>
      {/* Phones: full-width buttons stacked, Cancel first. From sm: one row on the right. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={pending}
          className="caps min-h-11 w-full sm:w-auto border border-navy px-[22px] text-[11px] font-medium text-navy transition-colors duration-200 hover:bg-navy hover:text-stone disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="caps min-h-11 w-full sm:w-auto bg-danger px-[22px] text-[11px] font-medium text-white transition-colors duration-200 hover:bg-navy disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
