import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NewJobPage() {
  return (
    <div>
      <PageHeader title="New Job" />
      <EmptyState
        title="Coming Soon"
        description="New Job — Coming in Milestone 4"
      />
    </div>
  );
}
