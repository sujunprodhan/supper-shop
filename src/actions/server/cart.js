'use server';

import authOptions from '@/lib/authOptions';
import { collections, dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';

export const handleCart = async ({ product, inc = true }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, message: 'Please log in to add items to cart' };
    }

    const user = session.user;
    if (!user.email) {
      return { success: false, message: 'User email not found' };
    }

    const productId = product?._id ? product._id.toString() : product?.id;
    if (!productId) {
      return { success: false, message: 'Product ID is missing' };
    }

    const cartCollection = dbConnect(collections.CART);
    const query = { email: user.email, productId };
    const isAdded = await cartCollection.findOne(query);

    if (isAdded) {
      const updateProduct = {
        $inc: {
          quantity: inc ? 1 : -1,
        },
      };
      const result = await cartCollection.updateOne(query, updateProduct);
      return { success: Boolean(result.acknowledged) };
    } else {
      const price = Number(product?.price) || 0;
      const discount = Number(product?.discount) || 0;
      const finalPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;

      const newData = {
        productId,
        email: user.email,
        title: product?.title || '',
        quantity: 1,
        image: product?.image || '',
        price: finalPrice,
        username: user?.name || '',
      };

      const result = await cartCollection.insertOne(newData);
      return { success: Boolean(result.acknowledged) };
    }
  } catch (error) {
    console.error('Error handling cart:', error);
    return { success: false, message: error.message || 'Failed to update cart' };
  }
};
