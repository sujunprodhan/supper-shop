'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaTrash,
  FaTag,
  FaSync,
  FaShoppingBag,
  FaCheckCircle,
  FaTimes,
  FaCircle,
  FaPercentage,
} from 'react-icons/fa';
import {
  getAllConversationsAdmin,
  getConversationDetailsAdmin,
  sendMessageFromAdmin,
  deleteConversationAdmin,
} from '@/actions/server/liveChat';
import { toast } from 'sonner';

const ChatAvatar = ({
  name = 'User',
  image = '',
  size = 'w-10 h-10',
  textSize = 'text-sm',
  isOnline = false,
  showStatus = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const initial = (name || 'U').trim()[0]?.toUpperCase() || 'U';

  return (
    <div className={`relative shrink-0 ${size} ${className}`}>
      {image && !imgError ? (
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImgError(true)}
          className={`${size} rounded-full object-cover shadow-2xs border border-slate-200/80 bg-slate-100`}
        />
      ) : (
        <div
          className={`${size} rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center ${textSize} shadow-2xs border border-white/40`}
        >
          {initial}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white transition-colors duration-300 ${
            isOnline
              ? 'bg-emerald-500 ring-1 ring-emerald-500/30'
              : 'bg-slate-400 ring-1 ring-slate-400/30'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default function AdminLiveChatView({ onNavigateToOrders }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [userOrderSummary, setUserOrderSummary] = useState(null);
  const [adminProfile, setAdminProfile] = useState({ name: 'Store Admin', image: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [customDiscountCode, setCustomDiscountCode] = useState('SPECIAL10');
  const [customDiscountPercent, setCustomDiscountPercent] = useState('10');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const loadConversations = async (silent = false) => {
    if (!silent) setIsLoadingList(true);
    try {
      const res = await getAllConversationsAdmin();
      if (res.success) {
        setConversations(res.conversations || []);
        if (!selectedConvId && res.conversations?.length > 0) {
          setSelectedConvId(res.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      if (!silent) setIsLoadingList(false);
    }
  };

  const loadActiveConversation = async (convId, silent = false) => {
    if (!convId) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await getConversationDetailsAdmin(convId);
      if (res.success) {
        setActiveConv(res.conversation);
        setUserOrderSummary(res.orderSummary || null);
        if (res.adminProfile) {
          setAdminProfile(res.adminProfile);
        }

        setConversations((prev) =>
          prev.map((c) =>
            c._id === convId
              ? {
                  ...c,
                  unreadByAdmin: 0,
                  isUserOnline: res.conversation.isUserOnline,
                  userAvatar: res.conversation.userAvatar || c.userAvatar,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadActiveConversation(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations(true);
      if (selectedConvId) {
        loadActiveConversation(selectedConvId, true);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [selectedConvId]);

  const handleSendMessage = async (textToSend, discountCode = '', discountPercent = null) => {
    const text = (textToSend || messageText).trim();
    if (!text || !selectedConvId || isSending) return;

    setIsSending(true);
    try {
      const res = await sendMessageFromAdmin({
        conversationId: selectedConvId,
        text,
        discountCode,
        discountPercent,
      });

      if (res.success) {
        setActiveConv(res.conversation);
        setMessageText('');
        setDiscountModalOpen(false);
        loadConversations(true);
      } else {
        toast.error(res.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat conversation?')) return;

    try {
      const res = await deleteConversationAdmin(convId);
      if (res.success) {
        toast.success('Conversation deleted');
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (selectedConvId === convId) {
          const remaining = conversations.filter((c) => c._id !== convId);
          setSelectedConvId(remaining.length > 0 ? remaining[0]._id : null);
          setActiveConv(null);
        }
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting conversation');
    }
  };

  const quickReplies = [
    {
      label: '🚚 Delivery Policy',
      text: 'Our standard delivery takes 2 to 3 business days across Bangladesh ($15, or FREE on orders over $100). Express 24h delivery is available in Dhaka for $25.',
    },
    {
      label: '💳 Cash on Delivery',
      text: 'Yes! Cash on Delivery (COD) is available. You can check the parcel upon delivery and pay the delivery agent in cash.',
    },
    {
      label: '🎟️ Give 10% Discount',
      action: () =>
        handleSendMessage(
          'Here is a special 10% discount for you! Use coupon code SUPPER10 at checkout.',
          'SUPPER10',
          '10'
        ),
    },
    {
      label: '🎟️ Give 15% VIP Discount',
      action: () =>
        handleSendMessage(
          'We appreciate having you with us! Enjoy an exclusive 15% discount with coupon VIP15.',
          'VIP15',
          '15'
        ),
    },
  ];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      (c.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'unread') return (c.unreadByAdmin || 0) > 0;
    return true;
  });

  const totalUnreadCount = conversations.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col h-[750px]">
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-lg shadow-sm">
            <FaComments />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Live Customer Support
              {totalUnreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                  {totalUnreadCount} unread
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Real-time two-way chat with shoppers. Discuss price, offer discounts & guide delivery.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            loadConversations();
            if (selectedConvId) loadActiveConversation(selectedConvId);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-sky-600 hover:border-sky-200 transition-colors cursor-pointer shadow-2xs"
        >
          <FaSync className={`text-[11px] ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-200/80 flex flex-col bg-slate-50/30">
          <div className="p-3 border-b border-slate-200/80 space-y-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search customers or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setFilterMode('unread')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'unread'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Unread ({totalUnreadCount})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <FaComments className="text-3xl text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No conversations found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  When customers start a live chat on the website, they will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv._id === selectedConvId;
                const unread = conv.unreadByAdmin || 0;
                const isOnline = !!conv.isUserOnline;
                const timeStr = conv.lastMessageAt
                  ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConvId(conv._id)}
                    className={`p-3 transition-colors cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-sky-50/70 border-l-4 border-sky-500'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ChatAvatar
                        name={conv.userName}
                        image={conv.userAvatar}
                        size="w-10 h-10"
                        isOnline={isOnline}
                        showStatus={true}
                      />

                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs truncate ${
                              unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                            }`}
                          >
                            {conv.userName || 'Shopper'}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">{timeStr}</span>
                        </div>

                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            unread > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {conv.lastSender === 'admin' ? (
                            <span className="text-sky-600 font-medium">You: </span>
                          ) : null}
                          {conv.lastMessage || 'Started conversation'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                          {unread}
                        </span>
                      )}
                      <button
                        title="Delete chat"
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <FaTrash className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              <div className="px-5 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <ChatAvatar
                    name={activeConv.userName}
                    image={activeConv.userAvatar}
                    size="w-10 h-10"
                    isOnline={!!activeConv.isUserOnline}
                    showStatus={true}
                  />

                  <div>
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      {activeConv.userName || 'Shopper'}
                      {activeConv.isUserOnline ? (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <FaCircle className="text-[6px] text-emerald-500" /> Active Now
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <FaCircle className="text-[6px] text-slate-400" /> Offline
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">{activeConv.userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {userOrderSummary && userOrderSummary.totalOrders > 0 ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                      <FaShoppingBag className="text-[10px]" />
                      {userOrderSummary.totalOrders} Orders (${userOrderSummary.totalSpent.toFixed(2)})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">
                      Prospective Customer
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                <div className="text-center my-2">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-500 shadow-2xs">
                    Live Chat Started with {activeConv.userName}
                  </span>
                </div>

                {(activeConv.messages || []).map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  const time = msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  const avatarSrc = isAdmin
                    ? msg.senderAvatar || adminProfile.image
                    : msg.senderAvatar || activeConv.userAvatar;
                  const senderDisplayName = isAdmin ? adminProfile.name || 'Store Admin' : activeConv.userName;

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-2.5 max-w-[80%] ${
                        isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <ChatAvatar
                        name={senderDisplayName}
                        image={avatarSrc}
                        size="w-8 h-8"
                        textSize="text-[10px]"
                        showStatus={false}
                        className="mt-1"
                      />

                      <div className="space-y-1">
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                            isAdmin
                              ? 'bg-sky-600 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {msg.discountOffer && (
                            <div className="mt-2 p-2 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-between gap-3 text-[11px] font-bold">
                              <span className="flex items-center gap-1.5">
                                <FaTag /> Code: {msg.discountOffer.code}
                              </span>
                              <span className="bg-white text-sky-700 px-2 py-0.5 rounded-md text-[10px]">
                                {msg.discountOffer.percent}% OFF
                              </span>
                            </div>
                          )}

                          {msg.productRef && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-2 text-xs">
                              {msg.productRef.image && (
                                <Image
                                  src={msg.productRef.image}
                                  alt={msg.productRef.title}
                                  width={36}
                                  height={36}
                                  className="w-9 h-9 rounded-lg object-cover"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold truncate">{msg.productRef.title}</p>
                                <p className="text-sky-600 font-bold">${msg.productRef.price}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div
                          className={`text-[10px] text-slate-400 px-1 flex items-center gap-1 ${
                            isAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{time}</span>
                          {isAdmin && <FaCheckCircle className="text-[9px] text-sky-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-2 border-t border-slate-200/80 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  Quick Replies:
                </span>
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (qr.action) {
                        qr.action();
                      } else {
                        handleSendMessage(qr.text);
                      }
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-slate-200/80 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    title="Give custom discount coupon"
                    onClick={() => setDiscountModalOpen(true)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 text-slate-500 text-xs transition-colors cursor-pointer"
                  >
                    <FaPercentage />
                  </button>

                  <input
                    type="text"
                    placeholder={`Reply to ${activeConv.userName || 'customer'}... (Press Enter)`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <FaPaperPlane className="text-[11px]" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl text-slate-400 mb-3 shadow-inner">
                <FaComments />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Choose a customer from the left list to view their messages, guide them on pricing & delivery, or provide custom discounts.
              </p>
            </div>
          )}
        </div>

        {activeConv && (
          <div className="w-72 border-l border-slate-200/80 bg-slate-50/40 p-4 flex flex-col justify-between hidden lg:flex">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-slate-200/80">
                <div className="flex justify-center mb-2">
                  <ChatAvatar
                    name={activeConv.userName}
                    image={activeConv.userAvatar}
                    size="w-16 h-16"
                    textSize="text-xl"
                    isOnline={!!activeConv.isUserOnline}
                    showStatus={true}
                  />
                </div>
                <h4 className="text-sm font-bold text-slate-800">{activeConv.userName}</h4>
                <p className="text-xs text-slate-500">{activeConv.userEmail}</p>

                {activeConv.isUserOnline ? (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <FaCircle className="text-[6px] text-emerald-500" /> Active Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                    <FaCircle className="text-[6px] text-slate-400" /> Offline
                  </span>
                )}
              </div>

              <div>
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Purchase History
                </h5>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Orders:</span>
                    <span className="font-bold text-slate-800">
                      {userOrderSummary?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Spent:</span>
                    <span className="font-bold text-emerald-600">
                      ${userOrderSummary?.totalSpent ? userOrderSummary.totalSpent.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  {userOrderSummary?.lastOrder && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Latest Order:</span>
                        <span className="font-bold text-sky-600">
                          #{userOrderSummary.lastOrder.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Status:</span>
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-sky-50 text-sky-700">
                          {userOrderSummary.lastOrder.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {onNavigateToOrders && userOrderSummary?.totalOrders > 0 && (
                <button
                  onClick={() => onNavigateToOrders(activeConv.userEmail)}
                  className="w-full py-2 px-3 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FaShoppingBag className="text-[10px]" />
                  <span>View All Orders for Customer</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center border-t border-slate-200/80 pt-3">
              SupperShop Live Support Console
            </div>
          </div>
        )}
      </div>

      {discountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FaPercentage className="text-amber-500" />
                Give Customer Discount Coupon
              </h3>
              <button
                onClick={() => setDiscountModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Generate an exclusive discount coupon and attach it directly to this chat message.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={customDiscountCode}
                  onChange={(e) => setCustomDiscountCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-bold uppercase rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
                  placeholder="e.g. SPECIAL10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={customDiscountPercent}
                  onChange={(e) => setCustomDiscountPercent(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDiscountModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSendMessage(
                    `We are happy to offer you a special ${customDiscountPercent}% discount! Apply coupon code ${customDiscountCode} at checkout.`,
                    customDiscountCode,
                    customDiscountPercent
                  );
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
