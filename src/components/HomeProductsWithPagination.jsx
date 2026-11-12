'use client';

import React, { useState, useRef } from 'react';
import ProductCard from '@/carddesign/ProductCard';
import { FaChevronLeft, FaChevronRight, FaFire, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

const HomeProductsWithPagination = ({ products = [] }) => {
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef(null);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3.5 py-1 text-xs font-bold text-amber-700 shadow-2xs mb-2">
            <FaFire className="text-amber-500 text-xs" />
            <span>Trending & Popular</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Featured{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-indigo-600">
              Products
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Hand-selected items on special discounts with fast same-day delivery. Showing 8 items per page.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 group transition-colors"
        >
          <span>Browse Full Catalog ({products.length})</span>
          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 8 Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {currentProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(endIndex, products.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{products.length}</span> products
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-sky-600 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              aria-label="Previous Page"
            >
              <FaChevronLeft className="text-[10px]" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 shadow-xs'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-sky-600 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              aria-label="Next Page"
            >
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeProductsWithPagination;

