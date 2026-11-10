'use client';

import CartButton from '@/buttons/CartButton';
import WishlistButton from '@/buttons/WishlistButton';
import React, { useState } from 'react';
import { FaBolt } from 'react-icons/fa';

const ProductActions = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const increment = () => {
    if (quantity < (product?.stock || 99)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-700">Quantity:</span>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={decrement}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition-colors disabled:opacity-40"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
          <button
            onClick={increment}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition-colors disabled:opacity-40"
            disabled={quantity >= (product?.stock || 99)}
          >
            +
          </button>
        </div>

        <WishlistButton product={product} />
      </div>
      <div className="grid grid-cols-2 sm:flex-row gap-3">
        <CartButton product={product}></CartButton>
        <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200">
          <FaBolt className="text-sm text-amber-400" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
