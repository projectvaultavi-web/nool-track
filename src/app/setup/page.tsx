'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setupSchema, SetupInput } from '@/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import styles from './page.module.css';

export default function SetupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupInput>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data: SetupInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to setup organization');
      }

      addToast({ title: 'Success', message: 'Company setup complete!', type: 'success' });
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span>Nool Track</span>
            <span className={styles.logoDot}></span>
          </div>
          <h1 className={styles.title}>Set up your company</h1>
          <p className={styles.subtitle}>Tell us a bit about your organization</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Company Name"
            placeholder="e.g. Acme Textiles"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          
          <Input
            label="Phone Number (Optional)"
            placeholder="+91"
            error={errors.phone?.message}
            {...register('phone')}
          />
          
          <Input
            label="GST Number (Optional)"
            placeholder="15-character GSTIN"
            error={errors.gstNumber?.message}
            {...register('gstNumber')}
          />

          <Button type="submit" className={styles.submitBtn} isLoading={isLoading}>
            Get Started
          </Button>
        </form>
      </div>
    </div>
  );
}
