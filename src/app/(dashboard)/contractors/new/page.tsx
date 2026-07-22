import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NewContractorPage() {
  return (
    <div>
      <PageHeader title="New Contractor" />
      <EmptyState
        title="Coming Soon"
        description="New Contractor — Coming in Milestone 2"
      />
    </div>
  );
}
