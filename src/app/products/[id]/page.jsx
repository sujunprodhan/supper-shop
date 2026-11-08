import React from 'react';
import { getSingleProduct } from '@/actions/server/product';
import Container from '@/layout/Container';
import Image from 'next/image';
import Link from 'next/link';
import ProductActions from '@/components/ProductActions';
import {
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheckCircle,
  FaArrowLeft,
  FaTag,
} from 'react-icons/fa';

const ProductDetails = async ({ params }) => {
  const { id } = await params;
  const product = await getSingleProduct(id);
  if (!product || !product._id) {
    return (
      <Container>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Products</span>
          </Link>
        </div>
      </Container>
    );
  }

  const {
    title,
    category,
    brand,
    price = 0,
    discount = 0,
    stock = 0,
    unit,
    image,
    description,
    featured,
    rating = 4.5,
  } = product;

  const finalPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;
  const savings = price - finalPrice;

  return (
    <div className="bg-slate-50/50 py-8 md:py-12">
      <Container>
        <nav className="mb-6 flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-sky-600 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-400 capitalize">{category}</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-50 md:max-w-none">
            {title}
          </span>
        </nav>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-100 border border-slate-200/60 shadow-inner group">
                {image ? (
                  <Image
                    src={image}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    No Image Available
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                      <FaTag className="text-[10px]" />
                      <span>{discount}% OFF</span>
                    </span>
                  )}
                  {featured && (
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <FaCheckCircle className="text-emerald-500 text-base mb-1" />
                  <span className="text-[11px] font-bold text-slate-700">100% Genuine</span>
                  <span className="text-[9px] text-slate-400">Verified Quality</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <FaUndo className="text-sky-500 text-base mb-1" />
                  <span className="text-[11px] font-bold text-slate-700">7 Days Return</span>
                  <span className="text-[9px] text-slate-400">Easy Policy</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <FaShieldAlt className="text-indigo-500 text-base mb-1" />
                  <span className="text-[11px] font-bold text-slate-700">Warranty</span>
                  <span className="text-[9px] text-slate-400">Buyer Protection</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  {brand && (
                    <span className="rounded-lg bg-sky-100/70 px-2.5 py-1 text-xs font-bold text-sky-700">
                      {brand}
                    </span>
                  )}
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 uppercase tracking-wider">
                    {category}
                  </span>
                  {unit && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Unit: {unit}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700 font-bold border border-amber-200/50">
                    <FaStar className="text-amber-500 text-xs" />
                    <span>{rating}</span>
                    <span className="text-xs font-normal text-amber-600/80">(120+ ratings)</span>
                  </div>

                  <span className="h-4 w-px bg-slate-200"></span>

                  <div>
                    {stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        In Stock ({stock} units available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-sky-600">${finalPrice}</span>

                {discount > 0 && (
                  <>
                    <span className="text-base text-slate-400 line-through">${price}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      Save ${savings} ({discount}%)
                    </span>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {description ||
                    'Premium quality product selected for superior freshness and satisfaction. Guaranteed authentic with express delivery to your doorstep.'}
                </p>
              </div>
              <ProductActions product={product} />
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <FaTruck className="text-sky-600 text-sm shrink-0" />
                  <span>
                    <strong>Fast Delivery:</strong> Receive your order in 30-45 minutes.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaShieldAlt className="text-sky-600 text-sm shrink-0" />
                  <span>
                    <strong>Secure Checkout:</strong> SSL encrypted safe payment channels.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetails;
