import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" />
      <EmptyState
        title="Coming Soon"
        description="Payments — Coming in Milestone 5"
      />
    </div>
  );
}
