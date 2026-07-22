import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" />
      <EmptyState
        title="Coming Soon"
        description="Reports — Coming in Milestone 6"
      />
    </div>
  );
}
