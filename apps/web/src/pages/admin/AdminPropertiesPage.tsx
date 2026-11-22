import { Link } from 'react-router';
import { PropertiesTable } from '../../features/admin/PropertiesTable';

export function AdminPropertiesPage() {
  return (
    <>
      <title>Properties · Admin · White Lotus</title>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[32px] leading-tight font-medium text-navy md:text-4xl">
          Properties
        </h1>
        <Link to="/admin/properties/new" className="btn-primary">
          Add property
        </Link>
      </div>
      <PropertiesTable />
    </>
  );
}
