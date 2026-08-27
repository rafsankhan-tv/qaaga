import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  PhoneCall,
  Store,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { marketplaceStore } from '../../services/marketplaceStore';
import { Product, SellerStore } from '../../types';

interface SellerDirectChatModalProps {
  sellerId: string;
  sellerShopName?: string;
  sellerPhone?: string;
  initialProduct?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onViewStore?: (sellerId: string) => void;
}

export const SellerDirectChatModal: React.FC<SellerDirectChatModalProps> = ({
  sellerId,
  sellerShopName,
  sellerPhone,
  initialProduct,
  isOpen,
  onClose,
  onViewStore
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [store, setStore] = useState<SellerStore | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !sellerId) return;

    const sellerStore = marketplaceStore.getSellerStoreById(sellerId);
    setStore(sellerStore);

    const chatChannel = marketplaceStore.getOrCreateSellerChat(
      sellerId,
      'user-customer-1',
      'তাহসিন আহমেদ (Customer)'
    );

    setMessages([...chatChannel.messages]);

    // If there is an initialProduct and this is fresh chat, prefill inquiry
    if (initialProduct && chatChannel.messages.length === 1) {
      setInputText(`আসসালামু আলাইকুম! "${initialProduct.title}" পণ্যটি কি বর্তমানে স্টকে আছে? ঢাকা সিটিতে ডেলিভারি কত সময় লাগবে?`);
    }

    const unsub = marketplaceStore.subscribe(() => {
      const updatedChannel = marketplaceStore.getOrCreateSellerChat(
        sellerId,
        'user-customer-1',
        'তাহসিন আহমেদ (Customer)'
      );
      setMessages([...updatedChannel.messages]);
    });

    return () => unsub();
  }, [isOpen, sellerId, initialProduct]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const shopName = store?.shopName || sellerShopName || 'অফিসিয়াল মার্চেন্ট';
  const phone = store?.phone || sellerPhone || '+8801611223344';
  const shopLogo = store?.shopLogo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const channelId = `chat-seller-${sellerId}`;
    marketplaceStore.sendSellerChatMessage(
      channelId,
      inputText.trim(),
      'user-customer-1',
      'তাহসিন আহমেদ',
      'CUSTOMER'
    );

    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] h-[650px] border border-slate-200 animate-scaleUp">
        
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3 border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={shopLogo}
                alt={shopName}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-400/80 shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-[260px]">
                  {shopName}
                </h3>
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                  <BadgeCheck size={11} /> ভেরিফাইড শপ
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>এখন একটিভ আছেন &bull; রেসপন্স সময় &lt; ১৫ মিনিট</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${phone}`}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="সরাসরি কল দিন"
            >
              <PhoneCall size={15} />
              <span className="hidden sm:inline">কল করুন</span>
            </a>

            {onViewStore && (
              <button
                onClick={() => {
                  onClose();
                  onViewStore(sellerId);
                }}
                className="p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="সম্পূর্ণ শপ দেখুন"
              >
                <Store size={15} />
                <span className="hidden sm:inline">শপ ভিজিট</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Optional Product Reference Banner */}
        {initialProduct && (
          <div className="bg-purple-50 border-b border-purple-100 p-2.5 px-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={initialProduct.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=100&q=80'}
                alt={initialProduct.title}
                className="w-9 h-9 rounded-lg object-cover border border-purple-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate text-[11px]">{initialProduct.title}</p>
                <p className="text-[10px] text-purple-800 font-bold">
                  ৳ {(initialProduct.discountPrice || initialProduct.price).toLocaleString()} &bull; স্টকে আছে ({initialProduct.stock} টি)
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-purple-200 text-purple-950 px-2 py-0.5 rounded-md font-bold shrink-0">
              আলোচিত পণ্য
            </span>
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-100/60">
          <div className="text-center my-2">
            <span className="text-[10px] font-bold text-slate-400 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              🔒 নিরাপদ সরাসরি এনক্রিপ্টেড চ্যাট &bull; qaaga.com ভেরিফাইড
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.senderRole === 'CUSTOMER' || msg.senderId === 'user-customer-1';
            return (
              <div
                key={msg.id || idx}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={shopLogo}
                    alt="Seller"
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border border-slate-200 shadow-2xs"
                  />
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-br from-[#4e20b8] to-[#391294] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {!isMe && (
                    <div className="text-[10px] font-bold text-[#4e20b8] mb-1 flex items-center gap-1">
                      <Store size={10} />
                      <span>{msg.senderName}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  <div
                    className={`text-[9px] mt-1 text-right ${
                      isMe ? 'text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="পণ্য বা ডেলিভারি সম্পর্কে সেলারকে লিখুন..."
            className="flex-1 bg-slate-100 hover:bg-slate-150 focus:bg-white text-xs text-slate-800 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#4e20b8] hover:bg-[#3d1696] disabled:opacity-40 text-white p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md active:scale-95"
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};
