'use client';
import { handleCart } from '@/actions/server/cart';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaShoppingCart, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';

const CartButton = ({ product }) => {
  const { status } = useSession();
  const isLogin = status === 'authenticated';
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const path = usePathname();

  const addToCart = async () => {
    setIsLoading(true);
    if (isLogin) {
      try {
        const result = await handleCart({ product, inc: true });
        if (result?.success) {
          toast.success('Product added to cart successfully!');
        } else {
          toast.error(result?.message || 'Failed to add product to cart.');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.info('Please log in to add items to your cart.');
      const targetUrl = product?._id ? `/products/${product._id}` : path;
      router.push(`/login?callbackUrl=${targetUrl}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <button
        disabled={status === 'loading' || isLoading}
        onClick={addToCart}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2 text-xs font-semibold text-white shadow-xs shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <FaSpinner className="text-xs animate-spin" />
        ) : (
          <FaShoppingCart className="text-xs" />
        )}
        <span>{isLoading ? 'Adding...' : 'Add To Cart'}</span>
      </button>
    </div>
  );
};

export default CartButton;
