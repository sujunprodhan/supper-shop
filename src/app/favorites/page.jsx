import React from 'react';
import { getWishlist } from '@/actions/server/wishlist';
import Container from '@/layout/Container';
import FavoritesView from '@/components/FavoritesView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Favorites - SuperShop',
  description: 'View and manage your favorite wishlisted products.',
};

const FavoritesPage = async () => {
  const wishlistItems = (await getWishlist()) || [];

  return (
    <Container>
      <FavoritesView initialItems={wishlistItems} />
    </Container>
  );
};

export default FavoritesPage;

