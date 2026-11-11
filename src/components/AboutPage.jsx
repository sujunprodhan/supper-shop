'use client'
import Container from '@/layout/Container';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaLeaf,
  FaUsers,
  FaAward,
  FaHeart,
  FaTruck,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';

export const metadata = {
  title: 'About Us | SuperShop',
  description: 'Learn more about SuperShop, our mission, values, and organic fresh products.',
};

const AboutPage = async () => {
  // Artificial delay to demonstrate loading state with logo
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return (
    <div className="bg-white">
      {/* 1. About Page Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-white py-14 md:py-20 border-b border-slate-100">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"></div>

        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-1.5 text-xs md:text-sm font-semibold text-sky-700 shadow-xs">
              <FaLeaf className="text-emerald-500" />
              <span>About SuperShop</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Bringing Pure Freshness To{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
                Your Doorstep
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We started SuperShop with a simple mission: to connect families directly with
              certified organic farms, delivering fresh, wholesome essentials within 30 minutes.
            </p>

            <div className="pt-2 flex justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-600/25 hover:bg-sky-700 hover:-translate-y-0.5 transition-all"
              >
                <span>Explore Products</span>
                <FaArrowRight className="text-xs" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6 pt-8 border-t border-slate-100">
            <div className="rounded-2xl bg-white p-5 text-center shadow-xs border border-slate-100">
              <p className="text-2xl sm:text-3xl font-black text-sky-600">50K+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Happy Customers</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center shadow-xs border border-slate-100">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">100%</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Organic &amp; Fresh
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center shadow-xs border border-slate-100">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">30 Min</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Avg. Delivery</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center shadow-xs border border-slate-100">
              <p className="text-2xl sm:text-3xl font-black text-amber-500">4.9 ★</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Customer Rating</p>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Our Mission & Story Section */}
      <div className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Story Image */}
            <div className="relative mx-auto w-full max-w-lg lg:col-span-6 lg:max-w-none">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-slate-100 shadow-xl border border-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=900"
                  alt="Organic supermarket products"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Story Content */}
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-block rounded-lg bg-sky-100/70 px-3 py-1 text-xs font-bold text-sky-700 uppercase tracking-wider">
                Our Story
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                From Local Harvests to Modern Kitchens
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Founded with a passion for wholesome living, SuperShop bridges the gap between
                dedicated local growers and conscious urban consumers. Every product on our shelves
                is rigorously vetted for quality, freshness, and sustainability.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FaCheckCircle className="text-emerald-500 shrink-0 text-base" />
                  <span>Direct sourcing from certified farms without middlemen</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FaCheckCircle className="text-emerald-500 shrink-0 text-base" />
                  <span>Eco-friendly packaging and zero-waste delivery logistics</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <FaCheckCircle className="text-emerald-500 shrink-0 text-base" />
                  <span>100% money-back freshness guarantee on all orders</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 3. Core Values */}
      <div className="bg-slate-50 py-14 md:py-20 border-t border-slate-100">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Values That Drive Us
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              We stand behind every item we deliver, upholding the highest standards of integrity
              and service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-xl">
                <FaLeaf />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Always Fresh</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Produce picked and delivered at peak ripeness for unforgettable taste.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 text-xl">
                <FaTruck />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Express Delivery</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Smart logistics ensure your essentials reach you in under 30 minutes.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 text-xl">
                <FaAward />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Top Quality</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Triple-checked quality control ensuring only the finest items reach you.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-xl">
                <FaHeart />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Community First</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                We empower local farmers and give back to sustainable agricultural communities.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AboutPage;
