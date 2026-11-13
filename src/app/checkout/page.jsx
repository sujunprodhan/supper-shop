import React from 'react';
import Container from '@/layout/Container';
import CheckoutView from '@/components/CheckoutView';
import { getCart } from '@/actions/server/cart';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Secure Checkout - SuperShop',
  description: 'Complete your purchase with our secure checkout process.',
};

const CheckoutPage = async () => {
  const [cartItems, session] = await Promise.all([
    getCart(),
    getServerSession(authOptions),
  ]);

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <Container>
        <CheckoutView
          initialCart={cartItems || []}
          initialUser={session?.user || null}
        />
      </Container>
    </div>
  );
};

export default CheckoutPage;

