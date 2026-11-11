'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaLock,
  FaShieldAlt,
  FaTruck,
  FaCreditCard,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaRegClock,
  FaInfoCircle,
  FaSpinner,
} from 'react-icons/fa';
import { createOrder } from '@/actions/server/order';
import { useCart } from '@/provider/CartProvider';
import { toast } from 'sonner';

const CheckoutView = ({ initialCart = [] }) => {
  const router = useRouter();
  const session = useSession();
  const { refreshCartCount } = useCart();

  const user = session?.data?.user;
  const items = initialCart;

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    street: '',
    apartment: '',
    city: 'Dhaka',
    postalCode: '',
    orderNotes: '',
  });

  // Sync user details if session loads later
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        firstName: prev.firstName || (user.name ? user.name.split(' ')[0] : ''),
        lastName: prev.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
      }));
    }
  }, [user]);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [mobileBankingProvider, setMobileBankingProvider] = useState('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct Card Input State
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  });

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: value }));
  };

  const handleCardCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardData((prev) => ({ ...prev, cvc: value }));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const shippingCost =
    shippingMethod === 'express' ? 15 : shippingMethod === 'sameday' ? 25 : subtotal > 50 ? 0 : 10;

  const estimatedTax = Math.round(subtotal * 0.05); // 5% standard VAT/Tax
  const grandTotal = subtotal + shippingCost + estimatedTax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Place Order Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      toast.error('Your cart is empty! Please add products before placing an order.');
      router.push('/products');
      return;
    }

    if (!formData.email || !formData.firstName || !formData.street || !formData.phone) {
      toast.error('Please fill in your name, email, phone, and delivery address.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardData.number || !cardData.expiry || !cardData.cvc) {
        toast.error('Please enter your card number, expiration date, and CVC.');
        return;
      }
      if (cardData.number.replace(/\s+/g, '').length < 15) {
        toast.error('Please enter a valid 15 or 16-digit card number.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        items,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        deliveryMethod: shippingMethod,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? cardData : null,
        mobileProvider: paymentMethod === 'mobile' ? mobileBankingProvider : null,
        orderNotes: formData.orderNotes,
        subtotal,
        shippingCost,
        tax: estimatedTax,
        grandTotal,
      };

      const res = await createOrder(orderPayload);

      if (res?.success && res?.redirectUrl) {
        refreshCartCount();
        if (paymentMethod === 'card') {
          toast.success('Payment authorized and order confirmed!');
        } else if (paymentMethod === 'mobile') {
          toast.success('Redirecting to SSLCommerz (bKash/Nagad/Rocket)...');
        } else {
          toast.success('Order placed successfully!');
        }

        // Redirect to Stripe checkout, SSLCommerz gateway, or internal order-success
        window.location.href = res.redirectUrl;
      } else {
        toast.error(res?.message || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Order Submission Error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12">
      {/* Step Progress Bar */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto text-xs sm:text-sm font-semibold">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              <FaCheckCircle className="text-xs" />
            </span>
            <span>Cart</span>
          </Link>

          <FaChevronRight className="text-slate-300 text-xs" />

          <div className="flex items-center gap-2 text-sky-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold shadow-xs">
              2
            </span>
            <span className="font-bold">Checkout</span>
          </div>

          <FaChevronRight className="text-slate-300 text-xs" />

          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs font-bold">
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        {/* Main Grid: Checkout Form (Left) + Order Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Checkout Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Customer Contact Information */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <FaUser className="text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
                    <p className="text-xs text-slate-400">Where we should send your order invoice & tracking</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400">
                      <FaEnvelope className="text-xs" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400">
                      <FaPhone className="text-xs" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Shipping & Delivery Address */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
                    <p className="text-xs text-slate-400">Enter where you want your products delivered</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">Step 2 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="House 12, Road 5, Block B"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Apartment, Suite, Unit <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Flat 4B, 3rd Floor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">City / District *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Dhaka"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="1212"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Delivery Method Options */}
              <div className="pt-3 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Choose Delivery Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      shippingMethod === 'standard'
                        ? 'border-sky-600 bg-sky-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FaTruck className="text-sky-600 text-base" />
                      <span className="text-xs font-bold text-slate-900">
                        {subtotal > 50 ? 'FREE' : '$10.00'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Standard Delivery</h4>
                      <p className="text-[11px] text-slate-400">3 - 5 Business Days</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setShippingMethod('express')}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      shippingMethod === 'express'
                        ? 'border-sky-600 bg-sky-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FaRegClock className="text-amber-500 text-base" />
                      <span className="text-xs font-bold text-slate-900">$15.00</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Express Courier</h4>
                      <p className="text-[11px] text-slate-400">1 - 2 Business Days</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setShippingMethod('sameday')}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      shippingMethod === 'sameday'
                        ? 'border-sky-600 bg-sky-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FaShieldAlt className="text-emerald-500 text-base" />
                      <span className="text-xs font-bold text-slate-900">$25.00</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Same-Day Priority</h4>
                      <p className="text-[11px] text-slate-400">Today by 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method Selection */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <FaCreditCard className="text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Payment Gateway</h2>
                    <p className="text-xs text-slate-400">Choose your preferred payment method</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">Step 3 of 3</span>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stripe Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-sky-600 bg-sky-50/40 text-sky-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <FaCreditCard className="text-lg text-sky-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Credit/Debit Card</span>
                    <span className="text-[10px] text-slate-400">Stripe (Visa/Mastercard)</span>
                  </div>
                </div>

                {/* Mobile Banking (SSLCommerz) */}
                <div
                  onClick={() => setPaymentMethod('mobile')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'mobile'
                      ? 'border-sky-600 bg-sky-50/40 text-sky-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <FaMobileAlt className="text-lg text-pink-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Mobile Banking</span>
                    <span className="text-[10px] text-slate-400">bKash, Nagad, Rocket</span>
                  </div>
                </div>

                {/* Cash On Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-sky-600 bg-sky-50/40 text-sky-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <FaMoneyBillWave className="text-lg text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-400">Pay upon receipt</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Details: Direct Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="pt-3 space-y-4 rounded-2xl bg-slate-50/80 p-5 border border-slate-200/80">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-800">
                      Enter Credit / Debit Card Details
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <FaLock className="text-[10px] text-emerald-600" />
                      <span className="text-[11px] font-semibold text-emerald-700">256-bit Encrypted</span>
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name as printed on card"
                      value={cardData.name}
                      onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Card Number *</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">
                        <FaCreditCard className="text-sm" />
                      </span>
                      <input
                        type="text"
                        placeholder="4242  4242  4242  4242"
                        maxLength={19}
                        value={cardData.number}
                        onChange={handleCardNumberChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none transition-colors font-mono tracking-wider"
                      />
                      <span className="absolute right-3.5 text-[10px] font-bold text-slate-400 uppercase">
                        VISA / MC
                      </span>
                    </div>
                  </div>

                  {/* Expiration Date & CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Expiry Date (MM/YY) *</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={handleCardExpiryChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none transition-colors font-mono tracking-widest text-center"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>CVC / CVV *</span>
                        <span className="text-[10px] text-slate-400 font-normal">3 digits on back</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardData.cvc}
                          onChange={handleCardCvcChange}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none transition-colors font-mono tracking-widest text-center"
                        />
                        <span className="absolute right-3 text-slate-400">
                          <FaLock className="text-xs" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <FaShieldAlt className="text-sky-600 text-xs shrink-0" />
                    <span>Your card details are securely tokenized and protected via Stripe 256-bit encryption.</span>
                  </p>
                </div>
              )}

              {paymentMethod === 'mobile' && (
                <div className="pt-2 space-y-3 rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Supported Mobile Wallets via SSLCommerz:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['bkash', 'nagad', 'rocket', 'upay'].map((wallet) => (
                      <span
                        key={wallet}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 uppercase shadow-2xs"
                      >
                        {wallet}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    Clicking <strong>Place Order</strong> will open the official SSLCommerz payment portal
                    where you can easily enter your mobile wallet number and OTP securely.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-3">
                  <FaInfoCircle className="text-emerald-600 text-sm mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    You can pay with cash or card directly to the delivery rider when your package arrives
                    at your doorstep. No advance payment required.
                  </p>
                </div>
              )}

              {/* Additional Order Notes */}
              <div className="pt-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Order Notes / Special Delivery Instructions{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="Notes about your order, e.g. special delivery instructions or landmark..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Summary</h2>
                <span className="text-xs font-bold bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const totalItemPrice = itemPrice * itemQty;

                  return (
                    <div key={item._id} className="flex items-center gap-3 py-1">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title || 'Product'}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                            Item
                          </div>
                        )}
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                          {itemQty}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Qty: {itemQty} × ${itemPrice.toFixed(2)}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-slate-900 shrink-0">
                        ${totalItemPrice.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Shipping ({shippingMethod.toUpperCase()})
                    {shippingCost === 0 && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Estimated VAT / Tax (5%)</span>
                  <span className="font-semibold text-slate-800">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900">Total Amount</span>
                    <p className="text-[10px] text-slate-400">Includes delivery and all taxes</p>
                  </div>
                  <span className="text-2xl font-black text-sky-600">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full rounded-2xl bg-sky-600 py-4 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <FaLock className="text-xs" />
                    <span>
                      {paymentMethod === 'cod'
                        ? `Confirm Order • $${grandTotal.toFixed(2)}`
                        : `Pay Now • $${grandTotal.toFixed(2)}`}
                    </span>
                  </>
                )}
              </button>

              {/* Back to Cart link */}
              <div className="text-center pt-1">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Return to Shopping Cart</span>
                </Link>
              </div>

              {/* Trust and Guarantee badges */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2.5">
                  <FaShieldAlt className="text-emerald-500 text-sm shrink-0" />
                  <span>Bank-grade 256-bit SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaTruck className="text-sky-500 text-sm shrink-0" />
                  <span>Track your parcel status live from dispatch to delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutView;
