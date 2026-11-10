'use server';

import authOptions from '@/lib/authOptions';
import { collections, dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

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
      if (!inc && isAdded.quantity <= 1) {
        // If decrementing when quantity is 1, remove item
        const result = await cartCollection.deleteOne(query);
        return { success: Boolean(result.acknowledged), message: 'Item removed from cart' };
      }

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
        unit: product?.unit || '',
        username: user?.name || '',
        createdAt: new Date(),
      };

      const result = await cartCollection.insertOne(newData);
      return { success: Boolean(result.acknowledged) };
    }
  } catch (error) {
    console.error('Error handling cart:', error);
    return { success: false, message: error.message || 'Failed to update cart' };
  }
};

export const getCart = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return [];
    }

    const cartCollection = dbConnect(collections.CART);
    const query = { email: session.user.email };
    const result = await cartCollection.find(query).sort({ _id: -1 }).toArray();
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
};

export const getCartCount = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return 0;
    }

    const cartCollection = dbConnect(collections.CART);
    const query = { email: session.user.email };
    const count = await cartCollection.countDocuments(query);
    return count;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

export const removeCartItem = async ({ id, productId }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: 'Please log in first' };
    }

    const cartCollection = dbConnect(collections.CART);
    let query = { email: session.user.email };

    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else if (productId) {
      query.productId = productId.toString();
    } else {
      return { success: false, message: 'Invalid item identification' };
    }

    const result = await cartCollection.deleteOne(query);
    return {
      success: Boolean(result.deletedCount > 0),
      message: result.deletedCount > 0 ? 'Item removed from cart' : 'Item not found in cart',
    };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return { success: false, message: error.message || 'Failed to remove item' };
  }
};

export const updateCartQuantity = async ({ id, productId, quantity }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: 'Please log in first' };
    }

    const targetQuantity = Number(quantity);
    if (isNaN(targetQuantity)) {
      return { success: false, message: 'Invalid quantity' };
    }

    const cartCollection = dbConnect(collections.CART);
    let query = { email: session.user.email };

    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else if (productId) {
      query.productId = productId.toString();
    } else {
      return { success: false, message: 'Invalid item identification' };
    }

    if (targetQuantity <= 0) {
      const result = await cartCollection.deleteOne(query);
      return { success: Boolean(result.deletedCount > 0), message: 'Item removed from cart' };
    }

    const result = await cartCollection.updateOne(query, {
      $set: { quantity: targetQuantity },
    });

    return { success: Boolean(result.acknowledged), message: 'Cart updated successfully' };
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return { success: false, message: error.message || 'Failed to update quantity' };
  }
};

export const clearCart = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: 'Please log in first' };
    }

    const cartCollection = dbConnect(collections.CART);
    const result = await cartCollection.deleteMany({ email: session.user.email });
    return { success: Boolean(result.acknowledged), message: 'Cart cleared successfully' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: error.message || 'Failed to clear cart' };
  }
};
