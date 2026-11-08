import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaShoppingCart, FaEye } from 'react-icons/fa';
import CartButton from '@/buttons/CartButton';


const ProductCard = ({ item, product }) => {
  const currentProduct = item || product;
  if (!currentProduct) return null;

  const {
    _id,
    title,
    category,
    price = 0,
    discount = 0,
    stock = 0,
    unit,
    image,
    description,
    featured,
    rating = 4.5,
  } = currentProduct;

  const finalPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={title || 'Product Image'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            No Image
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
              -{discount}%
            </span>
          )}
          {featured && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold text-slate-800 shadow-xs border border-slate-100">
          <FaStar className="text-amber-400 text-xs" />
          <span>{rating}</span>
        </div>
      </div>
      <div className="flex flex-col grow p-4 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-sky-600 uppercase tracking-wider text-[11px]">
              {category || 'General'}
            </span>
            {unit && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {unit}
              </span>
            )}
          </div>
          <Link href={`/products/${_id}`} className="block">
            <h3
              className="font-bold text-slate-800 text-base line-clamp-1 transition-colors hover:text-sky-600"
              title={title}
            >
              {title}
            </h3>
          </Link>
          {description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-slate-900">${finalPrice}</span>
                {discount > 0 && (
                  <span className="text-xs text-slate-400 line-through">${price}</span>
                )}
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">
                {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/products/${_id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-sky-600 transition-colors"
            >
              <FaEye className="text-xs" />
              <span>Details</span>
            </Link>

            <CartButton product={currentProduct} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
