'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLink = ({ children, href, className = '' }) => {
  const path = usePathname();
  const isActive = href && (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <Link
      href={href || ''}
      className={`block px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'text-sky-600 bg-sky-50 shadow-xs'
          : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100/70'
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
