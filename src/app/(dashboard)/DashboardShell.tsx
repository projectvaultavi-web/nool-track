'use client';

import { useRouter } from 'next/navigation';
import { Sidebar, BottomNav, TopBar } from '@/components/layout';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

interface DashboardShellProps {
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const getTitle = () => {
    if (pathname.includes('/orders')) return 'Orders';
    if (pathname.includes('/jobs')) return 'Jobs';
    if (pathname.includes('/contractors')) return 'Contractors';
    if (pathname.includes('/payments')) return 'Payments';
    if (pathname.includes('/reports')) return 'Reports';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className={styles.layout}>
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className={styles.mainWrapper}>
        <TopBar title={getTitle()} user={user} />
        
        <main className={styles.content}>
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
