import React from 'react';
import Container from '@/layout/Container';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight, FaTruck, FaShieldAlt, FaLeaf, FaStar, FaBolt } from 'react-icons/fa';

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-sky-50/60 via-white to-white py-10 md:py-16 lg:py-20">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"></div>

      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3.5 py-1.5 text-xs md:text-sm font-semibold text-sky-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-sky-600 animate-pulse"></span>
              <span>🔥 Mega Discount This Week — Up to 50% Off</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Fresh Groceries &amp; Daily Needs{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 via-blue-600 to-indigo-600">
                Delivered Fast
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 lg:mx-0 leading-relaxed">
              Explore thousands of farm-fresh organic vegetables, premium fruits, and daily
              essentials with our guaranteed 30-minute doorstep delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                href="/product"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm md:text-base font-semibold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Shop Now</span>
                <FaArrowRight className="text-xs" />
              </Link>

              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm md:text-base font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-sky-600 transition-colors duration-200"
              >
                Learn More
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 text-center lg:text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <FaTruck className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Free Shipping</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500">Orders over $50</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 text-center lg:text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FaLeaf className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">100% Organic</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500">Naturally fresh</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 text-center lg:text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <FaShieldAlt className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">Safe Payment</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500">Secure checkout</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:col-span-5 lg:max-w-none">
            <div className="group relative overflow-hidden rounded-3xl bg-linear-to-tr from-sky-100/50 to-indigo-100/50 p-2 shadow-2xl shadow-sky-500/10">
              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=900"
                alt="Fresh organic groceries"
                width={900}
                height={600}
                priority
                className="h-80 sm:h-100 lg:h-115 w-full object-cover rounded-2xl group-hover:scale-102 transition-transform duration-500"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5"></div>
            </div>
            <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xl border border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <FaStar className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">4.9 / 5 Rating</p>
                <p className="text-[10px] text-slate-500">15k+ Happy Customers</p>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xl border border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <FaBolt className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">30 Min Delivery</p>
                <p className="text-[10px] text-slate-500">Express to your door</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HeroBanner;
