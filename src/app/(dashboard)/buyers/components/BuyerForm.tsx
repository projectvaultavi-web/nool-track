'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { BuyerInput, buyerSchema } from '@/validations/buyer';
import { PaymentTerms } from '@prisma/client';
import { Buyer } from '@prisma/client';
import { useCreateBuyer, useUpdateBuyer } from '@/hooks/useBuyers';
import styles from './BuyerForm.module.css';

interface BuyerFormProps {
  initialData?: Buyer;
}

export function BuyerForm({ initialData }: BuyerFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const isEditing = !!initialData;

  const createMutation = useCreateBuyer();
  const updateMutation = useUpdateBuyer(initialData?.id as string);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerInput>({
    // @ts-expect-error - React Hook Form type mismatch with zodResolver
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      name: initialData?.name || '',
      companyName: initialData?.companyName || '',
      contactPerson: initialData?.contactPerson || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      gstNumber: initialData?.gstNumber || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      preferredPaymentTerms: initialData?.preferredPaymentTerms || undefined,
      creditLimit: initialData?.creditLimit ? Number(initialData.creditLimit) : undefined,
      notes: initialData?.notes || '',
      isActive: initialData ? initialData.isActive : true,
    },
  });

  const onSubmit = async (data: BuyerInput) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        addToast({ type: 'success', message: 'Buyer updated successfully' });
      } else {
        await createMutation.mutateAsync(data);
        addToast({ type: 'success', message: 'Buyer created successfully' });
      }
      router.push('/buyers');
    } catch (err) {
      const error = err as Error;
      addToast({ type: 'error', message: error.message || 'An error occurred' });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form 
      // @ts-expect-error - React Hook Form type mismatch
      onSubmit={handleSubmit(onSubmit)} 
      className={styles.form}
    >
      <div className={styles.grid}>
        <Input
          label="Buyer Name *"
          placeholder="e.g. Acme Corp"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Company Name *"
          placeholder="e.g. Acme Corporation Ltd"
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Input
          label="Contact Person"
          placeholder="e.g. John Doe"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />

        <Input
          label="Phone Number"
          placeholder="e.g. +91 9876543210"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="GST Number"
          placeholder="e.g. 22AAAAA0000A1Z5"
          error={errors.gstNumber?.message}
          {...register('gstNumber')}
        />

        <div className={styles.fullWidth}>
          <Input
            label="Address"
            placeholder="e.g. 123 Industrial Area"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>

        <Input
          label="City"
          placeholder="e.g. Tirupur"
          error={errors.city?.message}
          {...register('city')}
        />

        <Input
          label="State"
          placeholder="e.g. Tamil Nadu"
          error={errors.state?.message}
          {...register('state')}
        />

        <Select
          label="Payment Terms"
          error={errors.preferredPaymentTerms?.message}
          {...register('preferredPaymentTerms')}
        >
          <option value="">Select Terms (Optional)</option>
          <option value={PaymentTerms.IMMEDIATE}>Immediate</option>
          <option value={PaymentTerms.DAYS_7}>7 Days</option>
          <option value={PaymentTerms.DAYS_15}>15 Days</option>
          <option value={PaymentTerms.DAYS_30}>30 Days</option>
          <option value={PaymentTerms.DAYS_45}>45 Days</option>
          <option value={PaymentTerms.DAYS_60}>60 Days</option>
          <option value={PaymentTerms.CUSTOM}>Custom</option>
        </Select>

        <Input
          label="Credit Limit"
          type="number"
          step="0.01"
          placeholder="e.g. 100000"
          error={errors.creditLimit?.message}
          {...register('creditLimit')}
        />

        <div className={styles.fullWidth}>
          <Input
            label="Notes"
            placeholder="Any additional information..."
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        {isEditing && (
          <div className={styles.fullWidth}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              <span>Active Buyer</span>
            </label>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} isLoading={isLoading}>
          {isEditing ? 'Update Buyer' : 'Create Buyer'}
        </Button>
      </div>
    </form>
  );
}
