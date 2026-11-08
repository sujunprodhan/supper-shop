import React from 'react';
import Container from './Container';
import NavLink from '@/buttons/NavLink';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  const nav = (
    <>
      <li><NavLink href={'/'}>Home</NavLink></li>
      <li><NavLink href={'/about'}>About</NavLink></li>
      <li><NavLink href={'/product'}>Product</NavLink></li>
      <li><NavLink href={'/contact'}>Contact</NavLink></li>
    </>
  );

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
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
            <ul className="flex items-center gap-1 list-none p-0 m-0">
              {nav}
            </ul>
          </div>
          <div className="navbar-end w-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-3">
              {/* Cart Button */}
              <Link
                href={'/cart'}
                className="btn btn-ghost btn-circle relative text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                aria-label="Shopping Cart"
              >
                <FaShoppingCart className="text-lg" />
                <span className="badge badge-xs bg-sky-600 text-white border-0 absolute top-1.5 right-1.5 font-bold w-4 h-4 p-0 flex items-center justify-center rounded-full shadow-xs">
                  0
                </span>
              </Link>

              <div className="h-5 w-px bg-slate-200"></div>

              {/* Login & Register */}
              <Link
                href={'/login'}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100/70 rounded-lg transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href={'/register'}
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-600/25 hover:shadow-md hover:shadow-sky-600/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                Register
              </Link>
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
                <ul className="space-y-1 list-none p-0 m-0">
                  {nav}
                </ul>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <Link
                    href={'/cart'}
                    className="flex items-center justify-between px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <FaShoppingCart className="text-sky-600" /> Cart
                    </span>
                    <span className="badge badge-sm bg-sky-600 text-white font-bold">0</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={'/login'}
                      className="text-center py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href={'/register'}
                      className="text-center py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                    >
                      Register
                    </Link>
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
