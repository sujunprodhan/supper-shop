'use server';

import { collections, dbConnect } from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

export const postUser = async (payload) => {
  try {
    const { email, password, name } = payload || {};

    // check payload
    if (!email || !password || !name) {
      return { success: false, message: 'All fields are required.' };
    }

    // check user
    const isExist = await dbConnect(collections.USER).findOne({ email });
    if (isExist) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = {
      provider: 'credentials',
      name,
      email,
      password: hashPassword,
      role: 'user',
      createdAt: new Date(),
    };

    // insert user
    const result = await dbConnect(collections.USER).insertOne(newUser);
    if (result.acknowledged) {
      return {
        success: true,
        message: 'Account created successfully!',
        insertedId: result.insertedId.toString(),
      };
    }

    return { success: false, message: 'Failed to create account. Please try again.' };
  } catch (error) {
    console.error('Error in postUser:', error);
    return { success: false, message: error.message || 'Server error occurred.' };
  }
};

export const registerUser = postUser;
