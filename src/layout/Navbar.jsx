import React from 'react';
import Container from './Container';
import NavLink from '@/buttons/NavLink';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';
import AuthButtons from '@/buttons/AuthButtons';
import NavActionButtons, { MobileNavActionButtons } from '@/buttons/NavActionButtons';

const Navbar = () => {
  const nav = (
    <>
      <li>
        <NavLink href={'/'}>Home</NavLink>
      </li>
      <li>
        <NavLink href={'/about'}>About</NavLink>
      </li>
      <li>
        <NavLink href={'/products'}>Product</NavLink>
      </li>
      <li>
        <NavLink href={'/contact'}>Contact</NavLink>
      </li>
    </>
  );

  return (
    <div className="w-full">
      <Container>
        <div className="navbar min-h-17.5 px-0 flex justify-between items-center">
          {/* Left: Brand Logo */}
          <div className="navbar-start w-auto">
            <Link href={'/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-all duration-300">
                <FaShoppingCart className="text-base" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-800">
                Super<span className="text-sky-600">Shop</span>
              </span>
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="flex items-center gap-1 list-none p-0 m-0">{nav}</ul>
          </div>
          <div className="navbar-end w-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-3">
              <NavActionButtons />

              <div className="h-5 w-px bg-slate-200"></div>

              {/* Login & Register */}
              <AuthButtons></AuthButtons>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="dropdown dropdown-end lg:hidden">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle text-slate-700 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>

              <div
                tabIndex={0}
                className="dropdown-content bg-white/95 backdrop-blur-md rounded-2xl z-50 mt-3 w-64 p-4 shadow-xl border border-slate-100 space-y-3"
              >
                <ul className="space-y-1 list-none p-0 m-0">{nav}</ul>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <MobileNavActionButtons />
                  <div className="pt-1">
                    <AuthButtons />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
