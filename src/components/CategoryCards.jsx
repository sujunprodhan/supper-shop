import React from 'react';
import Link from 'next/link';
import Container from '@/layout/Container';
import { getProduct } from '@/actions/server/product';
import {
  FaSpa,
  FaPumpSoap,
  FaHeart,
  FaMagic,
  FaBath,
  FaLeaf,
  FaArrowRight,
  FaBoxes,
} from 'react-icons/fa';

// Category theme metadata
const categoryMeta = {
  Skincare: {
    icon: FaPumpSoap,
    gradient: 'from-sky-500 to-cyan-500',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-100 hover:border-sky-300',
    textColor: 'text-sky-600',
    tagline: 'Cleanse & Glow',
  },
  'Body Care': {
    icon: FaHeart,
    gradient: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-100 hover:border-rose-300',
    textColor: 'text-rose-600',
    tagline: 'Hydrate & Smooth',
  },
  'Hair Care': {
    icon: FaMagic,
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-100 hover:border-indigo-300',
    textColor: 'text-indigo-600',
    tagline: 'Nourish & Shine',
  },
  'Spa Essentials': {
    icon: FaBath,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-100 hover:border-amber-300',
    textColor: 'text-amber-600',
    tagline: 'Relax & Unwind',
  },
  Aromatherapy: {
    icon: FaLeaf,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-100 hover:border-emerald-300',
    textColor: 'text-emerald-600',
    tagline: 'Pure & Peaceful',
  },
};

const CategoryCards = async () => {
  const products = await getProduct();

  // Compute live categories and counts from real MongoDB products
  const categoryCounts = {};
  products.forEach((p) => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  const categories = Object.keys(categoryCounts);

  return (
    <section className="py-12 md:py-16 bg-slate-50/50 border-y border-slate-100/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3.5 py-1 text-xs font-bold text-sky-700 shadow-2xs mb-2">
              <FaSpa className="text-sky-600 text-xs" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Shop by <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-indigo-600">Category</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Discover certified organic self-care, therapeutic wellness, and daily essentials curated for your healthy lifestyle.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 group transition-colors"
          >
            <span>All Products ({products.length})</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((category) => {
            const meta = categoryMeta[category] || {
              icon: FaBoxes,
              gradient: 'from-slate-700 to-slate-900',
              bgLight: 'bg-slate-50',
              borderLight: 'border-slate-200 hover:border-sky-300',
              textColor: 'text-slate-700',
              tagline: 'Curated Essentials',
            };
            const IconComponent = meta.icon;
            const count = categoryCounts[category] || 0;

            return (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white border ${meta.borderLight} shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300`}
              >
                {/* Glow accent */}
                <div
                  className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-linear-to-br ${meta.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 pointer-events-none`}
                />

                <div className="space-y-4">
                  {/* Icon Container */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-linear-to-br ${meta.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <IconComponent className="text-xl" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                      {count} items
                    </span>
                  </div>

                  {/* Category Details */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                      {category}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                      {meta.tagline}
                    </p>
                  </div>
                </div>

                {/* Explore Pill Button */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-sky-600 transition-colors">
                  <span>Explore</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-all">
                    <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default CategoryCards;

