import React from 'react';
import Container from '@/layout/Container';
import Image from 'next/image';
import { FaStar, FaQuoteLeft, FaCheckCircle, FaHeart } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Nusrat Jahan',
    role: 'Verified Buyer • Gulshan, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    review:
      'The organic skincare and lavender bath oils are absolutely divine! Delivered in under 35 minutes and packed with utmost care. SuperShop is now my family’s daily go-to.',
    productTag: 'Lavender & Chamomile Elixir',
  },
  {
    name: 'Tanvir Ahmed',
    role: 'Verified Buyer • Banani, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    review:
      'The bKash payment was instant and the admin approved and dispatched my order within minutes. Truly the smoothest online supermarket experience in Bangladesh!',
    productTag: 'Herbal Tea Tree Body Wash',
  },
  {
    name: 'Farhana Kabir',
    role: 'Verified Buyer • Uttara, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    review:
      'I was skeptical about ordering organic spa essentials online, but the fragrance and quality exceeded all expectations. 10/10 recommend to all wellness lovers.',
    productTag: 'Eucalyptus Himalayan Scrub',
  },
];

const Testimonials = () => {
  return (
    <section className="py-14 sm:py-20 bg-slate-50/60 border-t border-slate-100">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100/80 px-3.5 py-1 text-xs font-bold text-rose-700 shadow-2xs">
            <FaHeart className="text-rose-500 text-xs" />
            <span>Community Love</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Loved by Over{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-indigo-600">
              12,000+ Happy Customers
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Real experiences from authentic buyers who enjoy fresh products and swift doorstep service every single day.
          </p>
        </div>

        {/* 3-Card Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Top: Stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <FaStar key={i} className="text-xs" />
                    ))}
                  </div>
                  <FaQuoteLeft className="text-slate-200 text-xl" />
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>

              {/* Bottom: User Info & Tag */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                      <FaCheckCircle className="text-sky-500 text-[11px]" title="Verified Buyer" />
                    </div>
                    <span className="text-[11px] text-slate-400">{t.role}</span>
                  </div>
                </div>

                <div className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-700">
                  Purchased: {t.productTag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;

