'use server';

import { collections, dbConnect } from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

export const postUser = async (payload) => {
  try {
    const { email, password, name } = payload || {};

    if (!email || !password || !name) {
      return { success: false, message: 'All fields are required.' };
    }

    const isExist = await dbConnect(collections.USER).findOne({ email });

    if (isExist) {
      return {
        success: false,
        message: 'An account with this email already exists.',
      };
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = {
      provider: 'credentials',
      name,
      email,
      password: hashPassword,
      role: 'user',
      createdAt: new Date(),
    };

    const result = await dbConnect(collections.USER).insertOne(newUser);

    if (result.acknowledged) {
      return {
        success: true,
        message: 'Account created successfully!',
        insertedId: result.insertedId.toString(),
      };
    }

    return {
      success: false,
      message: 'Failed to create account.',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Server error occurred.',
    };
  }
};

export const loginUser = async (payload) => {
  try {
    const { email, password } = payload || {};

    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required.',
      };
    }

    const user = await dbConnect(collections.USER).findOne({ email });

    if (!user || !user.password) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return {
        success: false,
        message: 'Invalid password.',
      };
    }

    return {
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Server error occurred.',
    };
  }
};

export const registerUser = postUser;
