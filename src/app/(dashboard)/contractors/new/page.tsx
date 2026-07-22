'use client';

import { PageHeader } from '@/components/layout';
import { ContractorForm } from '../components/ContractorForm';
import { useCreateContractor } from '@/hooks/useContractors';
import { ContractorInput } from '@/validations/contractor';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function NewContractorPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { mutateAsync, isPending } = useCreateContractor();

  const handleSubmit = async (data: ContractorInput) => {
    try {
      await mutateAsync(data);
      addToast({
        title: 'Contractor Created',
        message: 'The contractor has been added successfully.',
        type: 'success',
      });
      router.push('/contractors');
    } catch (err) {
      const error = err as Error;
      addToast({
        title: 'Error',
        message: error.message || 'Failed to create contractor.',
        type: 'error',
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Add New Contractor"
        subtitle="Register a new contractor or vendor for your organization."
      />
      <div style={{ maxWidth: '800px' }}>
        <ContractorForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
