import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: authUser.id },
  });

  if (!dbUser) {
    // Edge case if user exists in auth but not in DB
    redirect('/login');
  }

  if (!dbUser.organizationId) {
    redirect('/setup');
  }

  const user = {
    name: dbUser.name,
    email: dbUser.email,
  };

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
