type ErrorStateProps = { title: string; message: string; onRetry: () => void };

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="py-12 md:py-16">
      <p className="mb-2 font-serif text-[30px] leading-[1.1] font-medium text-navy md:text-4xl">
        {title}
      </p>
      <p className="mb-6 text-sm/[1.7] text-slate">{message}</p>
      <button type="button" onClick={onRetry} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
