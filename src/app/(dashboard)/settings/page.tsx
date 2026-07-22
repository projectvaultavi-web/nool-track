import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <EmptyState
        title="Coming Soon"
        description="Settings — Coming in Milestone 7"
      />
    </div>
  );
}
