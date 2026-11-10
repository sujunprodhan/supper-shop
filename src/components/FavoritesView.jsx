'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaHeart,
  FaShoppingCart,
  FaTrashAlt,
  FaArrowLeft,
  FaStar,
  FaEye,
  FaSpinner,
} from 'react-icons/fa';
import { removeWishlistItem } from '@/actions/server/wishlist';
import { handleCart } from '@/actions/server/cart';
import { useCart } from '@/provider/CartProvider';
import { toast } from 'sonner';

const FavoritesView = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const { refreshWishlistCount, refreshCartCount } = useCart();

  // Remove from favorites
  const handleRemove = async (item) => {
    const id = item._id;
    const productId = item.productId;
    setLoadingId(id);
    try {
      const res = await removeWishlistItem({ id, productId });
      if (res?.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        refreshWishlistCount();
        toast.success(res.message || 'Removed from favorites.');
      } else {
        toast.error(res?.message || 'Failed to remove from favorites.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  // Move to Cart
  const handleAddToCart = async (item) => {
    const id = item._id;
    setAddingCartId(id);
    try {
      const productData = {
        _id: item.productId,
        title: item.title,
        price: item.price,
        image: item.image,
        unit: item.unit,
        discount: item.discount,
      };

      const res = await handleCart({ product: productData, inc: true });
      if (res?.success) {
        toast.success('Added to cart successfully!');
        refreshCartCount();
      } else {
        toast.error(res?.message || 'Failed to add to cart.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setAddingCartId(null);
    }
  };

  // Empty State
  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-24 h-24 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6 shadow-sm">
          <FaHeart className="text-4xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
          Your Favorites List is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-8">
          Save your most-loved products here by clicking the heart icon on any product.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <FaArrowLeft className="text-xs" />
          <span>Discover Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Favorites
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-rose-600">{items.length}</span> saved{' '}
            {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors self-start sm:self-auto"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/*Wishlist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const isItemLoading = loadingId === item._id;
          const isAddingCart = addingCartId === item._id;
          const price = Number(item.price) || 0;
          const originalPrice = Number(item.originalPrice) || price;

          return (
            <div
              key={item._id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-rose-200 ${
                isItemLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || 'Product'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    No Image
                  </div>
                )}

                {item.discount > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      -{item.discount}%
                    </span>
                  </div>
                )}

                {/* Remove button  */}
                <button
                  onClick={() => handleRemove(item)}
                  disabled={isItemLoading}
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white shadow-xs border border-slate-100 transition-colors cursor-pointer"
                  title="Remove from favorites"
                >
                  {isItemLoading ? (
                    <FaSpinner className="animate-spin text-xs text-rose-500" />
                  ) : (
                    <FaTrashAlt className="text-xs" />
                  )}
                </button>
              </div>
              <div className="flex flex-col grow p-4 justify-between space-y-3">
                <div className="space-y-1.5">
                  {item.category && (
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-bold text-slate-900 text-sm hover:text-sky-600 transition-colors line-clamp-1 block"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-slate-900">${price.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-sky-600 transition-colors"
                  >
                    <FaEye className="text-xs" />
                    <span>View</span>
                  </Link>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isAddingCart}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2 text-xs font-semibold text-white shadow-xs shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {isAddingCart ? (
                      <FaSpinner className="animate-spin text-xs" />
                    ) : (
                      <FaShoppingCart className="text-xs" />
                    )}
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesView;

