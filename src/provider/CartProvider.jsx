'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getCartCount } from '@/actions/server/cart';
import { getWishlistCount } from '@/actions/server/wishlist';

const CartContext = createContext({
  cartCount: 0,
  wishlistCount: 0,
  setCartCount: () => {},
  setWishlistCount: () => {},
  refreshCartCount: () => {},
  refreshWishlistCount: () => {},
});

export const CartProvider = ({ children }) => {
  const { status } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (status === 'authenticated') {
      try {
        const count = await getCartCount();
        setCartCount(count || 0);
      } catch (err) {
        console.error('Failed to load cart count:', err);
      }
    } else {
      setCartCount(0);
    }
  }, [status]);

  const refreshWishlistCount = useCallback(async () => {
    if (status === 'authenticated') {
      try {
        const count = await getWishlistCount();
        setWishlistCount(count || 0);
      } catch (err) {
        console.error('Failed to load wishlist count:', err);
      }
    } else {
      setWishlistCount(0);
    }
  }, [status]);

  useEffect(() => {
    refreshCartCount();
    refreshWishlistCount();
  }, [refreshCartCount, refreshWishlistCount]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        wishlistCount,
        setWishlistCount,
        refreshCartCount,
        refreshWishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

