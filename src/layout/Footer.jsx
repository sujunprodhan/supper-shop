'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Container from './Container';
import {
  FaShoppingCart,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaUndoAlt,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaMoneyBillWave,
  FaChevronRight,
  FaArrowUp,
  FaLock,
} from 'react-icons/fa';
import { toast } from 'sonner';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      toast.success('Thank you for subscribing to SuperShop offers!');
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden border-t border-slate-800">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ================= 1. TRUST & VALUE HIGHLIGHTS BAR ================= */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm relative z-10">
        <Container>
          <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-800/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <FaTruck className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  Express Delivery
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Free delivery for orders above $50</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-800/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <FaShieldAlt className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  100% Secure Checkout
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">256-bit bank-grade SSL encryption</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-800/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <FaUndoAlt className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  30 Days Easy Return
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Hassle-free exchange & refund</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-800/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <FaHeadset className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  24/7 Dedicated Support
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Friendly real-time assistance</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ================= 2. MAIN FOOTER CONTENT ================= */}
      <div className="py-14 sm:py-16 relative z-10">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Column 1: Brand Info & Contact (4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-all duration-300">
                  <FaShoppingCart className="text-base" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Super<span className="text-sky-400">Shop</span>
                </span>
              </Link>

              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Your trusted modern supermarket for fresh organic groceries, daily essentials, and
                exclusive lifestyle products delivered rapidly straight to your doorstep.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-400">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-sky-400 mt-0.5 shrink-0" />
                  <span>Level 4, Gulshan-2, Dhaka 1212, Bangladesh</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-emerald-400 shrink-0" />
                  <span>+880 1800-SUPERSHOP (+880 1800 787377)</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-indigo-400 shrink-0" />
                  <span>support@supershop.com</span>
                </div>
              </div>

              {/* Social Handles */}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Follow Our Socials
                </p>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-600 hover:border-sky-500 transition-all duration-200"
                    aria-label="Facebook"
                  >
                    <FaFacebookF className="text-sm" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-500 hover:border-sky-400 transition-all duration-200"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="text-sm" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-600 hover:border-pink-500 transition-all duration-200"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="text-sm" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-700 hover:border-sky-600 transition-all duration-200"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedinIn className="text-sm" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all duration-200"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="text-sm" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-sky-500 rounded-full inline-block" />
                Quick Links
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link
                    href="/"
                    className="hover:text-sky-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-sky-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    <span>All Products</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-sky-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-sky-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Contact & Support</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-sky-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Special Offers</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Care (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full inline-block" />
                Customer Care
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    <span>My Account</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Order Tracking</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Shopping Cart</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favorites"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Wishlist Items</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="text-[9px] text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    <span>Help & FAQs</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter & Exclusive Offers (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                Stay in the Loop
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscribe to our newsletter to receive weekly secret discounts, fresh arrivals, and
                a <span className="text-sky-400 font-semibold">$10 off coupon</span> on your first order.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all pr-12"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="absolute right-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    aria-label="Subscribe"
                  >
                    <FaPaperPlane className="text-xs" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <FaLock className="text-[10px] text-sky-400" />
                  <span>Your email is safe with us. No spam, ever.</span>
                </div>
              </form>

              {/* Verified badge */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">SSL Secured Experience</div>
                  <div className="text-[11px] text-slate-400">Guaranteed safe transaction processing</div>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ================= 3. BOTTOM BAR & PAYMENT METHODS ================= */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 py-6 relative z-10">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-xs text-slate-400 text-center md:text-left">
              © {new Date().getFullYear()}{' '}
              <span className="text-white font-semibold">SuperShop</span>. All rights reserved.
              Designed with care for seamless everyday shopping.
            </div>

            {/* Accepted Payments */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">
                We Accept:
              </span>
              
              {/* bKash badge */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#DF146E]/15 border border-[#DF146E]/30 text-[#DF146E] text-[10px] font-black tracking-wider">
                bKash
              </span>

              {/* Nagad badge */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F7941D]/15 border border-[#F7941D]/30 text-[#F7941D] text-[10px] font-black tracking-wider">
                Nagad
              </span>

              {/* Rocket badge */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#8C3494]/15 border border-[#8C3494]/30 text-[#8C3494] text-[10px] font-black tracking-wider">
                Rocket
              </span>

              {/* Visa */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-400 text-xs font-semibold">
                <FaCcVisa className="text-sm" />
                <span className="text-[10px]">VISA</span>
              </span>

              {/* Mastercard */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-500 text-xs font-semibold">
                <FaCcMastercard className="text-sm" />
                <span className="text-[10px]">Mastercard</span>
              </span>

              {/* Amex */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-blue-400 text-xs font-semibold">
                <FaCcAmex className="text-sm" />
                <span className="text-[10px]">AMEX</span>
              </span>

              {/* Cash on Delivery */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                <FaMoneyBillWave className="text-xs" />
                <span>Cash On Delivery</span>
              </span>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              title="Back to top"
              aria-label="Scroll back to top"
            >
              <FaArrowUp className="text-[10px]" />
              <span className="text-[11px] font-medium">Top</span>
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
