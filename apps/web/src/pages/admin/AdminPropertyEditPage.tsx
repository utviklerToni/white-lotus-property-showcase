import { useParams } from 'react-router';
import { idParamSchema } from '@white-lotus/shared';
import { EditProperty, EditPropertyNotFound } from '../../features/admin/EditProperty';

export function AdminPropertyEditPage() {
  // Same id rule as the API; "abc" or "0" is not found without a request.
  const parsed = idParamSchema.safeParse(useParams());
  return (
    <>
      <title>Edit property · Admin · White Lotus</title>
      <h1 className="mb-6 font-serif text-[32px] leading-tight font-medium text-navy md:text-4xl">
        Edit property
      </h1>
      {parsed.success ? <EditProperty id={parsed.data.id} /> : <EditPropertyNotFound />}
    </>
  );
}
