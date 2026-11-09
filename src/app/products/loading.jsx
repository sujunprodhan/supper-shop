import React from 'react';
import Container from '@/layout/Container';

const ProductLoading = () => {
  return (
    <Container>
      {/* product skeleton */}
      <div className="py-10 animate-pulse">
        <div className="h-9 w-64 bg-slate-200 rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-4"
            >
              <div className="aspect-square w-full rounded-2xl bg-slate-200"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
                  <div className="h-4 w-12 bg-slate-200 rounded-md"></div>
                </div>

                <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-full bg-slate-100 rounded-md"></div>

                <div className="h-6 w-24 bg-slate-200 rounded-md pt-2"></div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="h-9 rounded-xl bg-slate-200"></div>
                  <div className="h-9 rounded-xl bg-slate-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default ProductLoading;
