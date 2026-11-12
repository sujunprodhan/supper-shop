'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Container from '@/layout/Container';
import ProductCard from '@/carddesign/ProductCard';
import {
  FaFilter,
  FaSearch,
  FaTimes,
  FaBoxes,
  FaPumpSoap,
  FaHeart,
  FaMagic,
  FaBath,
  FaLeaf,
  FaCheck,
  FaUndo,
} from 'react-icons/fa';

// Category icon map
const categoryIcons = {
  Skincare: FaPumpSoap,
  'Body Care': FaHeart,
  'Hair Care': FaMagic,
  'Spa Essentials': FaBath,
  Aromatherapy: FaLeaf,
};

const ProductCatalogView = ({ initialProducts = [] }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL category param (defaults to 'All' when not provided in URL)
  const urlCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(null); // null means no price limit by default
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync with URL when search params change
  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  // Compute live categories, counts, and realistic min/max price bounds
  const { categories, categoryCounts, minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    const counts = {};
    let highestPrice = 0;
    let lowestPrice = Infinity;

    initialProducts.forEach((p) => {
      const cat = p.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
      const price = Number(p.price) || 0;
      if (price > highestPrice) highestPrice = price;
      if (price < lowestPrice) lowestPrice = price;
    });

    const uniqueCats = ['All', ...Object.keys(counts)];
    return {
      categories: uniqueCats,
      categoryCounts: counts,
      minPossiblePrice: lowestPrice === Infinity ? 0 : Math.floor(lowestPrice / 50) * 50,
      maxPossiblePrice: highestPrice > 0 ? Math.ceil(highestPrice / 100) * 100 : 3000,
    };
  }, [initialProducts]);

  const activePriceCap = priceRange !== null ? priceRange : maxPossiblePrice;
  const isPriceFilterActive = priceRange !== null && priceRange < maxPossiblePrice;

  // Handle Category Select
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const newQuery = params.toString();
    router.push(`${pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    setMobileFilterOpen(false);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
    setPriceRange(null);
    router.push(pathname, { scroll: false });
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Category Filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }
        // Stock Filter
        if (inStockOnly && Number(p.stock || 0) <= 0) {
          return false;
        }
        // Price Filter (only when specifically restricted)
        if (isPriceFilterActive) {
          const finalPrice =
            p.discount > 0
              ? Math.round(Number(p.price) - (Number(p.price) * Number(p.discount)) / 100)
              : Number(p.price);
          if (finalPrice > priceRange) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const priceA =
          a.discount > 0
            ? Math.round(Number(a.price) - (Number(a.price) * Number(a.discount)) / 100)
            : Number(a.price);
        const priceB =
          b.discount > 0
            ? Math.round(Number(b.price) - (Number(b.price) * Number(b.discount)) / 100)
            : Number(b.price);

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === 'discount') return (Number(b.discount) || 0) - (Number(a.discount) || 0);
        return 0; // 'featured' (original db order)
      });
  }, [initialProducts, selectedCategory, searchQuery, inStockOnly, isPriceFilterActive, priceRange, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '' ||
    inStockOnly ||
    sortBy !== 'featured' ||
    isPriceFilterActive;

  return (
    <div className="py-8 sm:py-12 bg-slate-50/40 min-h-screen">
      <Container>
        {/* ================= MOBILE HORIZONTAL CATEGORY PILL BAR ================= */}
        <div className="lg:hidden mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FaFilter className="text-sky-600 text-xs" />
              Categories
            </span>
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50"
            >
              <FaFilter className="text-sky-600 text-[10px]" />
              <span>{mobileFilterOpen ? 'Close Filters' : 'More Filters'}</span>
            </button>
          </div>

          {/* Horizontal category scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'All' ? initialProducts.length : categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT SIDEBAR (Desktop) ================= */}
          <aside
            className={`lg:col-span-3 space-y-6 lg:sticky lg:top-24 transition-all ${
              mobileFilterOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* 1. Category Filter Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600">
                    <FaBoxes className="text-xs" />
                  </div>
                  <span>Categories</span>
                </h3>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => handleSelectCategory('All')}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Buttons List */}
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'All' ? initialProducts.length : categoryCounts[cat] || 0;
                  const Icon = categoryIcons[cat] || FaBoxes;

                  return (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 translate-x-1'
                          : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700 hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`text-xs ${
                            isSelected ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'
                          }`}
                        />
                        <span>{cat}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700'
                          }`}
                        >
                          {count}
                        </span>
                        {isSelected && <FaCheck className="text-[10px] text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Additional Filters Card (Price, Stock) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <FaFilter className="text-xs" />
                  </div>
                  <span>Filter by Price</span>
                </h3>
                <span className="text-xs font-bold text-sky-600">
                  {isPriceFilterActive ? `Under $${priceRange}` : 'All Prices'}
                </span>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step="50"
                  value={activePriceCap}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="range range-xs range-info w-full cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Min: ${minPossiblePrice}</span>
                  <span>Max: ${maxPossiblePrice}</span>
                </div>
              </div>

              {/* In-Stock Only Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">In-Stock Only</span>
                  <span className="text-[10px] text-slate-400 block">Hide out of stock items</span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="toggle toggle-sm toggle-info cursor-pointer"
                />
              </div>

              {/* Reset All Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer"
                >
                  <FaUndo className="text-[10px]" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          </aside>

          {/* ================= RIGHT MAIN CATALOG ================= */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Toolbar (Category Title, Search, Sort) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{selectedCategory === 'All' ? 'All Products' : selectedCategory}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                    {filteredProducts.length} items
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing available items in the SuperShop collection
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search Input */}
                <div className="relative">
                  <FaSearch className="text-slate-400 text-xs absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in products..."
                    className="w-full sm:w-48 md:w-56 rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Pills Bar (Only shown when user actively filters) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400">Active Filters:</span>

                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                    <span>Category: {selectedCategory}</span>
                    <button
                      onClick={() => handleSelectCategory('All')}
                      className="hover:text-sky-900 cursor-pointer"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    <span>Search: &quot;{searchQuery}&quot;</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 cursor-pointer">
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    <span>In-Stock Only</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-900 cursor-pointer">
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                )}

                {isPriceFilterActive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    <span>Under ${priceRange}</span>
                    <button onClick={() => setPriceRange(null)} className="hover:text-amber-900 cursor-pointer">
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="min-h-[40vh] rounded-3xl border border-dashed border-slate-200 bg-white p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <FaBoxes className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No products matched your selected category and filters. Try clearing your filters
                    or adjusting the search query.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer shadow-md shadow-sky-600/20"
                >
                  <FaUndo className="text-xs" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
};

export default ProductCatalogView;
