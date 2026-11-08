'use client';

import React, { useState } from 'react';
import Container from '@/layout/Container';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaShoppingCart,
} from 'react-icons/fa';
import { registerUser } from '@/actions/server/auth';
import { useRouter } from 'next/navigation';

const RegisterFrom = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    setServerSuccess('');
    setLoading(true);
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (res?.success) {
        setServerSuccess(res.message || 'Account created successfully!');
        router.push('/login');
      } else {
        setServerError(res?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setServerError('A network error occurred! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50/60 py-10 sm:py-16">
      <Container>
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/50">
          <div className="text-center space-y-2 mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group mb-1">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <FaShoppingCart className="text-base" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-800">
                Super<span className="text-sky-600">Shop</span>
              </span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create an Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign up today to explore thousands of fresh products
            </p>
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            <FcGoogle className="text-xl" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200"></div>
            <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or register with email
            </span>
          </div>
          {serverError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {serverError}
            </div>
          )}
          {serverSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
              {serverSuccess}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <FaUser className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <FaEnvelope className="text-sm" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <FaPhone className="text-sm" />
                </span>
                <input
                  type="tel"
                  placeholder="018XXXXXXXX"
                  {...register('phone')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <FaLock className="text-sm" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-sm" />
                  ) : (
                    <FaEye className="text-sm" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                {...register('terms')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                I agree to the{' '}
                <Link href="#" className="font-semibold text-sky-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="font-semibold text-sky-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-sky-600 hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default RegisterFrom;
