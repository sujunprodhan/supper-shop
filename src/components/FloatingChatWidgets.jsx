'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  FaWhatsapp,
  FaTimes,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaTag,
  FaExternalLinkAlt,
  FaCircle,
  FaHeadset,
  FaSync,
} from 'react-icons/fa';
import { getUserConversation, sendMessageFromUser } from '@/actions/server/liveChat';
import { toast } from 'sonner';

const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801800123456';

function BubbleAvatar({ isUser, name, image }) {
  const [hasError, setHasError] = useState(false);
  const initial = (name || (isUser ? 'U' : 'A')).trim()[0]?.toUpperCase() || (isUser ? 'U' : 'A');

  if (image && !hasError) {
    return (
      <img
        src={image}
        alt={name || 'Avatar'}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }

  return (
    <div
      className={`w-full h-full text-white font-bold flex items-center justify-center text-[10px] rounded-full ${
        isUser
          ? 'bg-gradient-to-tr from-slate-700 to-slate-900'
          : 'bg-gradient-to-tr from-sky-600 to-indigo-700'
      }`}
    >
      {initial}
    </div>
  );
}

export default function FloatingChatWidgets() {
  const { data: session } = useSession();
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: 'Store Admin', image: '' });
  const [guestId, setGuestId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSettingGuest, setIsSettingGuest] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let gid = localStorage.getItem('suppershop_guest_id');
      if (!gid) {
        gid = 'guest_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('suppershop_guest_id', gid);
      }
      setGuestId(gid);

      const savedName = localStorage.getItem('suppershop_guest_name');
      const savedEmail = localStorage.getItem('suppershop_guest_email');
      if (savedName) setGuestName(savedName);
      if (savedEmail) setGuestEmail(savedEmail);
    }
  }, []);

  const activeEmail = session?.user?.email || guestEmail;
  const activeName = session?.user?.name || guestName || 'Shopper';
  const activeAvatar = session?.user?.image || '';

  const fetchConversation = async (silent = false) => {
    if (!activeEmail && !guestId) return;
    if (!silent) setIsLoadingChat(true);

    try {
      const res = await getUserConversation(activeEmail, guestId);
      if (res.success && res.conversation) {
        setMessages(res.conversation.messages || []);
        setIsAdminOnline(!!res.conversation.isAdminOnline);
        if (res.conversation.adminInfo) {
          setAdminInfo(res.conversation.adminInfo);
        }
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    } finally {
      if (!silent) setIsLoadingChat(false);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      fetchConversation();
    }
  }, [isChatOpen, activeEmail, guestId]);

  useEffect(() => {
    if (!isChatOpen) return;

    const timer = setInterval(() => {
      fetchConversation(true);
    }, 3500);

    return () => clearInterval(timer);
  }, [isChatOpen, activeEmail, guestId]);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    if (!session?.user?.email && !guestName && !isSettingGuest) {
      setIsSettingGuest(true);
    }

    setIsSending(true);
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      senderName: activeName,
      senderAvatar: activeAvatar,
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue('');

    try {
      const res = await sendMessageFromUser({
        userEmail: activeEmail,
        userName: activeName,
        userAvatar: activeAvatar,
        guestId,
        text,
      });

      if (res.success && res.conversation) {
        setMessages(res.conversation.messages || []);
        setIsAdminOnline(!!res.conversation.isAdminOnline);
      } else {
        toast.error(res.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Network error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const handleLaunchWhatsApp = (customText) => {
    const textToSend =
      customText || waMessage || 'Hello SupperShop! I have a question about product pricing and delivery.';
    const cleanNumber = DEFAULT_WHATSAPP_NUMBER.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveGuestInfo = (e) => {
    e.preventDefault();
    if (guestName) localStorage.setItem('suppershop_guest_name', guestName);
    if (guestEmail) localStorage.setItem('suppershop_guest_email', guestEmail);
    setIsSettingGuest(false);
    toast.success('Your information is saved for live chat!');
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const quickTopics = [
    '💰 Can I get a special discount on my order?',
    '🚚 How long will delivery take to my area?',
    '💳 Is Cash on Delivery (COD) available?',
    '📦 Do you have organic skincare items in stock?',
  ];

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        <button
          onClick={() => {
            setIsChatOpen((prev) => !prev);
            setIsWhatsAppOpen(false);
          }}
          aria-label="Open Live Chat Support with Admin"
          className="group relative flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-sky-600 text-white px-4 py-3 shadow-xl hover:shadow-sky-500/30 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:scale-105"
        >
          <div className="relative">
            <FaHeadset className="text-lg" />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 transition-colors ${
                isAdminOnline ? 'bg-emerald-400' : 'bg-slate-400'
              }`}
            />
          </div>
          <span className="text-xs font-bold tracking-wide">Live Support</span>
          <span
            className={`hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
              isAdminOnline
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isAdminOnline ? 'Online' : 'Live'}
          </span>
        </button>

        <button
          onClick={() => {
            setIsWhatsAppOpen((prev) => !prev);
            setIsChatOpen(false);
          }}
          aria-label="Connect on WhatsApp"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-[#25D366]/40 hover:scale-110 transition-all duration-300 cursor-pointer"
        >
          <FaWhatsapp className="text-2xl" />
          <span className="absolute right-14 whitespace-nowrap rounded-xl bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md">
            WhatsApp Admin
          </span>
        </button>
      </div>

      {isChatOpen && (
        <div className="fixed bottom-22 right-5 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh] rounded-3xl bg-white border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center text-lg font-bold shadow-sm overflow-hidden border border-white/20">
                  {adminInfo.image ? (
                    <img
                      src={adminInfo.image}
                      alt={adminInfo.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaHeadset />
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 transition-colors ${
                    isAdminOnline ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}
                  title={isAdminOnline ? 'Admin is Online' : 'Admin is Offline'}
                />
              </div>

              <div>
                <h3 className="text-xs font-bold flex items-center gap-2">
                  <span>SupperShop Store Support</span>
                </h3>
                {isAdminOnline ? (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                    <FaCircle className="text-[6px] text-emerald-400" />
                    <span>Admin is Online • Live Reply</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                    <FaCircle className="text-[6px] text-slate-400" />
                    <span>Admin is Offline • Leave a message</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchConversation()}
                title="Refresh conversation"
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <FaSync className={isLoadingChat ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="bg-sky-50 px-3.5 py-2 border-b border-sky-100 flex items-center justify-between text-[11px] text-sky-800 shrink-0">
            <span>💬 Chat directly with store admin about prices, discounts & delivery</span>
            {!session?.user && (
              <button
                onClick={() => setIsSettingGuest((prev) => !prev)}
                className="font-bold underline text-sky-900 hover:text-sky-700 ml-2 shrink-0 cursor-pointer"
              >
                {guestName ? guestName : 'Set Name'}
              </button>
            )}
          </div>

          {isSettingGuest && (
            <form
              onSubmit={handleSaveGuestInfo}
              className="p-3 bg-amber-50/70 border-b border-amber-200 text-xs space-y-2 shrink-0 animate-in fade-in"
            >
              <div className="flex justify-between items-center text-amber-900 font-bold text-[11px]">
                <span>Identify yourself so admin knows who you are:</span>
                <button
                  type="button"
                  onClick={() => setIsSettingGuest(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>Welcome to SupperShop Live Support!</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Need a discount, product price confirmation, or have questions about delivery time across Bangladesh?
                Send us a message below and our team will assist you right away.
              </p>
            </div>

            {messages.length === 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Common Topics:
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickTopics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(topic)}
                      className="text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-xs font-medium text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isAdmin = msg.sender === 'admin';
              const time = msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              const userImg = session?.user?.image || msg.senderAvatar;
              const adminImg = msg.senderAvatar || adminInfo.image;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2 max-w-[85%] ${
                    isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden shadow-2xs mt-1 border border-slate-200 bg-slate-100 flex items-center justify-center">
                    <BubbleAvatar
                      isUser={!isAdmin}
                      name={isAdmin ? (adminInfo.name || 'Admin') : activeName}
                      image={isAdmin ? adminImg : userImg}
                    />
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                        isAdmin
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                          : 'bg-slate-900 text-white rounded-tr-none'
                      }`}
                    >
                      {isAdmin && (
                        <div className="text-[10px] font-bold text-sky-600 mb-1 flex items-center gap-1">
                          <span>Store Admin</span>
                          <FaCheckCircle className="text-[9px]" />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.discountOffer && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="flex items-center gap-1.5">
                              <FaTag className="text-amber-600" />
                              Exclusive Discount!
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px]">
                              {msg.discountOffer.percent}% OFF
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <code className="font-mono font-bold bg-white px-2 py-1 rounded border border-amber-300 text-xs">
                              {msg.discountOffer.code}
                            </code>
                            <button
                              onClick={() => handleCopyCoupon(msg.discountOffer.code)}
                              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              {copiedCode === msg.discountOffer.code ? 'Copied!' : 'Copy Code'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`text-[10px] text-slate-400 px-1 flex items-center gap-1 ${
                        isAdmin ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{time}</span>
                      {!isAdmin && <FaCheckCircle className="text-[9px] text-sky-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about price, discount, delivery..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSending}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isSending ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <>
                    <FaPaperPlane className="text-xs" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {isWhatsAppOpen && (
        <div className="fixed bottom-22 right-5 z-50 w-[92vw] sm:w-[360px] rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-2xl text-[#25D366]">
                <FaWhatsapp />
              </div>
              <div>
                <h4 className="font-bold text-sm">WhatsApp Admin</h4>
                <p className="text-[11px] text-emerald-200">Official Store Direct Line</p>
              </div>
            </div>
            <button
              onClick={() => setIsWhatsAppOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-4 space-y-3 bg-[#E5DDD5]/30">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-700 leading-relaxed border border-slate-100">
              <p className="font-semibold text-slate-900 mb-1">Assalamu Alaikum! 👋</p>
              <p>
                Want to talk directly on WhatsApp with our store administrator? Type your message below or choose an instant topic:
              </p>
            </div>

            <div className="space-y-1.5">
              {[
                'I want to inquire about custom product prices & discounts',
                'What is the delivery time and shipping charge to my area?',
                'Need urgent assistance regarding my order status',
              ].map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleLaunchWhatsApp(msg)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80 text-[11px] font-medium text-slate-700 transition-colors flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <span className="truncate pr-2">{msg}</span>
                  <FaExternalLinkAlt className="text-[9px] text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="Or write custom message..."
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={() => handleLaunchWhatsApp()}
              className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5c] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaWhatsapp className="text-base" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
