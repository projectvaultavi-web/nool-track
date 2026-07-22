'use client';

import { PageHeader } from '@/components/layout';
import { useContractor, useDeleteContractor } from '@/hooks/useContractors';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import styles from './page.module.css';

export default function ViewContractorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useToast();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { data: contractor, isLoading, error } = useContractor(id);
  const { mutateAsync: deleteContractor } = useDeleteContractor();

  const handleDelete = async () => {
    try {
      await deleteContractor(id);
      addToast({
        title: 'Contractor Deleted',
        message: 'The contractor has been removed successfully.',
        type: 'success',
      });
      router.push('/contractors');
    } catch (err) {
      const error = err as Error;
      addToast({
        title: 'Error',
        message: error.message || 'Failed to delete contractor.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <div className={styles.loadingWrap}><LoadingSpinner size="lg" /></div>;
  }

  if (error || !contractor) {
    return <EmptyState title="Not Found" description="The contractor you are looking for does not exist." />;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title={contractor.name}
        subtitle={`Contractor Type: ${contractor.contractorType}`}
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={() => router.push(`/contractors/${id}/edit`)}>Edit</Button>
            <Button variant="danger" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
          </div>
        }
      />

      <div className={styles.grid}>
        <Card title="Contact Information">
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Contact Person</span>
              <span className={styles.detailValue}>{contractor.contactPerson || '-'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{contractor.phone || '-'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{contractor.email || '-'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>{contractor.address || '-'}</span>
            </div>
          </div>
        </Card>

        <Card title="Business Details">
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>GST Number</span>
              <span className={styles.detailValue}>{contractor.gstNumber || '-'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailValue}>
                <Badge variant={contractor.isActive ? 'green' : 'gray'}>
                  {contractor.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Rating</span>
              <span className={styles.detailValue}>
                {contractor.rating ? `${Number(contractor.rating).toFixed(1)} / 5.0` : '-'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Payment Terms</span>
              <span className={styles.detailValue}>
                {contractor.preferredPaymentTerms ? contractor.preferredPaymentTerms.replace('_', ' ') : '-'}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Services Offered">
          <div className={styles.badges}>
            {contractor.specializations.map((spec) => (
              <Badge key={spec} variant="blue">{spec}</Badge>
            ))}
            {contractor.specializations.length === 0 && (
              <span className={styles.detailLabel}>No services listed</span>
            )}
          </div>
        </Card>

        <Card title="Notes">
          <p className={styles.notesText}>{contractor.notes || 'No additional notes provided.'}</p>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Contractor"
        description={`Are you sure you want to delete ${contractor.name}? This will hide them from future transactions, but preserve historical data.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onClose={() => setDeleteDialogOpen(false)}
        isDanger={true}
      />
    </div>
  );
}
