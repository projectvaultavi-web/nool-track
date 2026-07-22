import { z } from 'zod';
import { PaymentTerms } from '@prisma/client';

export const buyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company Name must be at least 2 characters'),
  contactPerson: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST Format').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  preferredPaymentTerms: z.nativeEnum(PaymentTerms).optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0, 'Credit limit must be positive').optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type BuyerInput = z.infer<typeof buyerSchema>;
