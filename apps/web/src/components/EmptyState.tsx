import { Link } from 'react-router';

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="py-12 md:py-16">
      <p className="mb-4 font-serif text-[30px] leading-[1.1] font-medium text-navy md:text-4xl">
        {filtered ? 'No residences match these filters' : 'No residences are listed yet'}
      </p>
      {filtered && (
        <Link to={{ search: '' }} className="text-link text-[13px] text-navy decoration-gold">
          Clear filters
        </Link>
      )}
    </div>
  );
}
