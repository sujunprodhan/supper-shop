'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaCheckCircle,
  FaShoppingBag,
  FaPrint,
  FaArrowRight,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaTruck,
  FaReceipt,
} from 'react-icons/fa';

const OrderSuccessView = ({ order }) => {
  if (!order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
          <FaCheckCircle />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Order Processed</h1>
        <p className="text-sm text-slate-500">
          Your order has been recorded. Check your email for full order confirmation details.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
        >
          <span>Continue Shopping</span>
          <FaArrowRight className="text-[10px]" />
        </Link>
      </div>
    );
  }

  const {
    _id,
    userName,
    userEmail,
    items = [],
    shippingAddress = {},
    deliveryMethod,
    paymentMethod,
    subtotal = 0,
    shippingCost = 0,
    tax = 0,
    grandTotal = 0,
    orderStatus,
    paymentStatus,
    createdAt,
    transactionId,
  } = order;

  const orderDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : new Date().toLocaleDateString();

  return (
    <div className="py-10 sm:py-16 max-w-3xl mx-auto">
      {/* Success Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 text-3xl shadow-sm">
          <FaCheckCircle />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We&apos;ve received your order and our fulfillment team has already started preparing your
          package.
        </p>
      </div>

      {/* Order Invoice Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm space-y-8">
        {/* Order Meta Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Order Reference</span>
            <span className="font-mono font-bold text-slate-800 text-sm">#{_id}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Date Placed</span>
            <span className="font-semibold text-slate-800">{orderDate}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Payment Status</span>
            <span
              className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                paymentStatus?.toLowerCase().includes('paid')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {paymentStatus || 'Processing'}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-sky-600" /> Shipping Address
            </h3>
            <p className="font-semibold text-slate-900">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p className="text-slate-500">
              {shippingAddress.street}
              {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}
            </p>
            <p className="text-slate-500">
              {shippingAddress.city} {shippingAddress.postalCode ? `- ${shippingAddress.postalCode}` : ''}
            </p>
            <p className="text-slate-500 flex items-center gap-1.5 pt-1">
              <FaPhone className="text-slate-400 text-[10px]" /> {shippingAddress.phone || 'N/A'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FaReceipt className="text-sky-600" /> Payment & Delivery
            </h3>
            <p className="text-slate-600">
              <span className="text-slate-400">Payment Gateway:</span>{' '}
              <strong className="text-slate-800 capitalize">{paymentMethod}</strong>
            </p>
            {transactionId && (
              <p className="text-slate-600 truncate">
                <span className="text-slate-400">Txn ID:</span>{' '}
                <span className="font-mono text-slate-800">{transactionId}</span>
              </p>
            )}
            <p className="text-slate-600">
              <span className="text-slate-400">Delivery Method:</span>{' '}
              <strong className="text-slate-800 uppercase">{deliveryMethod} Delivery</strong>
            </p>
            <p className="text-slate-600 flex items-center gap-1.5 pt-1">
              <FaEnvelope className="text-slate-400 text-[10px]" /> {shippingAddress.email || userEmail}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Ordered Items ({items.length})</h3>

          <div className="space-y-3">
            {items.map((item, index) => {
              const price = Number(item.price) || 0;
              const qty = Number(item.quantity) || 1;
              const total = price * qty;

              return (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50/70 border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || 'Product'}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                          Item
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        Qty: {qty} × ${price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-900 shrink-0">
                    ${total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-slate-100 pt-6 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">${Number(subtotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee</span>
            <span className="font-semibold text-slate-800">
              {Number(shippingCost) === 0 ? 'Free' : `$${Number(shippingCost).toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Estimated VAT/Tax (5%)</span>
            <span className="font-semibold text-slate-800">${Number(tax).toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
            <span className="text-base font-black text-slate-900">Grand Total Paid</span>
            <span className="text-2xl font-black text-sky-600">${Number(grandTotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            onClick={() => window.print()}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FaPrint className="text-xs text-slate-500" />
            <span>Print Receipt</span>
          </button>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 transition-colors"
          >
            <FaShoppingBag className="text-xs" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessView;

