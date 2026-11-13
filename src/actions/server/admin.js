'use server';

import authOptions from '@/lib/authOptions';
import { collections, dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { sendOrderApprovalEmail } from '@/lib/sendEmail';

const verifyAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { isAuthorized: false, message: 'Please log in first.' };
  }

  const userCollection = dbConnect(collections.USER);
  let user = await userCollection.findOne({ email: session.user.email });

  if (!user) {
    return { isAuthorized: false, message: 'User account not found.' };
  }

  if (user.role !== 'admin') {
    const adminCount = await userCollection.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await userCollection.updateOne(
        { email: session.user.email },
        { $set: { role: 'admin' } }
      );
      user.role = 'admin';
    } else {
      return { isAuthorized: false, message: 'You do not have admin permissions.' };
    }
  }

  return { isAuthorized: true, user, session };
};

export const getAdminOverview = async () => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const userCollection = dbConnect(collections.USER);
    const productCollection = dbConnect(collections.PRODUCT);

    const allOrders = await orderCollection.find().sort({ createdAt: -1 }).toArray();
    const totalUsers = await userCollection.countDocuments();
    const totalProducts = await productCollection.countDocuments();
    const allProducts = await productCollection.find().toArray();

    const totalRevenue = allOrders.reduce((acc, order) => {
      const isPaid =
        order.orderStatus === 'Confirmed' ||
        order.orderStatus === 'Processing' ||
        order.orderStatus === 'Shipped' ||
        order.orderStatus === 'Delivered' ||
        order.paymentStatus?.toLowerCase().includes('paid');
      return isPaid ? acc + (Number(order.grandTotal) || 0) : acc;
    }, 0);

    const totalOrdersCount = allOrders.length;
    const pendingOrdersCount = allOrders.filter(
      (o) =>
        o.orderStatus === 'Pending' ||
        o.paymentStatus?.toLowerCase().includes('pending') ||
        o.paymentStatus?.toLowerCase().includes('awaiting')
    ).length;

    const totalItemsSold = allOrders.reduce((acc, order) => {
      if (order.orderStatus === 'Cancelled') return acc;
      const itemsCount = (order.items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 1),
        0
      );
      return acc + itemsCount;
    }, 0);

    const validOrders = allOrders.filter((o) => o.orderStatus !== 'Cancelled');
    const avgOrderValue =
      validOrders.length > 0
        ? Math.round(
            validOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0) / validOrders.length
          )
        : 0;

    const pipeline = {
      new: allOrders.filter((o) => o.orderStatus === 'Pending').length,
      packing: allOrders.filter((o) => o.orderStatus === 'Processing').length,
      shipped: allOrders.filter((o) => o.orderStatus === 'Shipped').length,
      delivered: allOrders.filter((o) => o.orderStatus === 'Delivered').length,
      cancelled: allOrders.filter((o) => o.orderStatus === 'Cancelled').length,
    };

    const channelRevenue = {
      card: allOrders
        .filter((o) => o.paymentMethod === 'card' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0),
      mobile: allOrders
        .filter((o) => o.paymentMethod === 'mobile' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0),
      cod: allOrders
        .filter((o) => o.paymentMethod === 'cod' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0),
    };

    const productSalesMap = {};
    allOrders.forEach((order) => {
      if (order.orderStatus === 'Cancelled') return;
      (order.items || []).forEach((item) => {
        const key = item.productId || item.title || 'Product';
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.title || 'Product',
            image: item.image || '',
            units: 0,
            revenue: 0,
          };
        }
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        productSalesMap[key].units += qty;
        productSalesMap[key].revenue += qty * price;
      });
    });

    const topSellers = Object.values(productSalesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const runningLow = allProducts
      .filter((p) => Number(p.stock || 0) <= 5)
      .map((p) => ({
        id: p._id.toString(),
        title: p.title,
        stock: Number(p.stock || 0),
        unit: p.unit || 'Standard',
      }))
      .slice(0, 5);

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrdersCount,
        pendingOrdersCount,
        totalUsers,
        totalProducts,
        totalItemsSold,
        avgOrderValue,
        pipeline,
        channelRevenue,
        topSellers,
        runningLow,
      },
      recentOrders: JSON.parse(JSON.stringify(allOrders)),
    };
  } catch (error) {
    console.error('Error in getAdminOverview:', error);
    return { success: false, message: error.message || 'Failed to fetch admin overview' };
  }
};

// 2. Get All Orders with optional filtering
export const getAllOrders = async (filter = {}) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message, orders: [] };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const query = {};

    if (filter.status && filter.status !== 'all') {
      query.orderStatus = filter.status;
    }

    const orders = await orderCollection.find(query).sort({ createdAt: -1 }).toArray();
    return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return { success: false, message: error.message, orders: [] };
  }
};

// 3. Admin approves pending payment
export const updateOrderPaymentStatus = async ({ orderId, paymentStatus }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!orderId || !ObjectId.isValid(orderId)) {
      return { success: false, message: 'Invalid order ID' };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const targetStatus = paymentStatus || 'Paid (Approved by Admin)';

    const result = await orderCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: targetStatus,
          orderStatus: 'Confirmed',
          approvedAt: new Date(),
          approvedBy: auth.user.email,
        },
      }
    );

    if (result.modifiedCount > 0) {
      // Send confirmation & approval email to the customer
      const approvedOrder = await orderCollection.findOne({ _id: new ObjectId(orderId) });
      if (approvedOrder && approvedOrder.userEmail) {
        sendOrderApprovalEmail(approvedOrder).catch((err) =>
          console.error('[updateOrderPaymentStatus] Approval email error:', err)
        );
      }
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: Boolean(result.modifiedCount > 0),
      message: 'Payment approved! Order is now Confirmed.',
    };
  } catch (error) {
    console.error('Error in updateOrderPaymentStatus:', error);
    return { success: false, message: error.message };
  }
};

// 4. Admin updates Order Lifecycle Status
export const updateOrderStatus = async ({ orderId, orderStatus }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!orderId || !ObjectId.isValid(orderId)) {
      return { success: false, message: 'Invalid order ID' };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const result = await orderCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          orderStatus,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0 && orderStatus === 'Confirmed') {
      const confirmedOrder = await orderCollection.findOne({ _id: new ObjectId(orderId) });
      if (confirmedOrder && confirmedOrder.userEmail) {
        sendOrderApprovalEmail(confirmedOrder).catch((err) =>
          console.error('[updateOrderStatus] Approval email error:', err)
        );
      }
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: Boolean(result.modifiedCount > 0),
      message: `Order status updated to "${orderStatus}"!`,
    };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return { success: false, message: error.message };
  }
};

// 5. Admin cancels an Order
export const cancelOrder = async ({ orderId, reason }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!orderId || !ObjectId.isValid(orderId)) {
      return { success: false, message: 'Invalid order ID' };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const result = await orderCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          orderStatus: 'Cancelled',
          paymentStatus: 'Cancelled / Rejected',
          cancelReason: reason || 'Cancelled by Store Administrator',
          cancelledAt: new Date(),
          cancelledBy: auth.user.email,
        },
      }
    );

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return {
      success: Boolean(result.modifiedCount > 0),
      message: 'Order has been cancelled.',
    };
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    return { success: false, message: error.message };
  }
};

// 6. Get All Users (for Team & Roles)
export const getAllUsers = async () => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message, users: [] };
    }

    const userCollection = dbConnect(collections.USER);
    const users = await userCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return { success: false, message: error.message, users: [] };
  }
};

// 7. Update User Role (e.g. 'user' -> 'admin' or vice-versa)
export const updateUserRole = async ({ userId, role }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!userId || !ObjectId.isValid(userId)) {
      return { success: false, message: 'Invalid user ID' };
    }

    if (!['user', 'admin'].includes(role)) {
      return { success: false, message: 'Invalid role specified' };
    }

    const userCollection = dbConnect(collections.USER);
    const result = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role, roleUpdatedAt: new Date() } }
    );

    revalidatePath('/admin');

    return {
      success: Boolean(result.modifiedCount > 0),
      message: `User role successfully updated to ${role.toUpperCase()}!`,
    };
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return { success: false, message: error.message };
  }
};

// 8. Delete User by Admin
export const deleteUserByAdmin = async ({ userId }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!userId || !ObjectId.isValid(userId)) {
      return { success: false, message: 'Invalid user ID' };
    }

    const userCollection = dbConnect(collections.USER);
    const targetUser = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!targetUser) {
      return { success: false, message: 'User not found in database' };
    }

    // Safety: Prevent logged-in admin from deleting their own account
    if (targetUser.email === auth.user.email) {
      return {
        success: false,
        message: 'You cannot delete your own logged-in admin account.',
      };
    }

    const result = await userCollection.deleteOne({ _id: new ObjectId(userId) });

    // Clean up cart & wishlist records belonging to this user
    if (targetUser.email) {
      const cartCollection = dbConnect(collections.CART);
      const wishlistCollection = dbConnect(collections.WISHLIST);
      await Promise.all([
        cartCollection.deleteMany({ email: targetUser.email }),
        wishlistCollection.deleteMany({ email: targetUser.email }),
      ]);
    }

    revalidatePath('/admin');

    return {
      success: Boolean(result.deletedCount > 0),
      message: `User "${targetUser.name || targetUser.email}" deleted successfully.`,
    };
  } catch (error) {
    console.error('Error in deleteUserByAdmin:', error);
    return { success: false, message: error.message || 'Failed to delete user.' };
  }
};

// 8. User Dashboard Data (For regular authenticated customers)
export const getUserDashboardData = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: 'Please log in to view your dashboard.' };
    }

    const email = session.user.email;
    const orderCollection = dbConnect(collections.ORDER);
    const wishlistCollection = dbConnect(collections.WISHLIST);
    const userCollection = dbConnect(collections.USER);

    const [userOrders, wishlistCount, userProfile] = await Promise.all([
      orderCollection
        .find({ $or: [{ userEmail: email }, { accountEmail: email }] })
        .sort({ createdAt: -1 })
        .toArray(),
      wishlistCollection.countDocuments({ email }),
      userCollection.findOne({ email }, { projection: { password: 0 } }),
    ]);

    const totalSpent = userOrders.reduce((sum, order) => {
      const isPaid = order.paymentStatus?.toLowerCase().includes('paid');
      return isPaid ? sum + (Number(order.grandTotal) || 0) : sum;
    }, 0);

    return {
      success: true,
      profile: userProfile ? JSON.parse(JSON.stringify(userProfile)) : session.user,
      stats: {
        totalOrders: userOrders.length,
        totalSpent,
        wishlistCount,
        pendingDeliveries: userOrders.filter(
          (o) => o.orderStatus === 'Processing' || o.orderStatus === 'Shipped'
        ).length,
      },
      orders: JSON.parse(JSON.stringify(userOrders)),
    };
  } catch (error) {
    console.error('Error in getUserDashboardData:', error);
    return { success: false, message: error.message };
  }
};

// 9. Get All Products for Admin Stock View
export const getAllProductsAdmin = async () => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message, products: [] };
    }

    const productCollection = dbConnect(collections.PRODUCT);
    const products = await productCollection.find().sort({ createdAt: -1 }).toArray();

    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)),
    };
  } catch (error) {
    console.error('Error in getAllProductsAdmin:', error);
    return { success: false, message: error.message, products: [] };
  }
};

// 10. Update Product Stock (Direct Inventory Adjustment)
export const updateProductStock = async ({ productId, newStock }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!productId || !ObjectId.isValid(productId)) {
      return { success: false, message: 'Invalid product ID' };
    }

    const qty = Math.max(0, parseInt(newStock, 10) || 0);
    const productCollection = dbConnect(collections.PRODUCT);
    const result = await productCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { stock: qty, stockUpdatedAt: new Date() } }
    );

    revalidatePath('/admin');
    revalidatePath('/products');

    return {
      success: Boolean(result.modifiedCount > 0 || result.matchedCount > 0),
      message: `Stock updated to ${qty} units!`,
      newStock: qty,
    };
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    return { success: false, message: error.message };
  }
};

// 11. Create / Add New Product (Admin Only)
export const createProductByAdmin = async (productData) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    const {
      title,
      category,
      price,
      discount = 0,
      stock = 0,
      unit = 'piece',
      image = '',
      description = '',
      featured = false,
    } = productData || {};

    if (!title || !title.trim()) {
      return { success: false, message: 'Product title is required.' };
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return { success: false, message: 'Valid product price is required.' };
    }

    const cleanCategory = (category && category.trim()) || 'General';
    const numDiscount = Math.max(0, Math.min(100, Number(discount) || 0));
    const numStock = Math.max(0, Math.floor(Number(stock) || 0));

    // Default high-quality placeholder if image is empty
    const productImage =
      image && image.trim()
        ? image.trim()
        : 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80';

    const newDoc = {
      title: title.trim(),
      category: cleanCategory,
      price: numPrice,
      discount: numDiscount,
      stock: numStock,
      unit: (unit && unit.trim()) || 'piece',
      image: productImage,
      description: description ? description.trim() : '',
      featured: Boolean(featured),
      rating: 4.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const productCollection = dbConnect(collections.PRODUCT);
    const result = await productCollection.insertOne(newDoc);

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin');

    return {
      success: true,
      message: 'Product created and published to store successfully!',
      product: {
        ...newDoc,
        _id: result.insertedId.toString(),
      },
    };
  } catch (error) {
    console.error('Error in createProductByAdmin:', error);
    return { success: false, message: error.message };
  }
};

// 12. Update / Edit Existing Product (Admin Only)
export const updateProductByAdmin = async ({ productId, productData }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!productId || !ObjectId.isValid(productId)) {
      return { success: false, message: 'Invalid product ID.' };
    }

    const {
      title,
      category,
      price,
      discount = 0,
      stock = 0,
      unit,
      image,
      description,
      featured,
    } = productData || {};

    if (!title || !title.trim()) {
      return { success: false, message: 'Product title cannot be empty.' };
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return { success: false, message: 'Valid price is required.' };
    }

    const updateFields = {
      title: title.trim(),
      category: (category && category.trim()) || 'General',
      price: numPrice,
      discount: Math.max(0, Math.min(100, Number(discount) || 0)),
      stock: Math.max(0, Math.floor(Number(stock) || 0)),
      unit: (unit && unit.trim()) || 'piece',
      description: description ? description.trim() : '',
      featured: Boolean(featured),
      updatedAt: new Date().toISOString(),
    };

    if (image && image.trim()) {
      updateFields.image = image.trim();
    }

    const productCollection = dbConnect(collections.PRODUCT);
    const result = await productCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateFields }
    );

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/admin');

    return {
      success: Boolean(result.modifiedCount > 0 || result.matchedCount > 0),
      message: 'Product updated successfully!',
    };
  } catch (error) {
    console.error('Error in updateProductByAdmin:', error);
    return { success: false, message: error.message };
  }
};

// 13. Delete Product (Admin Only)
export const deleteProductByAdmin = async ({ productId }) => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    if (!productId || !ObjectId.isValid(productId)) {
      return { success: false, message: 'Invalid product ID.' };
    }

    const productCollection = dbConnect(collections.PRODUCT);
    const result = await productCollection.deleteOne({ _id: new ObjectId(productId) });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin');

    return {
      success: Boolean(result.deletedCount > 0),
      message: result.deletedCount > 0 ? 'Product deleted successfully.' : 'Product not found.',
    };
  } catch (error) {
    console.error('Error in deleteProductByAdmin:', error);
    return { success: false, message: error.message };
  }
};

// 14. Lightweight Live Updates Polling (Orders, Revenue, Users, Inventory)
export const getLiveAdminUpdates = async () => {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message };
    }

    const orderCollection = dbConnect(collections.ORDER);
    const userCollection = dbConnect(collections.USER);
    const productCollection = dbConnect(collections.PRODUCT);

    const [allOrders, totalUsers, allProducts] = await Promise.all([
      orderCollection.find().sort({ createdAt: -1 }).toArray(),
      userCollection.countDocuments(),
      productCollection.find().toArray(),
    ]);

    const totalRevenue = allOrders.reduce((acc, order) => {
      const isPaid =
        order.orderStatus === 'Confirmed' ||
        order.orderStatus === 'Processing' ||
        order.orderStatus === 'Shipped' ||
        order.orderStatus === 'Delivered' ||
        order.paymentStatus?.toLowerCase().includes('paid');
      return isPaid ? acc + (Number(order.grandTotal) || 0) : acc;
    }, 0);

    const totalOrdersCount = allOrders.length;
    const pendingOrdersCount = allOrders.filter(
      (o) =>
        o.orderStatus === 'Pending' ||
        o.paymentStatus?.toLowerCase().includes('pending') ||
        o.paymentStatus?.toLowerCase().includes('awaiting')
    ).length;

    const totalItemsSold = allOrders.reduce((acc, order) => {
      if (order.orderStatus === 'Cancelled') return acc;
      return (
        acc +
        (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
      );
    }, 0);

    const validOrders = allOrders.filter((o) => o.orderStatus !== 'Cancelled');
    const avgOrderValue =
      validOrders.length > 0
        ? Math.round(
            validOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0) /
              validOrders.length
          )
        : 0;

    const pipeline = {
      new: allOrders.filter((o) => o.orderStatus === 'Pending').length,
      packing: allOrders.filter((o) => o.orderStatus === 'Processing').length,
      shipped: allOrders.filter((o) => o.orderStatus === 'Shipped').length,
      delivered: allOrders.filter((o) => o.orderStatus === 'Delivered').length,
      cancelled: allOrders.filter((o) => o.orderStatus === 'Cancelled').length,
    };

    const channelRevenue = {
      card: allOrders
        .filter((o) => o.paymentMethod === 'card' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0),
      mobile: allOrders
        .filter((o) => o.paymentMethod === 'mobile' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0),
      cod: allOrders
        .filter((o) => o.paymentMethod === 'cod' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0),
    };

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrdersCount,
        pendingOrdersCount,
        totalUsers,
        totalItemsSold,
        avgOrderValue,
        pipeline,
        channelRevenue,
      },
      orders: JSON.parse(JSON.stringify(allOrders)),
      products: JSON.parse(JSON.stringify(allProducts)),
    };
  } catch (error) {
    console.error('Error in getLiveAdminUpdates:', error);
    return { success: false, message: error.message };
  }
};
