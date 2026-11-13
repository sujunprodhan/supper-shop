'use server';

import authOptions from '@/lib/authOptions';
import { collections, dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { stripe } from '@/lib/stripe';
import { initSSLCommerzPayment } from '@/lib/sslcommerz';
import { sendOrderInvoiceEmail } from '@/lib/sendEmail';

export const createOrder = async (orderPayload) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: 'Please log in to place an order.' };
    }

    const {
      items = [],
      shippingAddress = {},
      deliveryMethod = 'standard',
      paymentMethod = 'card',
      mobileProvider = null,
      orderNotes = '',
      subtotal = 0,
      shippingCost = 0,
      discount = 0,
      tax = 0,
      grandTotal = 0,
    } = orderPayload;

    if (!items || items.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const cartCollection = dbConnect(collections.CART);

    const targetEmail = (
      orderPayload.customerEmail ||
      shippingAddress.email ||
      session.user.email
    ).trim();

    const customerName =
      `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() ||
      session.user.name ||
      'Customer';

    const newOrder = {
      userEmail: targetEmail,
      accountEmail: session.user.email,
      userName: customerName,
      items,
      shippingAddress: {
        ...shippingAddress,
        email: targetEmail,
      },
      deliveryMethod,
      paymentMethod,
      mobileProvider,
      orderNotes,
      subtotal: Number(subtotal),
      shippingCost: Number(shippingCost),
      discount: Number(discount),
      tax: Number(tax),
      grandTotal: Number(grandTotal),
      orderStatus: 'Pending',
      paymentStatus: paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : 'Awaiting Payment',
      createdAt: new Date(),
    };

    const insertResult = await orderCollection.insertOne(newOrder);
    const orderId = insertResult.insertedId.toString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (paymentMethod === 'cod') {
      await cartCollection.deleteMany({ email: session.user.email });

      sendOrderInvoiceEmail({ ...newOrder, _id: insertResult.insertedId }).catch((err) =>
        console.error('[createOrder COD] Invoice email error:', err)
      );

      return {
        success: true,
        orderId,
        redirectUrl: `/order-success?order_id=${orderId}`,
      };
    }

    if (paymentMethod === 'card') {
      const { cardDetails } = orderPayload;

      if (cardDetails && cardDetails.number) {
        const cleanNumber = cardDetails.number.replace(/\s+/g, '');
        const last4 = cleanNumber.slice(-4);
        const txnId = `TXN_CARD_${Date.now()}`;

        await orderCollection.updateOne(
          { _id: insertResult.insertedId },
          {
            $set: {
              paymentStatus: `Pending (Card •••• ${last4})`,
              orderStatus: 'Pending',
              transactionId: txnId,
              cardHolderName: cardDetails.name || newOrder.userName,
              cardLast4: last4,
              submittedAt: new Date(),
            },
          }
        );

        await cartCollection.deleteMany({ email: session.user.email });

        sendOrderInvoiceEmail({
          ...newOrder,
          _id: insertResult.insertedId,
          paymentStatus: `Pending (Card •••• ${last4})`,
        }).catch((err) =>
          console.error('[createOrder Card] Invoice email error:', err)
        );

        return {
          success: true,
          orderId,
          redirectUrl: `/order-success?order_id=${orderId}`,
        };
      }

      try {
        const lineItems = items.map((item) => {
          const unitPrice = Math.round(Number(item.price) || 1);
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.title || 'Product',
                images: item.image && item.image.startsWith('http') ? [item.image] : [],
              },
              unit_amount: Math.round(unitPrice * 100),
            },
            quantity: Number(item.quantity) || 1,
          };
        });

        if (shippingCost > 0) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Shipping (${deliveryMethod.toUpperCase()})`,
              },
              unit_amount: Math.round(shippingCost * 100),
            },
            quantity: 1,
          });
        }

        const stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer_email: session.user.email,
          line_items: lineItems,
          success_url: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${baseUrl}/checkout`,
          metadata: {
            orderId,
            userEmail: session.user.email,
          },
        });

        return {
          success: true,
          orderId,
          redirectUrl: stripeSession.url,
        };
      } catch (stripeError) {
        console.error('Stripe Session Creation Error:', stripeError);
        return {
          success: false,
          message: stripeError.message || 'Failed to initiate Stripe payment.',
        };
      }
    }

    if (paymentMethod === 'mobile') {
      try {
        const sslResult = await initSSLCommerzPayment({
          tranId: orderId,
          amount: grandTotal,
          currency: 'BDT',
          productName: items.map((i) => i.title).join(', ').slice(0, 50),
          customerName: newOrder.userName,
          customerEmail: session.user.email,
          customerPhone: shippingAddress.phone || '01700000000',
          address: `${shippingAddress.street || ''}, ${shippingAddress.apartment || ''}`.trim(),
          city: shippingAddress.city || 'Dhaka',
          postalCode: shippingAddress.postalCode || '1200',
        });

        if (sslResult.success && sslResult.gatewayUrl) {
          return {
            success: true,
            orderId,
            redirectUrl: sslResult.gatewayUrl,
          };
        } else {
          return {
            success: false,
            message: sslResult.message || 'Failed to initiate mobile banking gateway.',
          };
        }
      } catch (sslErr) {
        console.error('SSLCommerz Error:', sslErr);
        return {
          success: false,
          message: 'Error communicating with Mobile Banking payment gateway.',
        };
      }
    }

    return { success: false, message: 'Invalid payment method selected.' };
  } catch (error) {
    console.error('Create Order Error:', error);
    return { success: false, message: error.message || 'Something went wrong.' };
  }
};

export const getOrderById = async (orderId) => {
  try {
    if (!orderId || !ObjectId.isValid(orderId)) {
      return null;
    }

    const orderCollection = dbConnect(collections.ORDER);
    const order = await orderCollection.findOne({ _id: new ObjectId(orderId) });
    if (!order) return null;

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error('Get Order Error:', error);
    return null;
  }
};

export const verifyAndCompleteStripeOrder = async (sessionId, orderId) => {
  try {
    if (!sessionId) return null;

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    const targetOrderId = orderId || stripeSession.metadata?.orderId;
    if (!targetOrderId || !ObjectId.isValid(targetOrderId)) return null;

    const orderCollection = dbConnect(collections.ORDER);
    const cartCollection = dbConnect(collections.CART);

    if (stripeSession.payment_status === 'paid') {
      await orderCollection.updateOne(
        { _id: new ObjectId(targetOrderId) },
        {
          $set: {
            paymentStatus: 'Paid (Stripe)',
            orderStatus: 'Confirmed',
            transactionId: stripeSession.payment_intent || stripeSession.id,
            paidAt: new Date(),
          },
        }
      );

      const userEmail = stripeSession.metadata?.userEmail || stripeSession.customer_email;
      if (userEmail) {
        await cartCollection.deleteMany({ email: userEmail });
      }

      const updatedOrder = await orderCollection.findOne({ _id: new ObjectId(targetOrderId) });

      if (updatedOrder) {
        sendOrderInvoiceEmail(updatedOrder).catch((err) =>
          console.error('[verifyAndCompleteStripeOrder] Invoice email error:', err)
        );
      }

      return JSON.parse(JSON.stringify(updatedOrder));
    }

    return null;
  } catch (error) {
    console.error('Verify Stripe Order Error:', error);
    return null;
  }
};
