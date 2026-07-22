'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { BuyerFilters } from './components/BuyerFilters';
import { useBuyers } from '@/hooks/useBuyers';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function BuyersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useBuyers({
    search,
    status,
    page,
    limit: 10,
  });

  return (
    <div className={styles.container}>
      <PageHeader
        title="Buyers"
        subtitle="Manage your customers and clients."
        action={
          <Button onClick={() => router.push('/buyers/new')}>Add Buyer</Button>
        }
      />

      <BuyerFilters
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(1); }}
      />

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load buyers"
          description={(error as Error).message}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          }
        />
      ) : data?.data.length === 0 ? (
        <EmptyState
          title="No buyers found"
          description={search || status ? 'Try adjusting your filters.' : 'Add your first buyer to get started.'}
          action={
            !(search || status) ? (
              <Button onClick={() => router.push('/buyers/new')}>Add Buyer</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={styles.list}>
            {data?.data.map((buyer) => (
              <Card
                key={buyer.id}
                title={buyer.companyName}
                onClick={() => router.push(`/buyers/${buyer.id}`)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactName}>{buyer.contactPerson || buyer.name}</span>
                    <span className={styles.contactPhone}>{buyer.phone || 'No Phone Number'}</span>
                  </div>
                  
                  {buyer.city && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>City</span>
                      <span className={styles.infoValue}>{buyer.city}</span>
                    </div>
                  )}

                  <div className={styles.badges}>
                    <Badge variant={buyer.isActive ? 'green' : 'gray'}>
                      {buyer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
