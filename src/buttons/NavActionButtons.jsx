'use client';

import React from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '@/provider/CartProvider';

export const NavActionButtons = () => {
  const { cartCount, wishlistCount } = useCart();

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/favorites"
        className="btn btn-ghost btn-circle relative text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        aria-label="Favorites"
        title="My Favorites"
      >
        <FaHeart className="text-lg" />
        {wishlistCount > 0 && (
          <span className="badge badge-xs bg-rose-500 text-white border-0 absolute top-1 right-1 font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full shadow-xs text-[10px]">
            {wishlistCount > 99 ? '99+' : wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart Button */}
      <Link
        href="/cart"
        className="btn btn-ghost btn-circle relative text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
        aria-label="Shopping Cart"
        title="Shopping Cart"
      >
        <FaShoppingCart className="text-lg" />
        <span className="badge badge-xs bg-sky-600 text-white border-0 absolute top-1 right-1 font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full shadow-xs text-[10px]">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      </Link>
    </div>
  );
};

export const MobileNavActionButtons = () => {
  const { cartCount, wishlistCount } = useCart();

  return (
    <div className="space-y-2">
      <Link
        href="/favorites"
        className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <FaHeart className="text-rose-500" /> Favorites
        </span>
        <span className="badge badge-sm bg-rose-500 text-white font-bold">
          {wishlistCount}
        </span>
      </Link>

      <Link
        href="/cart"
        className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <FaShoppingCart className="text-sky-600" /> Cart
        </span>
        <span className="badge badge-sm bg-sky-600 text-white font-bold">
          {cartCount}
        </span>
      </Link>
    </div>
  );
};

export default NavActionButtons;

