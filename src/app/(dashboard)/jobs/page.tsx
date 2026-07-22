'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/hooks/useJobs';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  SearchInput,
  Badge,
  EmptyState,
  LoadingSpinner,
  Pagination,
  FloatingActionButton
} from '@/components/ui';
import { format } from 'date-fns';
import { Plus, User, Truck, Scissors } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Dispatched', value: 'DISPATCHED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Partially Returned', value: 'PARTIALLY_RETURNED' },
  { label: 'Returned', value: 'RETURNED' },
  { label: 'Quality Check', value: 'QUALITY_CHECK' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useJobs({ search, status, page, limit });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'gray';
      case 'DISPATCHED': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'PARTIALLY_RETURNED': return 'orange';
      case 'RETURNED': return 'blue';
      case 'QUALITY_CHECK': return 'orange';
      case 'APPROVED': return 'green';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs (Challans)</h1>
        <div className="hidden sm:block">
          <Button onClick={() => router.push('/jobs/new')} leftIcon={<Plus className="w-4 h-4" />}>
            Create Job
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search challan number, contractor..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState title="Error" description={(error as Error).message} actionLabel="Retry" onAction={() => window.location.reload()} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          title="No Jobs Found"
          description="Create a new job to track external processing."
          actionLabel="Create Job"
          onAction={() => router.push('/jobs/new')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((job) => (
              <Card key={job.id} isHoverable isClickable onClick={() => router.push(`/jobs/${job.id}`)}>
                <CardHeader className="flex justify-between items-start pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {job.challanNumber}
                    </h3>
                    <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                      <Scissors className="w-3 h-3 mr-1" />
                      {job.processType}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(job.status) as any /* eslint-disable-line */}>
                    {job.status.replace(/_/g, ' ')}
                  </Badge>
                </CardHeader>
                <CardBody className="py-3 space-y-3">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate font-medium">{job.contractorName || 'Unknown Contractor'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                    <div className="flex justify-between w-full pr-2">
                      <span>Sent: {job.quantitySent} {job.unit}</span>
                      <span>Ret: {job.quantityReturned}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-50 dark:border-gray-800">
                    Exp. Return: {format(new Date(job.expectedReturnDate), 'MMM dd, yyyy')}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <div className="sm:hidden">
        <FloatingActionButton icon={<Plus className="w-6 h-6" />} onClick={() => router.push('/jobs/new')} />
      </div>
    </div>
  );
}
