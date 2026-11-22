import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

// Calm empty-list message with an optional action (a link or button) below it.
type EmptyStateProps = { title: string; children?: ReactNode; className?: string };

export function EmptyState({ title, children, className }: EmptyStateProps) {
  return (
    <div className={cn('py-12 md:py-16', className)}>
      <p className="mb-4 font-serif text-[30px] leading-[1.1] font-medium text-navy md:text-4xl">
        {title}
      </p>
      {children}
    </div>
  );
}
