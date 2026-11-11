import React from 'react';
import Container from '@/layout/Container';
import OrderSuccessView from '@/components/OrderSuccessView';
import { getOrderById, verifyAndCompleteStripeOrder } from '@/actions/server/order';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order Confirmation - SuperShop',
  description: 'Your order has been placed successfully.',
};

const OrderSuccessPage = async ({ searchParams }) => {
  const { session_id, order_id } = await searchParams;

  let order = null;

  if (session_id) {
    order = await verifyAndCompleteStripeOrder(session_id, order_id);
  }

  if (!order && order_id) {
    order = await getOrderById(order_id);
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <Container>
        <OrderSuccessView order={order} />
      </Container>
    </div>
  );
};

export default OrderSuccessPage;

