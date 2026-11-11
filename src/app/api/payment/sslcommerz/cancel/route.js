import { collections, dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const tran_id = formData.get('tran_id') || request.nextUrl.searchParams.get('tran_id');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (tran_id && ObjectId.isValid(tran_id)) {
      const orderCollection = dbConnect(collections.ORDER);
      await orderCollection.updateOne(
        { _id: new ObjectId(tran_id) },
        {
          $set: {
            paymentStatus: 'Cancelled',
            orderStatus: 'Cancelled',
          },
        }
      );
    }

    return Response.redirect(`${baseUrl}/checkout?info=Payment+Cancelled`, 303);
  } catch (error) {
    console.error('SSLCommerz Cancel Callback Error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return Response.redirect(`${baseUrl}/checkout`, 303);
  }
}

