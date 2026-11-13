'use server';

import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { collections, dbConnect } from '@/lib/dbConnect';

const verifyAdminSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { isAdmin: false, error: 'Unauthorized: Please log in' };
  }

  const userCollection = dbConnect(collections.USER);
  const user = await userCollection.findOne({ email: session.user.email });

  if (!user || user.role !== 'admin') {
    return { isAdmin: false, error: 'Forbidden: Admin access required' };
  }

  return { isAdmin: true, user: { ...session.user, image: user.image || session.user.image || '' } };
};

const lookupUserAvatar = async (email, fallbackAvatar = '') => {
  if (fallbackAvatar) return fallbackAvatar;
  if (!email || email.includes('@guest.suppershop.com')) return '';
  try {
    const userCol = dbConnect(collections.USER);
    const u = await userCol.findOne({ email }, { projection: { image: 1 } });
    return u?.image || '';
  } catch (e) {
    return '';
  }
};

export const getUserConversation = async (userEmail, guestId) => {
  try {
    if (!userEmail && !guestId) {
      return { success: false, conversation: null };
    }

    const chatCol = dbConnect(collections.CHAT_CONVERSATION);
    const now = new Date();

    const query = userEmail
      ? { $or: [{ userEmail }, { guestId: guestId || 'NONE' }] }
      : { guestId };

    let conv = await chatCol.findOne(query);

    if (conv) {
      let resolvedAvatar = conv.userAvatar;
      if (!resolvedAvatar && userEmail) {
        resolvedAvatar = await lookupUserAvatar(userEmail);
      }

      const updateFields = {
        userLastActiveAt: now,
        updatedAt: now,
      };
      if (resolvedAvatar && resolvedAvatar !== conv.userAvatar) {
        updateFields.userAvatar = resolvedAvatar;
      }
      if (conv.unreadByUser > 0) {
        updateFields.unreadByUser = 0;
        conv.unreadByUser = 0;
      }

      await chatCol.updateOne({ _id: conv._id }, { $set: updateFields });
      conv.userLastActiveAt = now;
      if (resolvedAvatar) conv.userAvatar = resolvedAvatar;

      const isAdminOnline = conv.adminLastActiveAt
        ? Date.now() - new Date(conv.adminLastActiveAt).getTime() < 45000
        : false;

      let adminInfo = { name: 'Store Admin', image: '' };
      try {
        const userCol = dbConnect(collections.USER);
        const adminUser = await userCol.findOne({ role: 'admin' });
        if (adminUser) {
          adminInfo = {
            name: adminUser.name || 'Store Admin',
            image: adminUser.image || '',
          };
        }
      } catch (e) {}

      if (Array.isArray(conv.messages)) {
        conv.messages = conv.messages.map((m) => {
          if (m.sender === 'admin' && !m.senderAvatar && adminInfo.image) {
            return { ...m, senderAvatar: adminInfo.image };
          }
          return m;
        });
      }

      return {
        success: true,
        conversation: {
          ...JSON.parse(JSON.stringify(conv)),
          isAdminOnline,
          adminInfo,
        },
      };
    }

    return {
      success: true,
      conversation: null,
    };
  } catch (error) {
    console.error('Error fetching user conversation:', error);
    return { success: false, error: error.message };
  }
};

export const sendMessageFromUser = async ({
  userEmail,
  userName = 'Customer',
  userAvatar = '',
  guestId,
  text,
  productRef = null,
}) => {
  try {
    const trimmedText = (text || '').trim();
    if (!trimmedText) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    const chatCol = dbConnect(collections.CHAT_CONVERSATION);
    const now = new Date();

    const resolvedAvatar = await lookupUserAvatar(userEmail, userAvatar);

    const query = userEmail
      ? { $or: [{ userEmail }, { guestId: guestId || 'NONE' }] }
      : { guestId };

    const messageObj = {
      id: new ObjectId().toString(),
      sender: 'user',
      senderName: userName || 'Customer',
      senderAvatar: resolvedAvatar || '',
      text: trimmedText,
      timestamp: now,
      productRef: productRef
        ? {
            id: productRef.id || productRef._id,
            title: productRef.title,
            price: productRef.price,
            image: productRef.image,
          }
        : null,
    };

    let conv = await chatCol.findOne(query);

    if (!conv) {
      const newConv = {
        userEmail: userEmail || `guest-${guestId || Date.now()}@guest.suppershop.com`,
        userName: userName || 'Shopper',
        userAvatar: resolvedAvatar || '',
        guestId: guestId || null,
        lastMessage: trimmedText,
        lastMessageAt: now,
        lastSender: 'user',
        userLastActiveAt: now,
        adminLastActiveAt: null,
        unreadByAdmin: 1,
        unreadByUser: 0,
        messages: [messageObj],
        createdAt: now,
        updatedAt: now,
      };

      const result = await chatCol.insertOne(newConv);
      newConv._id = result.insertedId;

      return {
        success: true,
        conversation: JSON.parse(JSON.stringify(newConv)),
      };
    } else {
      await chatCol.updateOne(
        { _id: conv._id },
        {
          $set: {
            userEmail: userEmail || conv.userEmail,
            userName: userName || conv.userName,
            userAvatar: resolvedAvatar || conv.userAvatar,
            lastMessage: trimmedText,
            lastMessageAt: now,
            lastSender: 'user',
            userLastActiveAt: now,
            updatedAt: now,
          },
          $inc: { unreadByAdmin: 1 },
          $push: { messages: messageObj },
        }
      );

      const updated = await chatCol.findOne({ _id: conv._id });
      const isAdminOnline = updated.adminLastActiveAt
        ? Date.now() - new Date(updated.adminLastActiveAt).getTime() < 45000
        : false;

      return {
        success: true,
        conversation: {
          ...JSON.parse(JSON.stringify(updated)),
          isAdminOnline,
        },
      };
    }
  } catch (error) {
    console.error('Error sending message from user:', error);
    return { success: false, error: error.message };
  }
};

export const getAllConversationsAdmin = async () => {
  try {
    const auth = await verifyAdminSession();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    const chatCol = dbConnect(collections.CHAT_CONVERSATION);
    const conversations = await chatCol
      .find({})
      .sort({ lastMessageAt: -1 })
      .toArray();

    const processed = await Promise.all(
      conversations.map(async (c) => {
        let avatar = c.userAvatar;
        if (!avatar && c.userEmail) {
          avatar = await lookupUserAvatar(c.userEmail);
          if (avatar) {
            chatCol.updateOne({ _id: c._id }, { $set: { userAvatar: avatar } }).catch(() => {});
          }
        }

        const isUserOnline = c.userLastActiveAt
          ? Date.now() - new Date(c.userLastActiveAt).getTime() < 45000
          : false;

        return {
          ...c,
          userAvatar: avatar || '',
          isUserOnline,
        };
      })
    );

    return {
      success: true,
      conversations: JSON.parse(JSON.stringify(processed)),
    };
  } catch (error) {
    console.error('Error fetching all conversations for admin:', error);
    return { success: false, error: error.message, conversations: [] };
  }
};

export const getConversationDetailsAdmin = async (conversationId) => {
  try {
    const auth = await verifyAdminSession();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    if (!conversationId || !ObjectId.isValid(conversationId)) {
      return { success: false, error: 'Invalid conversation ID' };
    }

    const chatCol = dbConnect(collections.CHAT_CONVERSATION);
    const now = new Date();

    const conv = await chatCol.findOne({ _id: new ObjectId(conversationId) });
    if (!conv) {
      return { success: false, error: 'Conversation not found' };
    }

    let userAvatar = conv.userAvatar;
    if (!userAvatar && conv.userEmail) {
      userAvatar = await lookupUserAvatar(conv.userEmail);
    }

    const updateFields = {
      adminLastActiveAt: now,
      updatedAt: now,
    };
    if (conv.unreadByAdmin > 0) {
      updateFields.unreadByAdmin = 0;
      conv.unreadByAdmin = 0;
    }
    if (userAvatar && userAvatar !== conv.userAvatar) {
      updateFields.userAvatar = userAvatar;
      conv.userAvatar = userAvatar;
    }

    await chatCol.updateOne({ _id: conv._id }, { $set: updateFields });
    conv.adminLastActiveAt = now;

    const isUserOnline = conv.userLastActiveAt
      ? Date.now() - new Date(conv.userLastActiveAt).getTime() < 45000
      : false;

    let orderSummary = {
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: null,
    };

    if (conv.userEmail && !conv.userEmail.includes('@guest.suppershop.com')) {
      const orderCol = dbConnect(collections.ORDER);
      const userOrders = await orderCol
        .find({
          $or: [{ userEmail: conv.userEmail }, { accountEmail: conv.userEmail }],
        })
        .sort({ createdAt: -1 })
        .toArray();

      orderSummary.totalOrders = userOrders.length;
      orderSummary.totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      if (userOrders.length > 0) {
        orderSummary.lastOrder = {
          id: userOrders[0]._id.toString(),
          total: userOrders[0].total,
          status: userOrders[0].orderStatus || 'Pending',
          paymentStatus: userOrders[0].paymentStatus || 'Pending',
          date: userOrders[0].createdAt,
        };
      }
    }

    return {
      success: true,
      conversation: {
        ...JSON.parse(JSON.stringify(conv)),
        isUserOnline,
      },
      userOrderSummary: JSON.parse(JSON.stringify(orderSummary)),
      adminProfile: {
        name: auth.user.name || 'Store Admin',
        image: auth.user.image || '',
      },
    };
  } catch (error) {
    console.error('Error fetching conversation details for admin:', error);
    return { success: false, error: error.message };
  }
};

export const sendMessageFromAdmin = async ({
  conversationId,
  text,
  discountCode = '',
  discountPercent = null,
}) => {
  try {
    const auth = await verifyAdminSession();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    const trimmedText = (text || '').trim();
    if (!trimmedText) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    if (!conversationId || !ObjectId.isValid(conversationId)) {
      return { success: false, error: 'Invalid conversation ID' };
    }

    const chatCol = dbConnect(collections.CHAT_CONVERSATION);
    const now = new Date();

    let adminAvatar = auth.user.image || '';
    if (!adminAvatar) {
      try {
        const userCol = dbConnect(collections.USER);
        const adminDoc = await userCol.findOne({ role: 'admin' });
        adminAvatar = adminDoc?.image || '';
      } catch (e) {}
    }

    const adminMessageObj = {
      id: new ObjectId().toString(),
      sender: 'admin',
      senderName: auth.user.name || 'Store Admin',
      senderAvatar: adminAvatar,
      text: trimmedText,
      timestamp: now,
      discountOffer: discountCode
        ? {
            code: discountCode.toUpperCase(),
            percent: discountPercent || '10',
          }
        : null,
    };

    await chatCol.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: trimmedText,
          lastMessageAt: now,
          lastSender: 'admin',
          adminLastActiveAt: now,
          updatedAt: now,
        },
        $inc: { unreadByUser: 1 },
        $push: { messages: adminMessageObj },
      }
    );

    const updated = await chatCol.findOne({ _id: new ObjectId(conversationId) });
    const isUserOnline = updated.userLastActiveAt
      ? Date.now() - new Date(updated.userLastActiveAt).getTime() < 45000
      : false;

    return {
      success: true,
      conversation: {
        ...JSON.parse(JSON.stringify(updated)),
        isUserOnline,
      },
    };
  } catch (error) {
    console.error('Error sending message from admin:', error);
    return { success: false, error: error.message };
  }
};

export const deleteConversationAdmin = async (conversationId) => {
  try {
    const auth = await verifyAdminSession();
    if (!auth.isAdmin) {
      return { success: false, error: auth.error };
    }

    if (!conversationId || !ObjectId.isValid(conversationId)) {
      return { success: false, error: 'Invalid conversation ID' };
    }

    const chatCol = dbConnect(collections.CHAT_CONVERSATION);
    await chatCol.deleteOne({ _id: new ObjectId(conversationId) });

    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return { success: false, error: error.message };
  }
};
