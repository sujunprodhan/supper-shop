'use client';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const AuthButtons = () => {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <div className="flex items-center gap-2.5">
      {session.status == 'authenticated' ? (
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 shadow-xs"
            aria-label="User Menu"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User Profile'}
                height={9}
                width={9}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-500/30 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <FaChevronDown className="text-xs text-slate-500 mr-1.5 transition-transform" />
          </div>

          {/* Dropdown Content with Logout Button */}
          <ul
            tabIndex={0}
            className="dropdown-content menu z-50 mt-2 p-2 shadow-xl bg-white/95 backdrop-blur-md rounded-2xl w-56 border border-slate-100 space-y-1"
          >
            <li className="px-3 py-2 border-b border-slate-100 mb-1">
              <span className="font-bold text-slate-800 text-xs truncate block p-0">
                {user?.name || 'User Account'}
              </span>
              <span className="text-[11px] text-slate-400 font-normal truncate block p-0">
                {user?.email}
              </span>
            </li>
            <li>
              <button
                onClick={async () => {
                  toast.success('Logged out successfully!');
                  await signOut();
                }}
                className="w-full flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <FaSignOutAlt className="text-sm" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
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
