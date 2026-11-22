import { useMutation } from '@tanstack/react-query';
import type { InquiryData } from '@white-lotus/shared';
import { request } from '../../lib/apiClient';

export function useCreateInquiry(propertyId: number) {
  return useMutation({
    // The response (the stored inquiry) isn't shown anywhere, so it isn't typed.
    mutationFn: (input: InquiryData) =>
      request<unknown>(`/properties/${propertyId}/inquiries`, { method: 'POST', body: input }),
  });
}
