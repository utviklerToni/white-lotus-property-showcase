import { useParams } from 'react-router';
import { idParamSchema } from '@white-lotus/shared';
import { InquiryForm } from '../features/inquiries/InquiryForm';
import { PropertyDetail, PropertyNotFound } from '../features/properties/PropertyDetail';

export function PropertyDetailPage() {
  // Same id rule as the API (positive integer); "abc" or "0" is a 404 without a request.
  const parsed = idParamSchema.safeParse(useParams());
  if (!parsed.success) return <PropertyNotFound />;

  const { id } = parsed.data;
  // The page joins the two features: the inquiry form goes into the detail's band slot (D66).
  return <PropertyDetail id={id} inquiry={<InquiryForm propertyId={id} />} />;
}
