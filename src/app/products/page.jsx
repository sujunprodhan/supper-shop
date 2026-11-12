import React, { Suspense } from 'react';
import { getProduct } from '@/actions/server/product';
import ProductCatalogView from '@/components/ProductCatalogView';
import Container from '@/layout/Container';
import { FaShoppingBag, FaSpinner } from 'react-icons/fa';

export const metadata = {
  title: 'Products | SuperShop',
  description: 'Browse our complete catalog of groceries, skincare, and everyday items.',
};

const ProductPage = async () => {
  const products = await getProduct();

  return (
    <div>
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-linear-to-b from-sky-50/70 via-white to-white py-10 md:py-14 border-b border-slate-100">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"></div>

        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-1.5 text-xs md:text-sm font-semibold text-sky-700 shadow-xs">
              <FaShoppingBag className="text-sky-600" />
              <span>Explore All Products</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Handpicked Essentials for Your{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-indigo-600">
                Daily Lifestyle
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Browse our curated collection of certified organic groceries, skincare, wellness, and everyday goods delivered fresh in 30 minutes.
            </p>
          </div>
        </Container>
      </div>

      {/* Main Catalog with Category Sidebar */}
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <FaSpinner className="text-3xl animate-spin text-sky-600" />
          </div>
        }
      >
        <ProductCatalogView initialProducts={products} />
      </Suspense>
    </div>
  );
};

export default ProductPage;
