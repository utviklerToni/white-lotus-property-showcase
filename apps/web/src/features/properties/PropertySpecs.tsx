import type { Property } from '@white-lotus/shared';
import { STATUS_LABELS, formatArea } from '../../lib/format';

// Hairline rows: slate small-caps label left, value right (DESIGN.md §4).
export function PropertySpecs({ property }: { property: Property }) {
  const specs = [
    { label: 'Status', value: STATUS_LABELS[property.status] },
    { label: 'Built-up area', value: formatArea(property.size_sqft) },
    { label: 'Bedrooms', value: String(property.bedrooms) },
    // Every listing is in Bengaluru (the site covers one city).
    { label: 'Neighbourhood', value: `${property.location}, Bengaluru` },
  ];

  return (
    <dl className="border-t-[0.5px] border-navy/25">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-baseline justify-between gap-4 border-b-[0.5px] border-navy/25 py-3.5"
        >
          <dt className="caps text-[10px] text-slate">{spec.label}</dt>
          <dd className="text-right text-sm font-normal text-navy">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
