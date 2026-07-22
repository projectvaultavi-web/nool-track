'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  SearchInput,
  Badge,
  EmptyState,
  LoadingSpinner,
  Pagination,
  FloatingActionButton
} from '@/components/ui';
import { format } from 'date-fns';
import { Plus, Clock, User, Package, Calendar } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'In Production', value: 'IN_PRODUCTION' },
  { label: 'Quality Check', value: 'QUALITY_CHECK' },
  { label: 'Ready', value: 'READY_FOR_DISPATCH' },
  { label: 'Delivered', value: 'DELIVERED' }
];

export default function OrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useOrders({ search, status, page, limit });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'CONFIRMED': return 'blue';
      case 'IN_PRODUCTION': return 'yellow';
      case 'QUALITY_CHECK': return 'orange';
      case 'READY_FOR_DISPATCH': return 'green';
      case 'DELIVERED': return 'green';
      case 'CLOSED': return 'gray';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Orders</h1>
        <div className="hidden sm:block">
          <Button onClick={() => router.push('/orders/new')} leftIcon={<Plus className="w-4 h-4" />}>
            Create Order
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by PO number, buyer..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
        <EmptyState
          title="Error Loading Orders"
          description={(error as Error).message}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      ) : data?.data.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="Create a new production order to get started."
          actionLabel="Create Order"
          onAction={() => router.push('/orders/new')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((order) => (
              <Card 
                key={order.id} 
                isHoverable 
                isClickable 
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <CardHeader className="flex justify-between items-start pb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">{order.styleNumber || 'No style no.'}</p>
                  </div>
                  <Badge variant={getStatusColor(order.status) as any}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </CardHeader>
                <CardBody className="py-2 space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span className="truncate">{order.buyerName || 'Unknown Buyer'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Package className="w-4 h-4 mr-2" />
                    <span>
                      {order.totalQuantity} {order.unit.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {order.deadline ? format(new Date(order.deadline), 'MMM dd, yyyy') : 'No deadline'}
                    </span>
                  </div>
                </CardBody>
                <CardFooter className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Created {format(new Date(order.createdAt), 'MMM dd')}
                  </div>
                </CardFooter>
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

      {/* Mobile FAB */}
      <div className="sm:hidden">
        <FloatingActionButton 
          icon={<Plus className="w-6 h-6" />}
          onClick={() => router.push('/orders/new')}
        />
      </div>
    </div>
  );
}
