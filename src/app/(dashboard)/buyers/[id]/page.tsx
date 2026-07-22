'use client';

import { use, useState } from 'react';
import { PageHeader } from '@/components/layout';
import { useBuyer, useDeleteBuyer } from '@/hooks/useBuyers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function BuyerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addToast } = useToast();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { data: buyer, isLoading, error } = useBuyer(id);
  const { mutateAsync: deleteBuyer } = useDeleteBuyer();

  const handleDelete = async () => {
    try {
      await deleteBuyer(id);
      addToast({ type: 'success', message: 'Buyer deleted successfully' });
      router.push('/buyers');
    } catch (err) {
      const error = err as Error;
      addToast({ type: 'error', message: error.message || 'Failed to delete buyer' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <EmptyState
        title="Buyer not found"
        description="The buyer you are looking for does not exist or has been removed."
        action={
          <Button onClick={() => router.push('/buyers')}>Back to Buyers</Button>
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title={buyer.companyName}
        subtitle="Buyer Details"
        action={
          <Button onClick={() => router.push(`/buyers/${buyer.id}/edit`)}>
            Edit Buyer
          </Button>
        }
      />

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <Card title="Business Information">
            <div className={styles.section}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Legal Name</span>
                <span className={styles.value}>{buyer.name}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>GST Number</span>
                <span className={styles.value}>{buyer.gstNumber || 'Not provided'}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Status</span>
                <div className={styles.badges}>
                  <Badge variant={buyer.isActive ? 'green' : 'gray'}>
                    {buyer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Financial Details">
            <div className={styles.section}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Preferred Payment Terms</span>
                <span className={styles.value}>
                  {buyer.preferredPaymentTerms ? buyer.preferredPaymentTerms.replace('DAYS_', '') + ' Days' : 'Not specified'}
                </span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Credit Limit</span>
                <span className={styles.value}>
                  {buyer.creditLimit ? `₹${Number(buyer.creditLimit).toLocaleString()}` : 'No Limit Set'}
                </span>
              </div>
            </div>
          </Card>
          
          <Card title="Notes">
            <div className={styles.notes}>
              {buyer.notes || 'No notes available.'}
            </div>
          </Card>
        </div>

        <div className={styles.sideCol}>
          <Card title="Contact Information">
            <div className={styles.section}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Contact Person</span>
                <span className={styles.value}>{buyer.contactPerson || 'Not provided'}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>{buyer.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{buyer.email || 'Not provided'}</span>
              </div>
            </div>
          </Card>
          
          <Card title="Address Details">
            <div className={styles.section}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>Address</span>
                <span className={styles.value}>{buyer.address || 'Not provided'}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>City</span>
                <span className={styles.value}>{buyer.city || 'Not provided'}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>State</span>
                <span className={styles.value}>{buyer.state || 'Not provided'}</span>
              </div>
            </div>
          </Card>

          <Card title="Danger Zone" className={styles.dangerZone}>
            <div className={styles.section}>
              <p className={styles.dangerText}>
                Deleting this buyer will soft-delete their record. This action can be reversed by an administrator.
              </p>
              <Button variant="danger" onClick={() => setDeleteDialogOpen(true)}>
                Delete Buyer
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Buyer"
        description={`Are you sure you want to delete ${buyer.companyName}? This action can be reversed later if needed.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
