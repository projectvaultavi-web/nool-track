import { z } from 'zod';
import { ProcessType, PaymentTerms } from '@prisma/client';

export const contractorSchema = z.object({
  name: z.string().min(2, 'Company Name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person is required').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST Format').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  contractorType: z.nativeEnum(ProcessType, {
    error: 'Please select a contractor type',
  }),
  specializations: z.array(z.nativeEnum(ProcessType)).min(1, 'Please select at least one service'),
  rating: z.coerce.number().min(0).max(5).optional(),
  notes: z.string().optional().or(z.literal('')),
  preferredPaymentTerms: z.nativeEnum(PaymentTerms).optional(),
  isActive: z.boolean().default(true),
});

export type ContractorInput = z.infer<typeof contractorSchema>;
