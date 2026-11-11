import React from 'react';
import { getCart } from '@/actions/server/cart';
import Container from '@/layout/Container';
import CartView from '@/components/CartView';


export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shopping Cart - SuperShop',
  description: 'View and manage items in your shopping cart.',
};

const CartPage = async () => {
  const cartItems = (await getCart()) || [];

  return (
    <Container>
      <CartView initialItems={cartItems} />
    </Container>
  );
};

export default CartPage;
