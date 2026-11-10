'use server';

import authOptions from '@/lib/authOptions';
import { collections, dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

export const toggleWishlist = async ({ product }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, message: 'Please log in to manage your favorites' };
    }

    const user = session.user;
    if (!user.email) {
      return { success: false, message: 'User email not found' };
    }

    const productId = product?._id ? product._id.toString() : product?.id;
    if (!productId) {
      return { success: false, message: 'Invalid product information' };
    }

    const wishlistCollection = dbConnect(collections.WISHLIST);
    const query = { email: user.email, productId };
    const existing = await wishlistCollection.findOne(query);

    if (existing) {
      await wishlistCollection.deleteOne(query);
      return {
        success: true,
        isWishlisted: false,
        message: 'Product removed from favorites',
      };
    } else {
      const price = Number(product?.price) || 0;
      const discount = Number(product?.discount) || 0;
      const finalPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;

      const newItem = {
        productId,
        email: user.email,
        title: product?.title || '',
        image: product?.image || '',
        price: finalPrice,
        originalPrice: price,
        discount,
        category: product?.category || '',
        unit: product?.unit || '',
        rating: product?.rating || 5,
        stock: product?.stock || 0,
        createdAt: new Date(),
      };

      await wishlistCollection.insertOne(newItem);
      return {
        success: true,
        isWishlisted: true,
        message: 'Product added to favorites!',
      };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return { success: false, message: error.message || 'Failed to update favorites' };
  }
};

export const getWishlist = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return [];
    }

    const wishlistCollection = dbConnect(collections.WISHLIST);
    const query = { email: session.user.email };
    const items = await wishlistCollection.find(query).sort({ _id: -1 }).toArray();
    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

export const removeWishlistItem = async ({ id, productId }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: 'Please log in first' };
    }

    const wishlistCollection = dbConnect(collections.WISHLIST);
    let query = { email: session.user.email };

    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
    } else if (productId) {
      query.productId = productId.toString();
    } else {
      return { success: false, message: 'Invalid product identification' };
    }

    const result = await wishlistCollection.deleteOne(query);
    return {
      success: Boolean(result.deletedCount > 0),
      message: result.deletedCount > 0 ? 'Removed from favorites' : 'Item not found in favorites',
    };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, message: error.message || 'Failed to remove from favorites' };
  }
};

export const getWishlistCount = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return 0;
    }

    const wishlistCollection = dbConnect(collections.WISHLIST);
    const count = await wishlistCollection.countDocuments({ email: session.user.email });
    return count;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
};

