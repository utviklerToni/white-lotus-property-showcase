import { PropertyForm } from '../../features/admin/PropertyForm';

export function AdminPropertyNewPage() {
  return (
    <>
      <title>Add property · Admin · White Lotus</title>
      <h1 className="mb-6 font-serif text-[32px] leading-tight font-medium text-navy md:text-4xl">
        Add property
      </h1>
      <PropertyForm />
    </>
  );
}
