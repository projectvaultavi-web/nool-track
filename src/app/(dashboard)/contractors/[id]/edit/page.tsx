'use client';

import { PageHeader } from '@/components/layout';
import { ContractorForm } from '../../components/ContractorForm';
import { useContractor, useUpdateContractor } from '@/hooks/useContractors';
import { ContractorInput } from '@/validations/contractor';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

export default function EditContractorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useToast();
  
  const { data: contractor, isLoading, error } = useContractor(id);
  const { mutateAsync, isPending } = useUpdateContractor();

  const handleSubmit = async (data: ContractorInput) => {
    try {
      await mutateAsync({ id, data });
      addToast({
        title: 'Contractor Updated',
        message: 'The contractor has been updated successfully.',
        type: 'success',
      });
      router.push(`/contractors/${id}`);
    } catch (err) {
      const error = err as Error;
      addToast({
        title: 'Error',
        message: error.message || 'Failed to update contractor.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner size="lg" /></div>;
  }

  if (error || !contractor) {
    return <EmptyState title="Not Found" description="The contractor you are looking for does not exist." />;
  }

  return (
    <div>
      <PageHeader
        title="Edit Contractor"
        subtitle={`Update details for ${contractor.name}`}
      />
      <div style={{ maxWidth: '800px' }}>
        <ContractorForm 
          initialData={contractor as unknown as Partial<ContractorInput>} 
          onSubmit={handleSubmit} 
          isLoading={isPending} 
        />
      </div>
    </div>
  );
}
