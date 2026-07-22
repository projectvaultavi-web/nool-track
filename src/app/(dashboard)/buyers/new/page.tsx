'use client';

import { PageHeader } from '@/components/layout';
import { BuyerForm } from '../components/BuyerForm';

export default function NewBuyerPage() {
  return (
    <div>
      <PageHeader
        title="Add New Buyer"
        subtitle="Create a new buyer profile."
      />
      
      <BuyerForm />
    </div>
  );
}
