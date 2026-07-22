import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ContractorsPage() {
  return (
    <div>
      <PageHeader title="Contractors" />
      <EmptyState
        title="Coming Soon"
        description="Contractors — Coming in Milestone 2"
      />
    </div>
  );
}
