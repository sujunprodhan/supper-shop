import React from 'react';
import Container from '@/layout/Container';
import {
  FaTruck,
  FaShieldAlt,
  FaLeaf,
  FaHeadset,
  FaUndoAlt,
  FaAward,
} from 'react-icons/fa';

const features = [
  {
    icon: FaTruck,
    title: '30-Min Rapid Delivery',
    description: 'Guaranteed doorstep arrival fresh and temperature-controlled across the city.',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100 hover:border-sky-300',
    textColor: 'text-sky-600',
  },
  {
    icon: FaLeaf,
    title: '100% Organic & Clean',
    description: 'Directly sourced from certified eco-friendly organic farms with zero chemical fillers.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100 hover:border-emerald-300',
    textColor: 'text-emerald-600',
  },
  {
    icon: FaShieldAlt,
    title: 'Bank-Grade Safe Checkout',
    description: 'Encrypted via SSLCOMMERZ with instant bKash, Nagad, Visa, and Cash on Delivery.',
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100 hover:border-indigo-300',
    textColor: 'text-indigo-600',
  },
  {
    icon: FaAward,
    title: 'Direct-from-Source Savings',
    description: 'Fair everyday prices with zero intermediary markups. What you see is what you pay.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100 hover:border-amber-300',
    textColor: 'text-amber-600',
  },
  {
    icon: FaUndoAlt,
    title: '30-Day Easy Returns',
    description: 'If you are not 100% satisfied, exchange or return with no questions asked.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100 hover:border-rose-300',
    textColor: 'text-rose-600',
  },
  {
    icon: FaHeadset,
    title: '24/7 Human Concierge',
    description: 'Our friendly customer service specialists are always available to help you instantly.',
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100 hover:border-cyan-300',
    textColor: 'text-cyan-600',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-14 sm:py-20 bg-white border-t border-slate-100">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3.5 py-1 text-xs font-bold text-sky-700 shadow-2xs">
            <FaAward className="text-sky-600 text-xs" />
            <span>The SuperShop Difference</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Why Thousands of Families{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-indigo-600">
              Trust SuperShop
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We hold ourselves to the highest standards of purity, rapid logistics, and customer happiness.
          </p>
        </div>

        {/* Features 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`group p-6 sm:p-7 rounded-3xl bg-slate-50/60 border ${item.border} hover:bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 space-y-4`}
              >
                <div
                  className={`w-13 h-13 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <Icon className="text-xl" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default WhyChooseUs;

