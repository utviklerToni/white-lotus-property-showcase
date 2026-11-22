import { Link } from 'react-router';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ApiError } from '../../lib/apiClient';
import { AdminLoading } from './AdminLayout';
import { useAdminProperty } from './api';
import { PropertyForm } from './PropertyForm';

/** Loads one property, then shows the form filled with it. */
export function EditProperty({ id }: { id: number }) {
  const { data, isPending, isError, error, refetch } = useAdminProperty(id);

  if (isPending) return <AdminLoading />;
  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <EditPropertyNotFound />;
    return (
      <ErrorState
        title="We couldn't load this property"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }
  return (
    <>
      <title>{`Edit ${data.name} · Admin · White Lotus`}</title>
      {/* Keyed by id: the form's default values are read once, on mount. */}
      <PropertyForm key={data.id} property={data} />
    </>
  );
}

export function EditPropertyNotFound() {
  return (
    <EmptyState title="This property doesn't exist">
      <Link to="/admin/properties" className="text-link text-sm text-navy decoration-gold">
        Back to properties
      </Link>
    </EmptyState>
  );
}
