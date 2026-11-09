'use client';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaSpinner } from 'react-icons/fa';

const SocialButton = () => {
  const params = useSearchParams();
  const { status } = useSession();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await signIn('google', {
        callbackUrl: params.get('callbackUrl') || '/',
      });
    } catch (error) {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGoogleLogin}
        disabled={status === 'loading' || googleLoading}
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <FaSpinner className="text-base text-slate-600 animate-spin" />
        ) : (
          <FcGoogle className="text-xl" />
        )}
        <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>
    </div>
  );
};

export default SocialButton;
