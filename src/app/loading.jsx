import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const RootLoading = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
      <div className="relative flex flex-col items-center space-y-5">
        <div className="absolute -inset-4 rounded-full bg-sky-400/20 blur-2xl animate-pulse"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white shadow-2xl shadow-sky-500/40 animate-bounce duration-1000">
          <FaShoppingCart className="text-3xl" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-800">
            Super<span className="text-sky-600">Shop</span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="loading loading-spinner loading-sm text-sky-600"></span>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Loading...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootLoading;
