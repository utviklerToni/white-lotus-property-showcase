import { cn } from '../../lib/cn';

// Sand placeholder block; size and spacing come from className. No pulse (no animations).
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-sand', className)} />;
}
