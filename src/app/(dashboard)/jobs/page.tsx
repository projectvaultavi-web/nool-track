import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function JobsPage() {
  return (
    <div>
      <PageHeader title="Jobs" />
      <EmptyState
        title="Coming Soon"
        description="Jobs — Coming in Milestone 4"
      />
    </div>
  );
}
