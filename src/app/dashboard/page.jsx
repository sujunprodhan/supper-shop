import React from 'react';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Container from '@/layout/Container';
import UserDashboardView from '@/components/UserDashboardView';
import { getUserDashboardData } from '@/actions/server/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Dashboard - SuperShop',
  description: 'View your order history, account status, and track your shipments.',
};

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const dashboardData = await getUserDashboardData();

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <Container>
        <UserDashboardView dashboardData={dashboardData} user={session.user} />
      </Container>
    </div>
  );
};

export default DashboardPage;

