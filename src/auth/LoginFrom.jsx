'use client';

import React, { useState } from 'react';
import Container from '@/layout/Container';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShoppingCart } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SocialButton from '@/buttons/SocialButton';

const LoginFrom = () => {
  const router = useRouter();
  const params = useSearchParams();
  const callBack = params.get('callbackUrl') || '';
  const [serverSuccess, setServerSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerSuccess('');
    setServerError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: params.get('callbackUrl') || '',
      });

      if (res?.ok) {
        setServerSuccess('Login successful!');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="bg-slate-50/60 py-10 sm:py-16">
      <Container>
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/50">
          {/* Brand Header */}
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
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Google Sign In Button */}
          <SocialButton></SocialButton>
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200"></div>
            <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or sign in with email
            </span>
          </div>

          {/* Server Feedback Alert */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link href="#" className="text-xs font-semibold text-sky-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <FaLock className="text-sm" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
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
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                {...register('remember')}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href={callBack ? `/register?callbackUrl=${callBack}` : '/register'}
              className="font-bold text-sky-600 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LoginFrom;
