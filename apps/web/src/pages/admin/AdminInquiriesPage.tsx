import { InquiriesTable } from '../../features/admin/InquiriesTable';

export function AdminInquiriesPage() {
  return (
    <>
      <title>Enquiries · Admin · White Lotus</title>
      <h1 className="mb-6 font-serif text-[32px] leading-tight font-medium text-navy md:text-4xl">
        Enquiries
      </h1>
      <InquiriesTable />
    </>
  );
}
