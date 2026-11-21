import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

type Option = { value: string; label: string };

type SelectProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

// White fill with a 1px gold-text bottom border (navy on hover), gold chevron (DESIGN.md §4, D62).
// Bright gold would fail 3:1 on stone, so the border uses gold-text.
export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="caps mb-2 block text-[10px] text-slate">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none border-b border-gold-text bg-white py-3 pr-9 pl-3 text-sm font-light text-navy transition-colors duration-200 hover:border-navy"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={14}
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gold"
        />
      </div>
    </div>
  );
}
