'use client';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

const SocialButton = () => {
  const params = useSearchParams();

  const handleGoogleLogin = () => {
    signIn('google', {
      callbackUrl: params.get('callbackUrl') || '/',
    });
  };

  return (
    <div>
      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer"
      >
        <FcGoogle className="text-xl" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default SocialButton;
