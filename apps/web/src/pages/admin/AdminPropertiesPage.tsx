import { PropertiesTable } from '../../features/admin/PropertiesTable';

export function AdminPropertiesPage() {
  return (
    <>
      <title>Properties · Admin · White Lotus</title>
      <h1 className="mb-6 font-serif text-[32px] leading-tight font-medium text-navy md:text-4xl">
        Properties
      </h1>
      <PropertiesTable />
    </>
  );
}
