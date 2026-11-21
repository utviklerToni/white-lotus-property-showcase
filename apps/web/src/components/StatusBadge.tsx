import type { PropertyStatus } from '@white-lotus/shared';
import { cn } from '../lib/cn';
import { STATUS_LABELS } from '../lib/format';

// Champagne for Available stays visible on bright sky photos (D63, D64).
const STYLES: Record<PropertyStatus, string> = {
  available: 'bg-champagne text-navy',
  under_construction: 'bg-navy text-champagne',
  sold: 'bg-slate text-stone',
};

export function StatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  return (
    <span className={cn('caps px-2.5 py-1.5 text-[10px] font-normal', STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
