'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaBoxOpen,
  FaHeart,
  FaTruck,
  FaReceipt,
  FaUser,
  FaEnvelope,
  FaShoppingBag,
  FaArrowRight,
  FaShieldAlt,
  FaCreditCard,
  FaExternalLinkAlt,
} from 'react-icons/fa';

const UserDashboardView = ({ dashboardData, user }) => {
  const { stats = {}, orders = [], profile = {} } = dashboardData || {};

  return (
    <div className="py-8 sm:py-12 max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white shadow-md">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={56}
              height={56}
              className="rounded-full ring-4 ring-white/20"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-white/20 text-white font-black flex items-center justify-center text-xl">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Hello, {user?.name || 'Valued Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 flex items-center gap-2 mt-0.5">
              <span>{user?.email}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                {profile?.role || 'User'}
              </span>
            </p>
          </div>
        </div>

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <FaShieldAlt className="text-xs" />
            <span>Open Admin Console</span>
          </Link>
        )}
      </div>

      {/* User KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <FaBoxOpen className="text-sky-600 text-sm" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalOrders || 0}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Deliveries
            </span>
            <FaTruck className="text-amber-500 text-sm" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats.pendingDeliveries || 0}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Favorites
            </span>
            <FaHeart className="text-rose-500 text-sm" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-600">
            {stats.wishlistCount || 0}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Spent
            </span>
            <FaCreditCard className="text-emerald-600 text-sm" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            ${Number(stats.totalSpent || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Grid: Orders List & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: My Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FaReceipt className="text-sky-600" />
              <span>My Orders ({orders.length})</span>
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Explore Products</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 rounded-3xl border border-slate-200/80 bg-white text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-2xl">
                <FaShoppingBag />
              </div>
              <h3 className="text-base font-bold text-slate-800">You haven&apos;t placed any orders yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our catalog of fresh items and place your first order today!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <div
                    key={order._id}
                    className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-4 hover:border-sky-200 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          #{order._id.slice(-6)}
                        </span>
                        <span className="text-slate-400 ml-2">Ordered on {dateStr}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            order.paymentStatus?.toLowerCase().includes('paid')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items Thumbnails */}
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100 shrink-0"
                        >
                          <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title || 'Product'}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                                Item
                              </div>
                            )}
                          </div>
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 block truncate max-w-32">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Qty: {item.quantity || 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer / Total & Invoice Link */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Total Amount</span>
                        <span className="text-base font-black text-slate-900">
                          ${Number(order.grandTotal).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/order-success?order_id=${order._id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 text-xs transition-colors"
                      >
                        <FaReceipt className="text-sky-600 text-[11px]" />
                        <span>View Invoice</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Shortcuts & Profile Info */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Quick Shortcuts
            </h3>

            <div className="space-y-2">
              <Link
                href="/favorites"
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-rose-100/60 text-rose-600 flex items-center justify-center text-sm">
                    <FaHeart />
                  </div>
                  <span className="text-xs font-bold">My Saved Favorites</span>
                </div>
                <FaArrowRight className="text-xs text-slate-400" />
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-sky-100/60 text-sky-600 flex items-center justify-center text-sm">
                    <FaShoppingBag />
                  </div>
                  <span className="text-xs font-bold">My Shopping Cart</span>
                </div>
                <FaArrowRight className="text-xs text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Account Overview Capsule */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Account Information
            </h3>
            <div className="space-y-2 pt-1 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-slate-800">{user?.name || 'Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email Address</span>
                <span className="font-bold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Role</span>
                <span className="font-bold capitalize text-sky-600">{profile?.role || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardView;

