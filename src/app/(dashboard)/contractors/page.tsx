'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { ContractorFilters } from './components/ContractorFilters';
import { useContractors } from '@/hooks/useContractors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ContractorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useContractors({
    search,
    type,
    status,
    page,
    limit: 10,
  });

  return (
    <div className={styles.container}>
      <PageHeader
        title="Contractors"
        subtitle="Manage your network of contractors and vendors."
        action={
          <Button onClick={() => router.push('/contractors/new')}>Add Contractor</Button>
        }
      />

      <ContractorFilters
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        type={type}
        onTypeChange={(val) => { setType(val); setPage(1); }}
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(1); }}
      />

      {isLoading ? (
        <div className={styles.loadingWrap}>
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load contractors"
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
          title="No contractors found"
          description={search || type || status ? 'Try adjusting your filters.' : 'Add your first contractor to get started.'}
          action={
            !(search || type || status) ? (
              <Button onClick={() => router.push('/contractors/new')}>Add Contractor</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={styles.list}>
            {data?.data.map((contractor) => (
              <Card
                key={contractor.id}
                title={contractor.name}
                onClick={() => router.push(`/contractors/${contractor.id}`)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactName}>{contractor.contactPerson || 'Unknown Contact'}</span>
                    <span className={styles.contactPhone}>{contractor.phone || 'No Phone Number'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={styles.infoValue}>{contractor.contractorType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className={styles.badges}>
                    <Badge variant={contractor.isActive ? 'green' : 'gray'}>
                      {contractor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={contractor.rating ? 'yellow' : 'gray'}>
                      {contractor.rating ? `★ ${Number(contractor.rating).toFixed(1)}` : 'No Rating'}
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
