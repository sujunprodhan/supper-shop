'use server';

import { collections, dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export const getProduct = async () => {
  try {
    const productCollection = dbConnect(collections.PRODUCT);
    const products = await productCollection.find().toArray();
    const result = JSON.parse(JSON.stringify(products));
    return result;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getSingleProduct = async (id) => {
  try {
    if (!id || id.length !== 24) {
      return null;
    }
    const query = { _id: new ObjectId(id) };
    const product = await dbConnect(collections.PRODUCT).findOne(query);
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error fetching single product:', error);
    return null;
  }
};
