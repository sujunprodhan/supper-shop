'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaTrashAlt,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaArrowLeft,
  FaShieldAlt,
  FaTruck,
  FaTag,
  FaCheck,
  FaSpinner,
} from 'react-icons/fa';
import { removeCartItem, updateCartQuantity, clearCart } from '@/actions/server/cart';
import { useCart } from '@/provider/CartProvider';
import { toast } from 'sonner';

const CartView = ({ initialItems = [] }) => {
  const router = useRouter();
  const { refreshCartCount, setCartCount } = useCart();
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setCartCount(items.length);
  }, [items.length, setCartCount]);
  const [loadingId, setLoadingId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 10;
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  // Handle Remove Single Item
  const handleRemove = async (item) => {
    const id = item._id;
    const productId = item.productId;
    setLoadingId(id);
    try {
      const res = await removeCartItem({ id, productId });
      if (res?.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        refreshCartCount();
        toast.success(res.message || 'Item removed from cart!');
      } else {
        toast.error(res?.message || 'Failed to remove item.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  // Handle Quantity Change (+ or -)
  const handleQuantity = async (item, delta) => {
    const id = item._id;
    const currentQty = Number(item.quantity) || 1;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      handleRemove(item);
      return;
    }

    setLoadingId(id);
    try {
      const res = await updateCartQuantity({
        id,
        productId: item.productId,
        quantity: newQty,
      });

      if (res?.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === id ? { ...i, quantity: newQty } : i))
        );
        refreshCartCount();
      } else {
        toast.error(res?.message || 'Failed to update quantity.');
      }
    } catch (error) {
      toast.error('Failed to update quantity.');
    } finally {
      setLoadingId(null);
    }
  };

  // Handle Clear Entire Cart
  const handleClear = async () => {
    if (!confirm('Are you sure you want to remove all items from your cart?')) return;

    setIsClearing(true);
    try {
      const res = await clearCart();
      if (res?.success) {
        setItems([]);
        refreshCartCount();
        toast.success('Your cart has been cleared.');
      } else {
        toast.error(res?.message || 'Failed to clear cart.');
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setIsClearing(false);
    }
  };

  // Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'DISCOUNT10' || cleanCode === 'SUPERSHOP') {
      setAppliedDiscount(10);
      setCouponMessage('10% discount applied successfully!');
      toast.success('Coupon applied: 10% off!');
    } else if (cleanCode === 'FREESHIP') {
      setAppliedDiscount(15);
      setCouponMessage('15% discount applied successfully!');
      toast.success('Coupon applied: 15% off!');
    } else {
      setCouponMessage('');
      toast.error('Invalid coupon code. Try DISCOUNT10');
    }
  };

  // Empty State
  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-24 h-24 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-6 shadow-sm">
          <FaShoppingCart className="text-4xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-8">
          Looks like you haven&apos;t added any items to your cart yet. Explore our wide range of
          products and find something you love!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <FaArrowLeft className="text-xs" />
          <span>Explore Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-sky-600">{items.length}</span> unique{' '}
            {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <button
          onClick={handleClear}
          disabled={isClearing}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          {isClearing ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaTrashAlt className="text-xs" />
          )}
          <span>Clear All</span>
        </button>
      </div>

      {/*Items List Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isItemLoading = loadingId === item._id;
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;
            const itemTotal = itemPrice * itemQty;

            return (
              <div
                key={item._id}
                className={`relative flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-sky-200 transition-all ${
                  isItemLoading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || 'Product'}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-bold text-slate-900 text-sm sm:text-base hover:text-sky-600 transition-colors line-clamp-1"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">${itemPrice.toFixed(2)}</span>
                    {item.unit && <span>/ {item.unit}</span>}
                  </div>

                  <p className="text-xs text-emerald-600 font-medium">In Stock</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => handleQuantity(item, -1)}
                      disabled={isItemLoading}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className="text-[10px]" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-800">
                      {itemQty}
                    </span>
                    <button
                      onClick={() => handleQuantity(item, 1)}
                      disabled={isItemLoading}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <FaPlus className="text-[10px]" />
                    </button>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                  <span className="font-black text-slate-900 text-base sm:text-lg">
                    ${itemTotal.toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleRemove(item)}
                    disabled={isItemLoading}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    {isItemLoading ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <FaTrashAlt className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Order Summary
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({appliedDiscount}%)</span>
                  <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Estimated Shipping
                  {subtotal > 50 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-900">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-black text-slate-900">Grand Total</span>
                  <p className="text-[11px] text-slate-400">Includes all applicable taxes</p>
                </div>
                <span className="text-2xl font-black text-sky-600">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coupon Code*/}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaTag className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Coupon (try DISCOUNT10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <FaCheck className="text-[10px]" /> {couponMessage}
                </p>
              )}
            </form>

            {/* Checkout Button */}
            <button
              onClick={() => toast.success('Proceeding to Checkout! (Feature coming soon)')}
              className="w-full rounded-2xl bg-sky-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <FaShieldAlt className="text-sm" />
              <span>Proceed to Checkout</span>
            </button>

            {/* Guarantee Perks */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <FaTruck className="text-sky-500 shrink-0" />
                <span>Free delivery on orders over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-emerald-500 shrink-0" />
                <span>Safe & Secure 256-bit SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;

