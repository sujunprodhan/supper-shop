'use client';

import React, { useState } from 'react';
import { FaHeart, FaSpinner } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { toggleWishlist } from '@/actions/server/wishlist';
import { useCart } from '@/provider/CartProvider';
import { toast } from 'sonner';

const WishlistButton = ({ product, initialWishlisted = false, className = '' }) => {
  const { status } = useSession();
  const isLogin = status === 'authenticated';
  const { refreshWishlistCount } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const path = usePathname();

  const handleToggle = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!isLogin) {
      toast.info('Please log in to add items to your favorites.');
      const targetUrl = product?._id ? `/products/${product._id}` : path;
      router.push(`/login?callbackUrl=${targetUrl}`);
      return;
    }

    try {
      setLoading(true);
      const res = await toggleWishlist({ product });
      if (res?.success) {
        setIsWishlisted(res.isWishlisted);
        refreshWishlistCount();
        if (res.isWishlisted) {
          toast.success(res.message || 'Added to favorites!');
        } else {
          toast.info(res.message || 'Removed from favorites');
        }
      } else {
        toast.error(res?.message || 'Failed to update favorites.');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={status === 'loading' || loading}
      className={
        className ||
        `btn btn-circle btn-ghost border border-slate-200 transition-all ${
          isWishlisted
            ? 'text-rose-500 bg-rose-50 border-rose-200 hover:bg-rose-100'
            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
        }`
      }
      aria-label="Wishlist"
      title={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <FaSpinner className="text-sm animate-spin text-rose-500" />
      ) : (
        <FaHeart
          className={`text-base transition-transform active:scale-125 ${
            isWishlisted ? 'fill-rose-500 text-rose-500' : ''
          }`}
        />
      )}
    </button>
  );
};

export default WishlistButton;

