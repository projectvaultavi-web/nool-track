import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function OrdersPage() {
  return (
    <div>
      <PageHeader title="Production Orders" />
      <EmptyState
        title="Coming Soon"
        description="Production Orders — Coming in Milestone 3"
      />
    </div>
  );
}
