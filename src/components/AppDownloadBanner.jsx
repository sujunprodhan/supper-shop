import React from 'react';
import Container from '@/layout/Container';
import Link from 'next/link';
import { FaApple, FaGooglePlay, FaMobileAlt, FaBolt, FaTag } from 'react-icons/fa';

const AppDownloadBanner = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-sky-600 via-sky-700 to-indigo-800 text-white p-8 sm:p-12 md:p-16 shadow-xl">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                <FaBolt className="text-amber-300 text-xs" />
                <span>SuperShop Mobile Experience</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Shop Faster, Smarter &amp; Save 15% on First App Order
              </h2>

              <p className="text-xs sm:text-sm text-sky-100 max-w-xl leading-relaxed">
                Download the SuperShop App today for exclusive in-app daily flash deals, live GPS order tracking, and 1-tap fast checkout.
              </p>

              {/* Promo Code Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold">
                <FaTag className="text-amber-300" />
                <span>Use Coupon Code:</span>
                <span className="font-mono bg-white text-slate-900 px-2.5 py-0.5 rounded-lg shadow-sm font-black">
                  APP15
                </span>
                <span className="text-sky-200 hidden sm:inline">(Instant 15% Off)</span>
              </div>

              {/* Download Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-black text-white border border-slate-700 transition-all shadow-md group cursor-pointer"
                >
                  <FaApple className="text-2xl group-hover:scale-110 transition-transform" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      Download on the
                    </span>
                    <span className="text-xs font-bold text-white">Apple App Store</span>
                  </div>
                </a>

                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-black text-white border border-slate-700 transition-all shadow-md group cursor-pointer"
                >
                  <FaGooglePlay className="text-xl text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      Get it on
                    </span>
                    <span className="text-xs font-bold text-white">Google Play</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Stat Feature Box */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="w-full max-w-xs rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto text-2xl shadow-sm">
                  <FaMobileAlt />
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">4.9 ★★★★★</div>
                  <p className="text-xs text-sky-150 mt-1">Over 25,000+ app ratings</p>
                </div>
                <div className="pt-2 border-t border-white/15 text-xs text-sky-100 font-medium">
                  Average delivery time: <span className="font-bold text-white">28 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AppDownloadBanner;

