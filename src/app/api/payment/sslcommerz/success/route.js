import { collections, dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { sendOrderInvoiceEmail } from '@/lib/sendEmail';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const tran_id = formData.get('tran_id') || request.nextUrl.searchParams.get('tran_id');
    const val_id = formData.get('val_id');
    const bank_tran_id = formData.get('bank_tran_id') || val_id;
    const card_type = formData.get('card_type') || 'Mobile Banking/Card';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (tran_id && ObjectId.isValid(tran_id)) {
      const orderCollection = dbConnect(collections.ORDER);
      const cartCollection = dbConnect(collections.CART);

      const order = await orderCollection.findOne({ _id: new ObjectId(tran_id) });

      if (order) {
        await orderCollection.updateOne(
          { _id: new ObjectId(tran_id) },
          {
            $set: {
              paymentStatus: `Pending Approval (${card_type})`,
              orderStatus: 'Pending',
              transactionId: bank_tran_id || tran_id,
              submittedAt: new Date(),
            },
          }
        );

        if (order.userEmail) {
          await cartCollection.deleteMany({ email: order.userEmail });
        }

        const updatedOrder = await orderCollection.findOne({ _id: new ObjectId(tran_id) });
        if (updatedOrder) {
          sendOrderInvoiceEmail(updatedOrder).catch((err) =>
            console.error('[SSLCommerz Success] Invoice email error:', err)
          );
        }
      }

      return Response.redirect(`${baseUrl}/order-success?order_id=${tran_id}`, 303);
    }

    return Response.redirect(`${baseUrl}/order-success`, 303);
  } catch (error) {
    console.error('SSLCommerz Success Callback Error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return Response.redirect(`${baseUrl}/checkout?error=callback_error`, 303);
  }
}

