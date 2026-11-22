import { useEffect, useId, useRef, type ReactNode } from 'react';

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
// behind inert, closes on Escape, and returns focus to the button that opened it.
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
      className="m-auto w-[min(28rem,calc(100vw-48px))] bg-stone p-7 text-navy backdrop:bg-navy/60"
    >
      <h2 id={titleId} className="mb-3 font-serif text-2xl/[1.2] font-medium text-navy">
        {title}
      </h2>
      <div className="mb-7 text-sm/[1.7] text-slate">{children}</div>
      <div className="flex flex-wrap justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={pending}
          className="caps min-h-11 border border-navy px-[22px] text-[11px] font-medium text-navy transition-colors duration-200 hover:bg-navy hover:text-stone disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="caps min-h-11 bg-danger px-[22px] text-[11px] font-medium text-white transition-colors duration-200 hover:bg-navy disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
