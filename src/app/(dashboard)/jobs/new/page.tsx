'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateJob } from '@/hooks/useJobs';
import { useOrders } from '@/hooks/useOrders';
import { useContractors } from '@/hooks/useContractors';
import { Input, Select, Button, useToast, Card, CardBody } from '@/components/ui';
import { ProcessType, JobUnit } from '@prisma/client';

const PROCESS_TYPES: ProcessType[] = [
  'CUTTING', 'DYEING', 'PRINTING', 'EMBROIDERY', 'STITCHING', 'WASHING', 'FINISHING', 'OTHER'
];

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId');
  const initialStageId = searchParams.get('stageId');

  const createJob = useCreateJob();
  const { data: contractorsData } = useContractors({ limit: 100 });
  const { data: ordersData } = useOrders({ limit: 100, status: 'IN_PRODUCTION' }); // simplified

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    challanNumber: '',
    contractorId: '',
    orderId: initialOrderId || '',
    stageId: initialStageId || '',
    processType: 'STITCHING' as ProcessType,
    materialDescription: '',
    quantitySent: '',
    unit: 'PIECES' as JobUnit,
    expectedReturnDate: '',
    rate: '',
    transportCost: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob.mutateAsync({
        ...formData,
        stageId: formData.stageId || undefined,
        quantitySent: Number(formData.quantitySent),
        rate: formData.rate ? Number(formData.rate) : undefined,
        transportCost: formData.transportCost ? Number(formData.transportCost) : undefined,
        expectedReturnDate: formData.expectedReturnDate ? new Date(formData.expectedReturnDate).toISOString() : new Date().toISOString(),
      });
      addToast({ message: 'Job created successfully!', type: 'success' });
      setTimeout(() => {
        if (formData.orderId) {
          router.push(`/orders/${formData.orderId}`);
        } else {
          router.push('/jobs');
        }
      }, 1500);
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      addToast({ message: error.message || 'Failed to create job', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Job (Challan)</h1>
        <p className="text-gray-500">Dispatch materials to a contractor.</p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Challan Number"
                value={formData.challanNumber}
                onChange={(e) => handleChange('challanNumber', e.target.value)}
                placeholder="CH-2026-001"
                required
              />
              <Select
                label="Contractor"
                value={formData.contractorId}
                onChange={(e) => handleChange('contractorId', e.target.value)}
                required
              >
                <option value="">Select Contractor</option>
                {contractorsData?.data.map((c: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>

              <Select
                label="Production Order (Optional)"
                value={formData.orderId}
                onChange={(e) => handleChange('orderId', e.target.value)}
                disabled={!!initialOrderId}
              >
                <option value="">Standalone Job</option>
                {ordersData?.data.map((o: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                  <option key={o.id} value={o.id}>{o.orderNumber}</option>
                ))}
              </Select>

              <Select
                label="Process Type"
                value={formData.processType}
                onChange={(e) => handleChange('processType', e.target.value)}
                required
              >
                {PROCESS_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </Select>
            </div>

            <Input
              label="Material Description"
              value={formData.materialDescription}
              onChange={(e) => handleChange('materialDescription', e.target.value)}
              placeholder="E.g. Cut panels for 500 shirts"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Quantity Sent"
                type="number"
                value={formData.quantitySent}
                onChange={(e) => handleChange('quantitySent', e.target.value)}
                required
              />
              <Select
                label="Unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                required
              >
                {Object.values(JobUnit).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Select>

              <Input
                label="Expected Return Date"
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => handleChange('expectedReturnDate', e.target.value)}
                required
              />
              <Input
                label="Rate (Optional)"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => handleChange('rate', e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createJob.isPending}>
                Create Job
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>


    </div>
  );
}
