import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NewOrderPage() {
  return (
    <div>
      <PageHeader title="New Production Order" />
      <EmptyState
        title="Coming Soon"
        description="New Production Order — Coming in Milestone 3"
      />
    </div>
  );
}
