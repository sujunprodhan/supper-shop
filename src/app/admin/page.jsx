import React from 'react';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getAdminOverview, getAllUsers, getAllProductsAdmin } from '@/actions/server/admin';
import AdminDashboardView from '@/components/AdminDashboardView';
import Link from 'next/link';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard - SuperShop Console',
  description: 'Manage store orders, sales, payments, stock, and reports.',
};

const AdminPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login?callbackUrl=/admin');
  }

  const overviewData = await getAdminOverview();

  // If still unauthorized
  if (!overviewData.success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl mb-4 shadow-sm">
          <FaShieldAlt />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Access Required</h1>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Your account ({session.user.email}) currently has a standard <strong>User</strong> role.
          Only users with an <strong>Admin</strong> role can view this dashboard.
        </p>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Go to User Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const [usersData, productsData] = await Promise.all([
    getAllUsers(),
    getAllProductsAdmin(),
  ]);

  return (
    <AdminDashboardView
      initialStats={overviewData.stats}
      initialOrders={overviewData.recentOrders || []}
      initialUsers={usersData.users || []}
      initialProducts={productsData.products || []}
      currentUser={session.user}
    />
  );
};

export default AdminPage;

