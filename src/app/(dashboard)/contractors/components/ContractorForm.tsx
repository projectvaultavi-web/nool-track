'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contractorSchema, ContractorInput } from '@/validations/contractor';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProcessType, PaymentTerms } from '@prisma/client';
import styles from './ContractorForm.module.css';
import { useRouter } from 'next/navigation';

interface ContractorFormProps {
  initialData?: Partial<ContractorInput>;
  onSubmit: (data: ContractorInput) => Promise<void>;
  isLoading?: boolean;
}

const PROCESS_TYPES = Object.values(ProcessType);
const PAYMENT_TERMS = Object.values(PaymentTerms);

export function ContractorForm({ initialData, onSubmit, isLoading }: ContractorFormProps) {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractorInput>({
    // @ts-expect-error - zodResolver type mismatch with react-hook-form
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: initialData?.name || '',
      contactPerson: initialData?.contactPerson || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      gstNumber: initialData?.gstNumber || '',
      address: initialData?.address || '',
      contractorType: initialData?.contractorType || undefined,
      specializations: initialData?.specializations || [],
      rating: initialData?.rating || undefined,
      notes: initialData?.notes || '',
      preferredPaymentTerms: initialData?.preferredPaymentTerms || undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form 
      // @ts-expect-error - React Hook Form type mismatch
      onSubmit={handleSubmit(onSubmit)} 
      className={styles.form}
    >
      <div className={styles.grid}>
        <Input
          label="Company Name"
          required
          placeholder="Enter company name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Contact Person"
          placeholder="Name of primary contact"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />
        <Input
          label="Phone Number"
          placeholder="e.g. 9876543210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Email Address"
          placeholder="email@company.com"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="GST Number"
          placeholder="15-digit GSTIN"
          error={errors.gstNumber?.message}
          {...register('gstNumber')}
        />
        <Input
          label="Rating (0-5)"
          placeholder="e.g. 4.5"
          type="number"
          step="0.1"
          min="0"
          max="5"
          error={errors.rating?.message}
          {...register('rating')}
        />
      </div>

      <div className={styles.fullWidth}>
        <Input
          label="Address"
          placeholder="Complete business address"
          error={errors.address?.message}
          {...register('address')}
        />
      </div>

      <div className={styles.grid}>
        <Select
          label="Contractor Type"
          required
          error={errors.contractorType?.message}
          {...register('contractorType')}
        >
          <option value="">Select Type...</option>
          {PROCESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>

        <Select
          label="Preferred Payment Terms"
          error={errors.preferredPaymentTerms?.message}
          {...register('preferredPaymentTerms')}
        >
          <option value="">Select Terms...</option>
          {PAYMENT_TERMS.map((term) => (
            <option key={term} value={term}>
              {term.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>

      {/* Specializations (Multi-Select Fake via checkboxes or just standard HTML select multiple) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Services Offered <span className="required">*</span></label>
        <div className={styles.checkboxGrid}>
          {PROCESS_TYPES.map((type) => (
            <label key={type} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={type}
                {...register('specializations')}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        {errors.specializations && (
          <p className={styles.errorText}>{errors.specializations.message}</p>
        )}
      </div>

      <div className={styles.fullWidth}>
        <Input
          label="Notes"
          placeholder="Additional details..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" {...register('isActive')} />
          <span>Active Contractor</span>
        </label>
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
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Contractor' : 'Save Contractor'}
        </Button>
      </div>
    </form>
  );
}
