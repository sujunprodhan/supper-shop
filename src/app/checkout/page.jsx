import React from 'react';
import Container from '@/layout/Container';
import CheckoutView from '@/components/CheckoutView';
import { getCart } from '@/actions/server/cart';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Secure Checkout - SuperShop',
  description: 'Complete your purchase with our secure checkout process.',
};

const CheckoutPage = async () => {
  const cartItems = (await getCart()) || [];

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <Container>
        <CheckoutView initialCart={cartItems} />
      </Container>
    </div>
  );
};

export default CheckoutPage;

