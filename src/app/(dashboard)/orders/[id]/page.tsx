'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardBody, Badge, LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { format } from 'date-fns';
import { ArrowLeft, Plus, CheckCircle, Lock, PlayCircle, Clock, AlertCircle } from 'lucide-react';

export default function OrderPipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(id);
  const { data: jobsData, isLoading: isJobsLoading /* eslint-disable-line */ } = useJobs({ orderId: id, limit: 100 });

  if (isOrderLoading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (orderError || !order) return <EmptyState title="Error" description="Could not load order." />;

  const jobs = jobsData?.data || [];
  
  const getStageIcon = (status: string) => {
    switch(status) {
      case 'LOCKED': return <Lock className="w-5 h-5 text-gray-400" />;
      case 'READY': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'IN_PROGRESS': return <PlayCircle className="w-5 h-5 text-yellow-500" />;
      case 'WAITING_APPROVAL': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStageColor = (status: string) => {
    switch(status) {
      case 'LOCKED': return 'bg-gray-50 border-gray-200';
      case 'READY': return 'bg-blue-50 border-blue-200';
      case 'IN_PROGRESS': return 'bg-yellow-50 border-yellow-200';
      case 'WAITING_APPROVAL': return 'bg-orange-50 border-orange-200';
      case 'COMPLETED': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/orders')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {order.orderNumber}
            <Badge variant="blue">{order.status}</Badge>
          </h1>
          <p className="text-gray-500">{order.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 space-y-2">
            <p className="text-sm text-gray-500">Buyer</p>
            <p className="font-semibold">{order.buyerName || 'Internal'}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 space-y-2">
            <p className="text-sm text-gray-500">Total Quantity</p>
            <p className="font-semibold">{order.totalQuantity} {order.unit}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 space-y-2">
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="font-semibold">{order.deadline ? format(new Date(order.deadline), 'PP') : 'N/A'}</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-6">Production Pipeline</h2>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          {order.stages?.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((stage, idx /* eslint-disable-line */) => {
            const stageJobs = jobs.filter(j => j.stageId === stage.id);
            
            return (
              <div key={stage.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  {getStageIcon(stage.status)}
                </div>
                
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${getStageColor(stage.status)} shadow-sm`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{stage.sequenceNumber}. {stage.processType}</h3>
                    <Badge variant={stage.status === 'COMPLETED' ? 'green' : stage.status === 'IN_PROGRESS' ? 'yellow' : 'gray'}>
                      {stage.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {stageJobs.length > 0 ? (
                      stageJobs.map(job => (
                        <div key={job.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:border-blue-300" onClick={() => router.push(`/jobs/${job.id}`)}>
                          <div>
                            <p className="font-medium text-sm">{job.challanNumber}</p>
                            <p className="text-xs text-gray-500">{job.contractorName} • {job.quantitySent} {job.unit}</p>
                          </div>
                          <Badge variant="blue">{job.status}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No jobs created for this stage yet.</p>
                    )}
                  </div>
                  
                  {['READY', 'IN_PROGRESS'].includes(stage.status) && (
                    <Button 
                      variant="secondary" 
                      className="w-full mt-4" 
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => router.push(`/jobs/new?orderId=${order.id}&stageId=${stage.id}`)}
                    >
                      New Job
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
