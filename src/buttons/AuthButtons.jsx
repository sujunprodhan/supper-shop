'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const AuthButtons = () => {
  const session = useSession();

  return (
    <div className="flex items-center gap-2 w-full">
      {session.status == 'authenticated' ? (
        <button
          onClick={() => signOut()}
          className="flex-1 text-center py-2 px-4 text-sm font-semibold text-slate-700 hover:text-sky-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          Logout
        </button>
      ) : (
        <>
          <Link
            href={'/login'}
            className="flex-1 text-center py-2 px-4 text-sm font-semibold text-slate-700 hover:text-sky-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Login
          </Link>
          <Link
            href={'/register'}
            className="flex-1 text-center py-2 px-4 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-600/25 transition-colors whitespace-nowrap"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthButtons;
