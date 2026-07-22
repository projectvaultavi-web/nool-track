'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateOrder } from '@/hooks/useOrders';
import { useBuyers } from '@/hooks/useBuyers';
import { StepForm, Input, Select, Button, useToast } from '@/components/ui';
import { JobUnit, ProcessType } from '@prisma/client';
import { Trash2, Plus } from 'lucide-react';

const PROCESS_TYPES: ProcessType[] = [
  'CUTTING', 'DYEING', 'PRINTING', 'EMBROIDERY', 'STITCHING', 'WASHING', 'FINISHING', 'OTHER'
];

export default function NewOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();
  const { data: buyersData } = useBuyers({ limit: 100 });
  
  const [currentStep, setCurrentStep] = useState(0);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    buyerId: '',
    orderNumber: '',
    description: '',
    deadline: '',
    styleNumber: '',
    materialType: '',
    color: '',
    gsm: '',
    totalQuantity: '',
    unit: 'PIECES' as JobUnit,
    stages: [
      { processType: 'CUTTING' as ProcessType },
      { processType: 'STITCHING' as ProcessType }
    ]
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (index: number, processType: ProcessType) => {
    const newStages = [...formData.stages];
    newStages[index].processType = processType;
    setFormData((prev) => ({ ...prev, stages: newStages }));
  };

  const addStage = () => {
    setFormData((prev) => ({
      ...prev,
      stages: [...prev.stages, { processType: 'OTHER' as ProcessType }]
    }));
  };

  const removeStage = (index: number) => {
    if (formData.stages.length <= 1) return;
    const newStages = [...formData.stages];
    newStages.splice(index, 1);
    setFormData((prev) => ({ ...prev, stages: newStages }));
  };

  const handleSubmit = async () => {
    try {
      await createOrder.mutateAsync({
        ...formData,
        gsm: formData.gsm ? Number(formData.gsm) : undefined,
        totalQuantity: Number(formData.totalQuantity),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        stages: formData.stages.map((s, i) => ({
          processType: s.processType,
          sequenceNumber: i + 1,
        }))
      });
      addToast({ message: 'Production order created successfully!', type: 'success' });
      setTimeout(() => router.push('/orders'), 1500);
    } catch (error: any) {
      addToast({ message: error.message || 'Failed to create order', type: 'error' });
    }
  };

  const steps = [
    {
      title: 'Basic Details',
      content: (
        <div className="space-y-4 py-4">
          <Input
            label="Order Number *"
            value={formData.orderNumber}
            onChange={(e) => handleChange('orderNumber', e.target.value)}
            placeholder="PO-2026-001"
            required
          />
          <Select
            label="Select Buyer"
            value={formData.buyerId}
            onChange={(e) => handleChange('buyerId', e.target.value)}
          >
            <option value="">No Buyer (Internal Order)</option>
            {buyersData?.data.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} - {b.companyName}
              </option>
            ))}
          </Select>
          <Input
            label="Description *"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="e.g. 5000 Summer T-Shirts"
            required
          />
          <Input
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
          />
        </div>
      ),
    },
    {
      title: 'Item Specifications',
      content: (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Total Quantity *"
              type="number"
              value={formData.totalQuantity}
              onChange={(e) => handleChange('totalQuantity', e.target.value)}
              required
            />
            <Select
              label="Unit *"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              {Object.values(JobUnit).map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
            <Input
              label="Style Number"
              value={formData.styleNumber}
              onChange={(e) => handleChange('styleNumber', e.target.value)}
            />
            <Input
              label="Material Type"
              value={formData.materialType}
              onChange={(e) => handleChange('materialType', e.target.value)}
              placeholder="e.g. 100% Cotton"
            />
            <Input
              label="Color"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
            />
            <Input
              label="GSM"
              type="number"
              value={formData.gsm}
              onChange={(e) => handleChange('gsm', e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Production Stages',
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500 mb-4">
            Define the sequence of processes for this order. Dragging is not supported yet, so add them in order.
          </p>
          
          {formData.stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <Select
                  value={stage.processType}
                  onChange={(e) => handleStageChange(index, e.target.value as ProcessType)}
                  isFullWidth
                >
                  {PROCESS_TYPES.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </Select>
              </div>
              <button
                type="button"
                onClick={() => removeStage(index)}
                disabled={formData.stages.length <= 1}
                className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={addStage}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full mt-2"
          >
            Add Stage
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Production Order</h1>
        <p className="text-gray-500">Fill in the details to start a new production run.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-2 sm:p-6">
        <StepForm
          steps={steps}
          currentStep={currentStep}
          onNext={() => setCurrentStep(c => c + 1)}
          onBack={() => setCurrentStep(c => c - 1)}
          onSubmit={handleSubmit}
          isNextDisabled={
            (currentStep === 0 && (!formData.orderNumber || !formData.description)) ||
            (currentStep === 1 && (!formData.totalQuantity || !formData.unit)) ||
            createOrder.isPending
          }
        />
      </div>


    </div>
  );
}
