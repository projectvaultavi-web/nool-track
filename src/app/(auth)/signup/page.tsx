'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import styles from '../login/page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password') || '';
  
  const getPasswordStrength = () => {
    if (!password) return '';
    let score = 0;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score === 0) return 'Weak';
    if (score === 1 || score === 2) return 'Medium';
    return 'Strong';
  };

  const strength = getPasswordStrength();
  const strengthClass = strength === 'Weak' ? styles.strengthWeak 
                      : strength === 'Medium' ? styles.strengthMedium 
                      : strength === 'Strong' ? styles.strengthStrong : '';

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
      }

      addToast({ title: 'Success', message: 'Account created successfully!', type: 'success' });
      router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join Nool Track today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name')}
        />
        
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
          />
          {password && (
            <div>
              <div className={styles.strengthBar + ' ' + strengthClass}></div>
              <div className={styles.strengthText}>Password strength: {strength}</div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className={styles.submitBtn} isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className={styles.footer}>
        <p>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
