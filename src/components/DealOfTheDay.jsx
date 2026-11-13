'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/layout/Container';
import { FaClock, FaFire, FaShoppingCart, FaArrowRight, FaShieldAlt, FaStar } from 'react-icons/fa';

const DealOfTheDay = () => {
  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 md:py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider shadow-sm">
              <FaFire className="text-red-500 text-xs animate-pulse" />
              <span>Deal of the Week • 45% OFF</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Organic Himalayan Lavender &amp; Chamomile{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-indigo-400">
                Bath Elixir Set
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Formulated with 100% pure steam-distilled lavender oil and restorative sea minerals.
              Soothes muscle tension, relieves stress, and leaves your skin silk-smooth.
            </p>

            {/* Countdown Timer Blocks */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex flex-col items-center justify-center w-16 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md">
                <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Hours
                </span>
              </div>

              <span className="text-2xl font-black text-slate-600">:</span>

              <div className="flex flex-col items-center justify-center w-16 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md">
                <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Mins
                </span>
              </div>

              <span className="text-2xl font-black text-slate-600">:</span>

              <div className="flex flex-col items-center justify-center w-16 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Secs
                </span>
              </div>
            </div>

            {/* Price & Limited Quantity */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white">$26.00</span>
                <span className="text-lg text-slate-500 line-through font-semibold">$48.00</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Save $22
                </span>
              </div>
            </div>

            {/* Claim Offer CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-indigo-700 transition-all duration-200 cursor-pointer"
              >
                <FaShoppingCart className="text-xs" />
                <span>Shop Flash Sale</span>
                <FaArrowRight className="text-xs ml-1" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FaShieldAlt className="text-emerald-400" />
                <span>Free returns &amp; 30-min express dispatch</span>
              </div>
            </div>
          </div>

          {/* Right: Featured Product Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-800/60 border border-slate-700/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-700/60">
                <Image
                  src="/hot deal.png"
                  alt="Deal of the Day"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                  HOT DEAL
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-400 text-xs font-bold border border-slate-700">
                  <FaStar className="text-[11px]" />
                  <span>4.9 (842 reviews)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Stock Claimed: 84%</span>
                  <span className="text-amber-400">Only 7 sets left!</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full bg-linear-to-r from-amber-500 to-red-500 rounded-full w-[84%] transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DealOfTheDay;
