import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// The one place classes are combined: clsx handles conditionals, twMerge drops
// conflicting Tailwind classes (the last one wins).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
