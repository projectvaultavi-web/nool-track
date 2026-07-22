'use client';

import { PageHeader } from '@/components/layout';
import { BuyerForm } from '../../components/BuyerForm';
import { useBuyer } from '@/hooks/useBuyers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { use } from 'react';

export default function EditBuyerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: buyer, isLoading, error } = useBuyer(resolvedParams.id);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <EmptyState
        title="Buyer not found"
        description="The buyer you are trying to edit does not exist or has been removed."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Buyer"
        subtitle={`Update details for ${buyer.companyName}`}
      />
      
      <BuyerForm initialData={buyer} />
    </div>
  );
}
