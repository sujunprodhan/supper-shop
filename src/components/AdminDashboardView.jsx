'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaSearch,
  FaBell,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaSpinner,
  FaArrowUp,
  FaExternalLinkAlt,
  FaBoxOpen,
  FaFileAlt,
  FaWarehouse,
  FaLayerGroup,
  FaUsers,
  FaCog,
  FaQuestionCircle,
  FaPlus,
  FaMinus,
  FaDownload,
  FaTruck,
  FaMoneyBillWave,
  FaCreditCard,
  FaBoxes,
  FaExclamationTriangle,
  FaSave,
  FaShoppingCart,
  FaTrash,
  FaEdit,
  FaImage,
  FaStar,
  FaTag,
  FaComments,
} from 'react-icons/fa';
import AdminLiveChatView from '@/components/AdminLiveChatView';
import {
  updateOrderPaymentStatus,
  updateOrderStatus,
  cancelOrder,
  updateUserRole,
  updateProductStock,
  deleteUserByAdmin,
  createProductByAdmin,
  updateProductByAdmin,
  deleteProductByAdmin,
} from '@/actions/server/admin';
import { toast } from 'sonner';

const AdminDashboardView = ({
  initialStats,
  initialOrders = [],
  initialUsers = [],
  initialProducts = [],
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'stock' | 'reports' | 'users'
  const [activityFilter, setActivityFilter] = useState('All');
  const [timeRange, setTimeRange] = useState('30 days');
  const [orders, setOrders] = useState(initialOrders);
  const [users, setUsers] = useState(initialUsers);
  const [products, setProducts] = useState(initialProducts);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Tab State
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out' | 'in'
  const [stockUpdates, setStockUpdates] = useState({});

  // Product Catalog & Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Skincare',
    customCategory: '',
    price: '',
    discount: '0',
    stock: '15',
    unit: 'piece',
    image: '',
    description: '',
    featured: true,
  });

  // Unique existing categories list
  const existingCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // Sample High-Res Presets for fast testing
  const sampleImagePresets = [
    { name: 'Skincare', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80' },
    { name: 'Body Care', url: 'https://images.unsplash.com/photo-1608248597359-00f72390f701?w=800&auto=format&fit=crop&q=80' },
    { name: 'Hair Care', url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=80' },
    { name: 'Spa Essentials', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80' },
    { name: 'Aromatherapy', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category: existingCategories[0] || 'Skincare',
      customCategory: '',
      price: '',
      discount: '0',
      stock: '20',
      unit: '250 ml',
      image: sampleImagePresets[0].url,
      description: '',
      featured: true,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title || '',
      category: prod.category || 'General',
      customCategory: '',
      price: String(prod.price || ''),
      discount: String(prod.discount || '0'),
      stock: String(prod.stock || '0'),
      unit: prod.unit || 'piece',
      image: prod.image || '',
      description: prod.description || '',
      featured: Boolean(prod.featured),
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      toast.error('Product title is required.');
      return;
    }
    const numPrice = Number(productForm.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid price (e.g. 500).');
      return;
    }

    const resolvedCategory =
      productForm.category === 'NEW_CATEGORY'
        ? productForm.customCategory.trim()
        : productForm.category.trim();

    if (!resolvedCategory) {
      toast.error('Please specify a category.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = {
        title: productForm.title.trim(),
        category: resolvedCategory,
        price: numPrice,
        discount: Math.max(0, Math.min(100, Number(productForm.discount) || 0)),
        stock: Math.max(0, Math.floor(Number(productForm.stock) || 0)),
        unit: productForm.unit.trim() || 'piece',
        image: productForm.image.trim(),
        description: productForm.description.trim(),
        featured: Boolean(productForm.featured),
      };

      if (editingProduct?._id) {
        const res = await updateProductByAdmin({
          productId: editingProduct._id,
          productData: payload,
        });

        if (res?.success) {
          setProducts((prev) =>
            prev.map((p) =>
              p._id === editingProduct._id ? { ...p, ...payload } : p
            )
          );
          toast.success('Product updated successfully!');
          setProductModalOpen(false);
        } else {
          toast.error(res?.message || 'Failed to update product.');
        }
      } else {
        const res = await createProductByAdmin(payload);
        if (res?.success && res.product) {
          setProducts((prev) => [res.product, ...prev]);
          toast.success('New product created! It is now live on the Home page.');
          setProductModalOpen(false);
        } else {
          toast.error(res?.message || 'Failed to create product.');
        }
      }
    } catch (err) {
      toast.error('Error saving product: ' + err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    setActionLoadingId(productId);
    try {
      const res = await deleteProductByAdmin({ productId });
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        toast.success('Product removed from catalog.');
      } else {
        toast.error(res?.message || 'Failed to delete product.');
      }
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Products filtered for the Catalog tab
  const catalogFilteredProducts = products.filter((p) => {
    const matchCat =
      productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const q = productSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // 100% Real Dynamic Stock Calculations
  const lowStockProducts = products.filter(
    (p) => Number(p.stock || 0) <= 5 && Number(p.stock || 0) > 0
  );
  const outOfStockProducts = products.filter((p) => Number(p.stock || 0) <= 0);
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalStockValuation = products.reduce(
    (sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0),
    0
  );
  const lowStockBadgeCount = lowStockProducts.length + outOfStockProducts.length;

  // Real pending orders count
  const pendingOrders = orders.filter(
    (o) =>
      o.orderStatus === 'Pending' ||
      o.paymentStatus?.toLowerCase().includes('pending') ||
      o.paymentStatus?.toLowerCase().includes('awaiting')
  );
  const pendingCount = pendingOrders.length;

  // 1. Approve Payment Action (1-click Approve for Admin)
  const handleApprovePayment = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const res = await updateOrderPaymentStatus({
        orderId,
        paymentStatus: 'Paid (Approved by Admin)',
      });

      if (res?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  paymentStatus: 'Paid (Approved by Admin)',
                  orderStatus: o.orderStatus === 'Pending' ? 'Confirmed' : o.orderStatus,
                }
              : o
          )
        );
        toast.success('Payment approved! Order is now confirmed.');
      } else {
        toast.error(res?.message || 'Failed to approve payment.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Cancel Order Action
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setActionLoadingId(orderId);
    try {
      const res = await cancelOrder({
        orderId,
        reason: 'Cancelled by administrator from dashboard',
      });

      if (res?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, orderStatus: 'Cancelled', paymentStatus: 'Cancelled / Rejected' }
              : o
          )
        );
        toast.success('Order has been cancelled.');
      } else {
        toast.error(res?.message || 'Failed to cancel order.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Update Lifecycle Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      const res = await updateOrderStatus({ orderId, orderStatus: newStatus });
      if (res?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        toast.success(`Order status updated to "${newStatus}"!`);
      } else {
        toast.error(res?.message || 'Failed to update order status.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Update User Role
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to "${newRole.toUpperCase()}"?`))
      return;

    setActionLoadingId(userId);
    try {
      const res = await updateUserRole({ userId, role: newRole });
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`User role successfully changed to ${newRole.toUpperCase()}!`);
      } else {
        toast.error(res?.message || 'Failed to update user role.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Delete User by Admin
  const handleDeleteUser = async (userId, userName, userEmail) => {
    if (userEmail === currentUser?.email) {
      toast.error('You cannot delete your own logged-in admin account.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete user "${userName || userEmail}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoadingId(userId);
    try {
      const res = await deleteUserByAdmin({ userId });
      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        toast.success(res?.message || 'User deleted successfully.');
      } else {
        toast.error(res?.message || 'Failed to delete user.');
      }
    } catch {
      toast.error('Error occurred while deleting user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. Update Product Stock (Direct Inventory Adjustment)
  const handleStockInputChange = (productId, value) => {
    setStockUpdates((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleAdjustStock = (productId, currentStock, delta) => {
    const currentVal =
      stockUpdates[productId] !== undefined ? Number(stockUpdates[productId]) : Number(currentStock || 0);
    const newVal = Math.max(0, currentVal + delta);
    setStockUpdates((prev) => ({
      ...prev,
      [productId]: newVal,
    }));
  };

  const handleSaveStock = async (productId, currentStock) => {
    const newStockVal =
      stockUpdates[productId] !== undefined ? stockUpdates[productId] : currentStock;

    setActionLoadingId(productId);
    try {
      const res = await updateProductStock({
        productId,
        newStock: newStockVal,
      });

      if (res?.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, stock: Number(newStockVal) } : p))
        );
        setStockUpdates((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        toast.success(`Stock updated to ${newStockVal} units!`);
      } else {
        toast.error(res?.message || 'Failed to update stock.');
      }
    } catch {
      toast.error('Error saving stock update.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Stock Items
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(stockSearch.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(stockSearch.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(stockSearch.toLowerCase());

    const stock = Number(p.stock || 0);
    if (!matchesSearch) return false;

    if (stockFilter === 'low') return stock <= 5 && stock > 0;
    if (stockFilter === 'out') return stock <= 0;
    if (stockFilter === 'in') return stock > 5;
    return true;
  });

  // 100% Real Stats with ZERO dummy fallbacks
  const stats = initialStats || {
    totalRevenue: 0,
    totalOrdersCount: 0,
    totalItemsSold: 0,
    avgOrderValue: 0,
    pipeline: { new: 0, packing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    channelRevenue: { card: 0, mobile: 0, cod: 0 },
    topSellers: [],
    runningLow: [],
  };

  // Pipeline calculations
  const totalPipeline =
    (stats.pipeline?.new || 0) +
    (stats.pipeline?.packing || 0) +
    (stats.pipeline?.shipped || 0) +
    (stats.pipeline?.delivered || 0);

  const newPct = totalPipeline > 0 ? ((stats.pipeline?.new || 0) / totalPipeline) * 100 : 0;
  const packPct = totalPipeline > 0 ? ((stats.pipeline?.packing || 0) / totalPipeline) * 100 : 0;
  const shipPct = totalPipeline > 0 ? ((stats.pipeline?.shipped || 0) / totalPipeline) * 100 : 0;
  const delivPct = totalPipeline > 0 ? ((stats.pipeline?.delivered || 0) / totalPipeline) * 100 : 0;

  // Real Dynamic Dates for Chart
  const realChartDates = [6, 5, 4, 3, 2, 1, 0].map((d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Filtered Activity Orders
  const activityOrders = orders.filter((order) => {
    if (activityFilter === 'Orders') return true;
    if (activityFilter === 'Stock') return false;
    if (activityFilter === 'Suppliers') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row font-sans text-slate-900">
     
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-5">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 px-2 pt-1 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-all">
              <FaShoppingCart className="text-sm" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                Super<span className="text-sky-600">Shop</span>
              </span>
              <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 rounded px-1.5 py-0.2 uppercase tracking-wider inline-block">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Search activity input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch className="text-[11px]" />
            </span>
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 border border-slate-200 px-1 py-0.2 rounded bg-white">
              ⌘K
            </span>
          </div>

          {/* Operations Group */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Operations
            </span>

            {/* 1. Overview */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <FaLayerGroup className={`text-[11px] ${activeTab === 'overview' ? 'text-white' : 'text-slate-400'}`} />
              <span>Overview</span>
            </button>

            {/* 2. Orders */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FaBoxOpen className={`text-[11px] ${activeTab === 'orders' ? 'text-white' : 'text-slate-400'}`} />
                <span>Orders</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-2xs">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* 3. Products (Add & Edit) */}
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FaBoxes className={`text-[11px] ${activeTab === 'products' ? 'text-white' : 'text-slate-400'}`} />
                <span>Products (Edit & Add)</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {products.length}
              </span>
            </button>

            {/* 4. Stock */}
            <button
              onClick={() => setActiveTab('stock')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FaWarehouse className={`text-[11px] ${activeTab === 'stock' ? 'text-white' : 'text-slate-400'}`} />
                <span>Stock</span>
              </div>
              {lowStockBadgeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-2xs">
                  {lowStockBadgeCount}
                </span>
              )}
            </button>

            {/* 5. Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <FaFileAlt className={`text-[11px] ${activeTab === 'reports' ? 'text-white' : 'text-slate-400'}`} />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FaComments className={`text-[11px] ${activeTab === 'messages' ? 'text-white' : 'text-sky-600'}`} />
                <span>Live Support Chat</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-2xs">
                Live
              </span>
            </button>
          </div>

          {/* Records Group */}
          <div className="space-y-0.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Records
            </span>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FaUsers className={`text-[11px] ${activeTab === 'users' ? 'text-white' : 'text-slate-400'}`} />
                <span>Team & roles</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{users.length}</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors"
            >
              <FaExternalLinkAlt className="text-[10px] text-slate-400" />
              <span>Go to Shop Home</span>
            </Link>
          </div>

          {/* Account Group */}
          <div className="space-y-0.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Account
            </span>

            <button
              onClick={() => setActiveTab('overview')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <FaCog className="text-[11px] text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <FaQuestionCircle className="text-[11px] text-slate-400" />
              <span>Help & support</span>
            </button>
          </div>
        </div>

        {/* Bottom Store Overview & User Pill */}
        <div className="pt-4 space-y-3">
          {/* Store Orders Summary */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-800">Store Orders</span>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-[10px] text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                View
              </button>
            </div>
            <div className="h-1.5 w-full rounded-full bg-sky-100 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-sky-500 to-indigo-600 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, (orders.length / 50) * 100))}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {orders.length} real order{orders.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {/* Profile Capsule */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-sky-200 transition-all cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-28">
                  {currentUser?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 block">Store Admin</span>
              </div>
            </div>
            <FaChevronDown className="text-[10px] text-slate-400" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (100% Real Live Database Data)
      ========================================================================== */}
      <main className="flex-1 p-4 sm:p-7 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* =====================================================================
            TAB 1: OVERVIEW (Real Store Performance)
        ====================================================================== */}
        {activeTab === 'overview' && (
          <>
            {/* Header: Title + Export & New Order */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real store orders, verified revenue, and real-time inventory levels.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-sky-600/25 cursor-pointer hover:-translate-y-0.5"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors shadow-xs cursor-pointer"
                >
                  <FaBoxes className="text-[10px] text-slate-400" />
                  <span>Products ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors shadow-xs cursor-pointer"
                >
                  <FaDownload className="text-[10px] text-slate-400" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Orders ({orders.length})</span>
                </button>

                <div className="relative">
                  <button className="h-8.5 w-8.5 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-xs">
                    <FaBell className="text-xs" />
                  </button>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* TOP ROW: Real Revenue Card (Left) + 2x2 Real Metric Cards (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Big Revenue Card with Sky Wave Chart */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Verified Revenue</h3>
                      <p className="text-[11px] text-slate-400">Total approved and paid customer orders.</p>
                    </div>

                    {/* Time Range Pills */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
                      {['7 days', '30 days', '90 days'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                            timeRange === range
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Big Number */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      ${Number(stats.totalRevenue).toLocaleString()}
                    </span>
                    {stats.totalRevenue > 0 && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                        <FaArrowUp className="text-[9px]" /> Live
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">from {orders.length} orders</span>
                  </div>
                </div>

                {/* SVG Sky Blue Wave Chart */}
                <div className="pt-4 mt-2">
                  <div className="relative h-44 w-full">
                    <svg
                      viewBox="0 0 500 150"
                      preserveAspectRatio="none"
                      className="h-full w-full overflow-visible"
                    >
                      <defs>
                        <linearGradient id="skyWaveFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path
                        d="M 0 100 Q 30 75, 60 90 T 120 70 T 180 85 T 240 60 T 300 80 T 360 45 T 420 75 T 500 40 L 500 150 L 0 150 Z"
                        fill="url(#skyWaveFill)"
                      />

                      {/* Wave Line */}
                      <path
                        d="M 0 100 Q 30 75, 60 90 T 120 70 T 180 85 T 240 60 T 300 80 T 360 45 T 420 75 T 500 40"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Tooltip Point */}
                      <circle cx="420" cy="75" r="4.5" fill="#FFFFFF" stroke="#0284c7" strokeWidth="2.5" />
                    </svg>

                    {/* Chart Marker Tooltip */}
                    <div className="absolute left-[80%] top-[40%] -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900 text-white px-2.5 py-1 text-[10px] font-bold shadow-lg pointer-events-none">
                      Live Total: ${Number(stats.totalRevenue).toLocaleString()}
                    </div>

                    {/* Real Dynamic X-Axis Dates */}
                    <div className="flex justify-between text-[10px] text-slate-400 pt-2 font-medium">
                      {realChartDates.map((dateStr, i) => (
                        <span key={i}>{dateStr}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 2x2 Real Metric Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Real Orders Count */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <FaBoxOpen className="text-sky-600 text-xs" /> Real Orders
                    </span>
                    <span className="text-slate-300 group-hover:text-sky-600 transition-colors text-xs">›</span>
                  </div>
                  <div className="my-2">
                    <span className="text-2xl font-black text-slate-900">
                      {orders.length}
                    </span>
                    <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                      <span>{pendingCount} Pending</span>
                      <span className="text-slate-400 font-normal">approval</span>
                    </div>
                  </div>
                  {/* Sky Sparkline */}
                  <div className="h-6 w-full">
                    <svg viewBox="0 0 100 24" className="h-full w-full overflow-visible">
                      <path
                        d="M 0 18 Q 25 12, 50 16 T 100 8"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* 2. Real Items Sold */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <FaLayerGroup className="text-indigo-600 text-xs" /> Items Sold
                    </span>
                    <span className="text-slate-300 group-hover:text-sky-600 transition-colors text-xs">›</span>
                  </div>
                  <div className="my-2">
                    <span className="text-2xl font-black text-slate-900">
                      {Number(stats.totalItemsSold).toLocaleString()}
                    </span>
                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span>Across all customer orders</span>
                    </div>
                  </div>
                  {/* Sky Sparkline */}
                  <div className="h-6 w-full">
                    <svg viewBox="0 0 100 24" className="h-full w-full overflow-visible">
                      <path
                        d="M 0 16 Q 30 10, 60 14 T 100 6"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* 3. Real Running Low (From actual MongoDB products) */}
                <div
                  onClick={() => setActiveTab('stock')}
                  className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs flex flex-col justify-between hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-amber-500 text-xs" /> Running Low
                    </span>
                    <span className="text-slate-300 group-hover:text-amber-600 transition-colors text-xs">›</span>
                  </div>
                  <div className="my-1.5">
                    <span className="text-2xl font-black text-slate-900">{lowStockBadgeCount}</span>
                    <p className="text-[10px] text-slate-400">
                      {outOfStockProducts.length} out of stock, {lowStockProducts.length} low stock (≤5)
                    </p>
                  </div>
                  {/* Real products stock list */}
                  <div className="space-y-1 text-[10px]">
                    {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
                      <p className="text-emerald-600 font-semibold py-1">All catalog items in stock!</p>
                    ) : (
                      [...outOfStockProducts, ...lowStockProducts].slice(0, 3).map((item) => (
                        <div key={item._id} className="flex items-center justify-between">
                          <span className="text-slate-700 truncate max-w-[65%]">{item.title}</span>
                          <span className={item.stock <= 0 ? 'font-bold text-rose-600' : 'text-amber-600 font-bold'}>
                            {item.stock <= 0 ? 'Out' : `${item.stock} left`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Real Average Order Value */}
                <div
                  onClick={() => setActiveTab('reports')}
                  className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <FaMoneyBillWave className="text-emerald-600 text-xs" /> Average Order
                    </span>
                    <span className="text-slate-300 group-hover:text-sky-600 transition-colors text-xs">›</span>
                  </div>
                  <div className="my-2">
                    <span className="text-2xl font-black text-slate-900">
                      ${stats.avgOrderValue || 0}
                    </span>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>Revenue per completed order</span>
                    </div>
                  </div>
                  {/* Sky Sparkline */}
                  <div className="h-6 w-full">
                    <svg viewBox="0 0 100 24" className="h-full w-full overflow-visible">
                      <path
                        d="M 0 15 Q 25 20, 60 12 T 100 7"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: Real Order Pipeline + Real Revenue by Channel + Real Top Sellers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Real Order Pipeline */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-800">Order Pipeline</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      All orders ({orders.length}) →
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-4">Open orders by lifecycle stage</p>

                  {/* Real Segmented Pipeline Bar */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 flex overflow-hidden gap-0.5 p-0.5 mb-4">
                    <div className="h-full bg-amber-500 rounded-l-full transition-all" style={{ width: `${newPct}%` }}></div>
                    <div className="h-full bg-sky-500 transition-all" style={{ width: `${packPct}%` }}></div>
                    <div className="h-full bg-indigo-500 transition-all" style={{ width: `${shipPct}%` }}></div>
                    <div className="h-full bg-emerald-500 rounded-r-full transition-all" style={{ width: `${delivPct}%` }}></div>
                  </div>

                  {/* Real Pipeline Counts */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span className="text-slate-600">Pending</span>
                      </div>
                      <span className="font-bold text-slate-900">{stats.pipeline?.new || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                        <span className="text-slate-600">Packing</span>
                      </div>
                      <span className="font-bold text-slate-900">{stats.pipeline?.packing || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        <span className="text-slate-600">Shipped</span>
                      </div>
                      <span className="font-bold text-slate-900">{stats.pipeline?.shipped || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-600">Delivered</span>
                      </div>
                      <span className="font-bold text-slate-900">{stats.pipeline?.delivered || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
                  {stats.pipeline?.cancelled || 0} cancelled order{stats.pipeline?.cancelled === 1 ? '' : 's'}
                </div>
              </div>

              {/* 2. Real Revenue by Channel */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-800">Revenue by Channel</h3>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Reports →
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-4">Actual revenue from orders</p>

                  {/* Real Channel Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Credit / Debit Card</span>
                        <span className="font-bold text-slate-900">
                          ${Number(stats.channelRevenue?.card || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all"
                          style={{
                            width: `${
                              stats.totalRevenue > 0
                                ? Math.min(100, Math.round(((stats.channelRevenue?.card || 0) / stats.totalRevenue) * 100))
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Mobile Banking (bKash/Nagad)</span>
                        <span className="font-bold text-slate-900">
                          ${Number(stats.channelRevenue?.mobile || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{
                            width: `${
                              stats.totalRevenue > 0
                                ? Math.min(100, Math.round(((stats.channelRevenue?.mobile || 0) / stats.totalRevenue) * 100))
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Cash on Delivery</span>
                        <span className="font-bold text-slate-900">
                          ${Number(stats.channelRevenue?.cod || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{
                            width: `${
                              stats.totalRevenue > 0
                                ? Math.min(100, Math.round(((stats.channelRevenue?.cod || 0) / stats.totalRevenue) * 100))
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Real Top Sellers from Database Orders */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-800">Top Sellers</h3>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Products Catalog →
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3">Ranked by actual units sold</p>

                  <div className="space-y-2.5">
                    {stats.topSellers && stats.topSellers.length > 0 ? (
                      stats.topSellers.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 max-w-[65%]">
                            <span className="text-sky-600 text-[10px] font-black w-3">{idx + 1}</span>
                            <span className="text-slate-800 font-semibold truncate">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">{item.units} sold</span>
                            <span className="text-[10px] text-slate-400">${Number(item.revenue).toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No product sales recorded yet. As orders are placed, top selling products will appear here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: Real Orders Activity Table with Approve & Cancel */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Recent Activity & Orders</h3>
                  <p className="text-xs text-slate-400">
                    All customer orders start as <span className="text-amber-600 font-semibold">Pending</span>. Click <strong>Approve</strong> to verify payment or <strong>Cancel</strong> to reject.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
                  {['All', 'Orders'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        activityFilter === f
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">When</th>
                      <th className="py-2.5 px-3">Order Information</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activityOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                          No customer orders placed yet. When an order is submitted, it will appear here as <strong>Pending</strong> for your approval.
                        </td>
                      </tr>
                    ) : (
                      activityOrders.map((order) => {
                        const isPending =
                          order.orderStatus === 'Pending' ||
                          order.paymentStatus?.toLowerCase().includes('pending') ||
                          order.paymentStatus?.toLowerCase().includes('awaiting');

                        const isCancelled = order.orderStatus === 'Cancelled';
                        const isLoading = actionLoadingId === order._id;

                        const timeAgo = order.createdAt
                          ? `${Math.max(
                              1,
                              Math.round(
                                (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
                              )
                            )} min ago`
                          : 'Just now';

                        return (
                          <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                              {timeAgo}
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800">
                                Order #{order._id?.slice(-6)}
                              </span>
                              <span className="text-slate-500 ml-1.5 block sm:inline">
                                ({order.items?.length || 1} items • ${Number(order.grandTotal).toFixed(2)})
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800 block">
                                {order.userName || 'Customer'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {order.userEmail}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  order.paymentStatus?.toLowerCase().includes('paid')
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {order.paymentStatus || 'Pending'}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3 px-3">
                              {isPending ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                  Pending Approval
                                </span>
                              ) : isCancelled ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                  Cancelled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                                  {order.orderStatus}
                                </span>
                              )}
                            </td>

                            {/* Admin Approve & Cancel Actions */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* 1. APPROVE PAYMENT BUTTON */}
                                {isPending && (
                                  <button
                                    onClick={() => handleApprovePayment(order._id)}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                    title="Approve Order Payment"
                                  >
                                    {isLoading ? (
                                      <FaSpinner className="animate-spin text-[10px]" />
                                    ) : (
                                      <FaCheck className="text-[10px]" />
                                    )}
                                    <span>Approve</span>
                                  </button>
                                )}

                                {/* 2. CANCEL ORDER BUTTON */}
                                {!isCancelled && (
                                  <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                    title="Cancel Order"
                                  >
                                    <FaTimes className="text-[10px]" />
                                    <span>Cancel</span>
                                  </button>
                                )}

                                {/* Lifecycle dropdown */}
                                {!isCancelled && !isPending && (
                                  <select
                                    value={order.orderStatus}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(order._id, e.target.value)
                                    }
                                    className="rounded-lg border border-slate-200 bg-white py-1 px-1.5 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-sky-500"
                                  >
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Packing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* =====================================================================
            TAB 2: FULL ORDERS LIST (100% Real Orders from Database)
        ====================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Orders List ({orders.length})</h2>
                <p className="text-xs text-slate-500">
                  Every order submitted by users is listed here with live payment status and admin actions.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                ← Back to Overview
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                        No orders recorded yet. Place an order on the checkout page to see it appear here.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const isPending =
                        order.orderStatus === 'Pending' ||
                        order.paymentStatus?.toLowerCase().includes('pending') ||
                        order.paymentStatus?.toLowerCase().includes('awaiting');
                      const isCancelled = order.orderStatus === 'Cancelled';
                      const isLoading = actionLoadingId === order._id;

                      return (
                        <tr key={order._id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            #{order._id?.slice(-6)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{order.userName || 'Customer'}</span>
                            <span className="text-[10px] text-slate-400">{order.userEmail}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {order.items?.length || 1} items
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900">
                            ${Number(order.grandTotal).toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.paymentStatus?.toLowerCase().includes('paid')
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCancelled
                                  ? 'bg-rose-50 text-rose-700'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <button
                                  onClick={() => handleApprovePayment(order._id)}
                                  disabled={isLoading}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {!isCancelled && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={isLoading}
                                  className="border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: STOCK & INVENTORY MANAGEMENT (Real Database Products)
        ====================================================================== */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Stock & Inventory Management</h2>
                <p className="text-xs text-slate-500">
                  Live stock levels, restock alerts, and threshold tracking for all store products.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-sky-600/25 cursor-pointer hover:-translate-y-0.5"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors shadow-xs cursor-pointer"
                >
                  <FaBoxes className="text-[10px] text-slate-400" />
                  <span>Products Catalog ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ← Back to Overview
                </button>
              </div>
            </div>

            {/* 4 Metric Cards for Stock */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total SKUs
                  </span>
                  <FaBoxes className="text-xs text-sky-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{products.length}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Active products in catalog</p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Units
                  </span>
                  <FaWarehouse className="text-xs text-sky-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalStockUnits}</div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Physical items on shelf
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Running Low (≤ 5)
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {lowStockProducts.length}
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-600">{lowStockProducts.length}</div>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Needs supplier reorder
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Inventory Value
                  </span>
                  <FaMoneyBillWave className="text-xs text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ${totalStockValuation.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Retail inventory valuation</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stockFilter === 'all'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stockFilter === 'low'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Low Stock ({lowStockProducts.length})
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stockFilter === 'out'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Out of Stock ({outOfStockProducts.length})
                </button>
                <button
                  onClick={() => setStockFilter('in')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stockFilter === 'in'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Healthy Stock
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search product or category..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors w-full sm:w-64"
                />
              </div>
            </div>

            {/* Stock Table */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Current Stock</th>
                    <th className="py-3 px-3 text-right">Adjust Stock & Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const currentStock = Number(p.stock || 0);
                    const draftStock =
                      stockUpdates[p._id] !== undefined
                        ? stockUpdates[p._id]
                        : currentStock;
                    const isSaving = actionLoadingId === p._id;

                    const isLow = currentStock <= 5 && currentStock > 0;
                    const isOut = currentStock <= 0;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.title || 'Product'}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-bold border border-slate-200 shrink-0">
                                📦
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block max-w-xs truncate">
                                {p.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.unit || 'Standard Unit'} {p.brand ? `• ${p.brand}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                            {p.category || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900">
                          ${Number(p.price || 0).toFixed(2)}
                        </td>

                        <td className="py-3 px-3">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              Low Stock ({currentStock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                              In Stock ({currentStock})
                            </span>
                          )}
                        </td>

                        {/* Interactive Stepper & Input */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                            <button
                              onClick={() => handleAdjustStock(p._id, currentStock, -1)}
                              className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] cursor-pointer"
                            >
                              <FaMinus />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={draftStock}
                              onChange={(e) => handleStockInputChange(p._id, e.target.value)}
                              className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => handleAdjustStock(p._id, currentStock, +1)}
                              className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] cursor-pointer"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </td>

                        {/* Save Stock & Edit Button */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveStock(p._id, currentStock)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1.5 text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              title="Save Stock"
                            >
                              {isSaving ? (
                                <FaSpinner className="animate-spin text-[10px]" />
                              ) : (
                                <FaSave className="text-[10px]" />
                              )}
                              <span>Save</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-700 px-2.5 py-1.5 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                              title="Edit Full Product Details"
                            >
                              <FaEdit className="text-[10px] text-sky-600" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: REPORTS & FINANCIAL ANALYTICS (Real Numbers)
        ====================================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Store Reports & Financial Analytics</h2>
                <p className="text-xs text-slate-500">
                  Real revenue by channel, actual order fulfillment rates, and sales metrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors cursor-pointer"
                >
                  <FaDownload className="text-[10px] text-slate-400" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* 4 Financial KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Gross Sales
                </span>
                <div className="text-2xl font-black text-slate-900">
                  ${Number(stats.totalRevenue).toLocaleString()}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                  from {orders.length} orders
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Estimated Profit
                </span>
                <div className="text-2xl font-black text-emerald-600">
                  ${Math.round(Number(stats.totalRevenue) * 0.32).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                  32% estimated margin
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Average Order (AOV)
                </span>
                <div className="text-2xl font-black text-slate-900">${stats.avgOrderValue || 0}</div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                  per customer order
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Fulfillment Status
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {stats.pipeline?.delivered || 0} Delivered
                </div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                  {pendingCount} awaiting approval
                </span>
              </div>
            </div>

            {/* Channels & Payment Method Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FaCreditCard className="text-sky-600" />
                    <span>Real Revenue by Payment Method</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">Amount</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">
                        Credit / Debit Card (Stripe)
                      </span>
                      <span className="font-bold text-slate-900">
                        ${Number(stats.channelRevenue?.card || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-600 rounded-full transition-all"
                        style={{
                          width: `${
                            stats.totalRevenue > 0
                              ? Math.min(100, Math.round(((stats.channelRevenue?.card || 0) / stats.totalRevenue) * 100))
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">
                        Mobile Banking (bKash, Nagad, Rocket)
                      </span>
                      <span className="font-bold text-slate-900">
                        ${Number(stats.channelRevenue?.mobile || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{
                          width: `${
                            stats.totalRevenue > 0
                              ? Math.min(100, Math.round(((stats.channelRevenue?.mobile || 0) / stats.totalRevenue) * 100))
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">
                        Cash on Delivery (Pay upon receipt)
                      </span>
                      <span className="font-bold text-slate-900">
                        ${Number(stats.channelRevenue?.cod || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{
                          width: `${
                            stats.totalRevenue > 0
                              ? Math.min(100, Math.round(((stats.channelRevenue?.cod || 0) / stats.totalRevenue) * 100))
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Funnel & Conversion */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FaTruck className="text-sky-600" />
                    <span>Real Orders by Status</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">Stage</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Pending Admin Approval</span>
                    <span className="font-black text-amber-600">
                      {pendingCount} orders
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Confirmed / Packing Phase</span>
                    <span className="font-black text-slate-900">{stats.pipeline?.packing || 0} orders</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Shipped with Courier</span>
                    <span className="font-black text-slate-900">{stats.pipeline?.shipped || 0} orders</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Completed Deliveries</span>
                    <span className="font-black text-emerald-600">{stats.pipeline?.delivered || 0} orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: TEAM & ROLES (100% Real Users from MongoDB)
        ====================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Team & Roles ({users.length})</h2>
                <p className="text-xs text-slate-500">
                  Anyone can sign up as a User, but you can promote any user to an Admin role from
                  here.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                ← Back to Overview
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Current Role</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin';
                    const isLoading = actionLoadingId === u._id;

                    return (
                      <tr key={u._id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{u.name || 'User'}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{u.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isAdmin
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role Toggle Button */}
                            <button
                              onClick={() => handleToggleUserRole(u._id, u.role)}
                              disabled={isLoading}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isAdmin
                                  ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs'
                              }`}
                            >
                              {isLoading ? (
                                <FaSpinner className="animate-spin text-xs" />
                              ) : isAdmin ? (
                                'Demote to User'
                              ) : (
                                'Promote to Admin'
                              )}
                            </button>

                            {/* Delete User Button */}
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name, u.email)}
                              disabled={isLoading || u.email === currentUser?.email}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title={
                                u.email === currentUser?.email
                                  ? 'You cannot delete your own logged-in admin account'
                                  : 'Delete User'
                              }
                            >
                              <FaTrash className="text-[10px]" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 6: PRODUCTS CATALOG & MANAGEMENT (Add, Edit, Categorize)
        ====================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header + Add Product Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <FaBoxes className="text-sky-600" />
                  <span>Products Catalog ({products.length})</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add new items, edit pricing/discounts, create categories, and publish products live to the Home page.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-sky-600/25 cursor-pointer hover:-translate-y-0.5"
                >
                  <FaPlus className="text-xs" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Products
                </span>
                <div className="text-2xl font-black text-slate-900">{products.length}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Live in store catalog</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Categories
                </span>
                <div className="text-2xl font-black text-indigo-600">{existingCategories.length}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Dynamic collections</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Units in Stock
                </span>
                <div className="text-2xl font-black text-emerald-600">{totalStockUnits}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Available inventory</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Catalog Valuation
                </span>
                <div className="text-2xl font-black text-slate-900">${totalStockValuation.toLocaleString()}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Retail inventory worth</span>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  <button
                    onClick={() => setProductCategoryFilter('All')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      productCategoryFilter === 'All'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {existingCategories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setProductCategoryFilter(cat)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          productCategoryFilter === cat
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative shrink-0">
                  <FaSearch className="text-slate-400 text-xs absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full sm:w-60 rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price &amp; Discount</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3">Featured</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogFilteredProducts.map((p) => {
                    const finalPrice =
                      p.discount > 0
                        ? Math.round(Number(p.price) - (Number(p.price) * Number(p.discount)) / 100)
                        : Number(p.price);

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-xs text-xs">
                                {p.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Unit: {p.unit || 'piece'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold uppercase tracking-wider">
                            {p.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900">${finalPrice}</span>
                            {p.discount > 0 && (
                              <>
                                <span className="text-[10px] text-slate-400 line-through">${p.price}</span>
                                <span className="text-[10px] text-red-500 font-bold">-{p.discount}%</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stock <= 0
                                ? 'bg-red-100 text-red-700'
                                : p.stock <= 5
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {p.featured ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <FaStar className="text-[9px]" />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Standard</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-xs"
                            >
                              <FaEdit className="text-[10px]" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p._id, p.title)}
                              disabled={actionLoadingId === p._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                              title="Delete Product"
                            >
                              <FaTrash className="text-[10px]" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <AdminLiveChatView
              onNavigateToOrders={(email) => {
                setSearchQuery(email);
                setActiveTab('orders');
              }}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          ADD / EDIT PRODUCT MODAL (With Category Creation & Image Presets)
      ========================================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FaBoxes className="text-sky-600" />
                  <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingProduct
                    ? 'Update product details, pricing, discount, and category.'
                    : 'Publish a new product directly to the store and Home page.'}
                </p>
              </div>

              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* 1. Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Rose & Lavender Facial Serum"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>

              {/* 2. Category Dropdown & Custom Category Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
                  >
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="NEW_CATEGORY">➕ Add New Category...</option>
                  </select>
                </div>

                {/* If NEW_CATEGORY selected, show text input */}
                {productForm.category === 'NEW_CATEGORY' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sky-700 block">
                      New Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Organic Beverages / Snacks"
                      value={productForm.customCategory}
                      onChange={(e) => setProductForm({ ...productForm, customCategory: e.target.value })}
                      className="w-full rounded-xl border border-sky-300 bg-sky-50/40 px-3.5 py-2.5 text-xs font-bold text-sky-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Unit Specification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 250 ml, 500 g, 1 pack, piece"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* 3. Price, Discount, and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 850"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                  />
                  {Number(productForm.discount) > 0 && Number(productForm.price) > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Final: ${Math.round(Number(productForm.price) - (Number(productForm.price) * Number(productForm.discount)) / 100)}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* 4. Image URL with Live Preview & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Product Image URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500 transition-all"
                  />
                  {/* Live Thumbnail Preview */}
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FaImage className="text-slate-400 text-xs" />
                    )}
                  </div>
                </div>

                {/* Quick Presets for Fast Testing */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Quick presets:</span>
                  {sampleImagePresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image: preset.url })}
                      className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition-all cursor-pointer font-medium"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the product benefits, organic ingredients, and usage instructions..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500 transition-all resize-none"
                />
              </div>

              {/* 6. Featured Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FaStar className="text-amber-500 text-xs" />
                    <span>Feature on Home Page</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Highlight this item in the Featured &amp; Trending section on the Home page.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="checkbox checkbox-sm checkbox-info rounded-lg cursor-pointer"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  disabled={isSavingProduct}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/25 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProduct ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-xs" />
                      <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
