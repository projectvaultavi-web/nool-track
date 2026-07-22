import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  let userName = 'User';
  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
      select: { name: true }
    });
    if (dbUser) userName = dbUser.name;
  }

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${userName}!`} 
      />

      <EmptyState
        title="Your command center is ready"
        description="Start by adding a contractor or creating a production order to track your work."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        }
      />

      <div className={styles.actionsGrid}>
        <Link href="/contractors/new" className={styles.actionLink}>
          <Card className={styles.actionCard}>
            <div className={styles.iconContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </div>
            <h3>Add a Contractor</h3>
            <p>Add mills, dyers, and printers to your network</p>
          </Card>
        </Link>
        
        <Link href="/buyers/new" className={styles.actionLink}>
          <Card className={styles.actionCard}>
            <div className={styles.iconContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3>Add a Buyer</h3>
            <p>Add a new customer to your database</p>
          </Card>
        </Link>

        <Link href="/orders/new" className={styles.actionLink}>
          <Card className={styles.actionCard}>
            <div className={styles.iconContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            </div>
            <h3>Create Production Order</h3>
            <p>Start tracking a new batch of fabric</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
