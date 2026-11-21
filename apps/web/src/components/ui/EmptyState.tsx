import type { ReactNode } from 'react';

// Calm empty-list message with an optional action (a link or button) below it.
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="py-12 md:py-16">
      <p className="mb-4 font-serif text-[30px] leading-[1.1] font-medium text-navy md:text-4xl">
        {title}
      </p>
      {children}
    </div>
  );
}
