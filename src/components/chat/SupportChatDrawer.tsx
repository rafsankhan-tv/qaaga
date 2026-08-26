import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Paperclip,
  Image,
  Headphones,
  CheckCheck,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Wrench,
  Stethoscope,
  ShoppingBag,
  Phone,
  Mail
} from 'lucide-react';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';

interface SupportChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const SupportChatDrawer: React.FC<SupportChatDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState(() => marketplaceStore.getSupportConversations());
  const [activeChannelId, setActiveChannelId] = useState('support-main');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setConversations([...marketplaceStore.getSupportConversations()]);
    };
    const unsub = marketplaceStore.subscribe(handleUpdate);
    return unsub;
  }, []);

  const activeChannel = conversations.find((c) => c.id === activeChannelId) || conversations[0];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeChannelId, activeChannel?.messages.length]);

  if (!isOpen || !activeChannel) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    marketplaceStore.sendSupportMessage(
      activeChannelId,
      text.trim(),
      currentUser?.fullName || 'রাকিব হাসান'
    );

    setInputMessage('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1100);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleSendImage = () => {
    marketplaceStore.sendSupportMessage(
      activeChannelId,
      'সমস্যার ছবি এটাচ করা হলো:',
      currentUser?.fullName || 'রাকিব হাসান',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80'
    );
  };

  const quickQuestions = [
    { label: 'জরুরী সার্ভিস বুকিং', text: 'আমার আজকেই একজন অভিজ্ঞ এসি ও ইলেকট্রিশিয়ান সার্ভিস টেকনিশিয়ান প্রয়োজন।' },
    { label: 'ডাক্তার অ্যাপয়েন্টমেন্ট', text: 'জনপ্রিয় বিশেষজ্ঞ ডাক্তারের সিরিয়াল কনফার্মেশন কীভাবে পাব?' },
    { label: 'অর্ডার ট্র্যাকিং', text: 'আমার অর্ডার করা প্রোডাক্ট কবে ডেলিভারি পাওয়া যাবে?' },
    { label: 'পেমেন্ট ও রিফান্ড', text: 'ক্যাশ অন ডেলিভারি এবং বিকাশ পেমেন্ট রিফান্ড পলিসি কী?' }
  ];

  const drawerContent = (
    <div className="fixed inset-0 z-[99980] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 z-[99981]">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between animate-slideLeft">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-[#4e20b8] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeChannel.avatar}
                  alt={activeChannel.channelName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#4e20b8] rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold truncate max-w-[200px] sm:max-w-[260px]">
                  {activeChannel.channelName}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-purple-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>{activeChannel.role} &bull; অনলাইন রয়েছে</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Conversation Channels Tabs */}
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {conversations.map((c) => {
              const isActive = c.id === activeChannelId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white text-[#4e20b8] shadow-xs border border-purple-200'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <img src={c.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{c.channelName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {/* Urgent Direct Contact Strip */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Phone size={13} />
                  <span>জরুরী কাস্টমার কেয়ার ও সাপোর্ট</span>
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">24/7 Live</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:09658824360"
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-amber-500 hover:text-slate-900 px-2.5 py-1.5 rounded-xl font-bold transition-all"
                >
                  <Phone size={12} className="text-[#ff6d00]" />
                  <span className="truncate">09658824360</span>
                </a>
                <a
                  href="https://wa.me/8801644985301"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600/30 hover:bg-emerald-600 px-2.5 py-1.5 rounded-xl font-bold text-emerald-200 hover:text-white transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">WhatsApp Help</span>
                </a>
              </div>
              <div className="mt-2 text-center">
                <a href="mailto:qaaga@consultant.com" className="text-[11px] text-purple-200 hover:text-white transition-colors">
                  ইমেইল: <strong className="underline">qaaga@consultant.com</strong>
                </a>
              </div>
            </div>

            {/* Security Banner */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5 text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-[#4e20b8]" />
              <span>qaaga.com ভেরিফাইড হেল্পডেস্ক &bull; আপনার চ্যাট এন্ড-টু-এন্ড সুরক্ষিত</span>
            </div>

            {/* Message List */}
            {activeChannel.messages.map((msg) => {
              const isMe = !msg.isSupport && msg.senderId === 'user-current';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                    <span>{msg.senderName}</span>
                    <span>&bull;</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#4e20b8] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {msg.attachmentUrl && (
                      <img
                        src={msg.attachmentUrl}
                        alt="Attachment"
                        className="w-full max-h-48 rounded-xl object-cover mb-2 border border-black/10"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-2xl border border-slate-200/80 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#4e20b8] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#4e20b8] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#4e20b8] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">সাপোর্ট এক্সিকিউটিভ টাইপ করছেন...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-[#ff6d00]" />
              <span>দ্রুত প্রশ্ন জিজ্ঞাসা করুন:</span>
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q.text)}
                  className="text-[11px] font-medium bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#4e20b8] border border-slate-200/70 hover:border-purple-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleSendImage}
              className="p-2 text-slate-400 hover:text-[#4e20b8] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Attach Photo"
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="আপনার প্রশ্ন বা বার্তা এখানে লিখুন..."
              className="flex-1 text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`p-2.5 rounded-xl font-bold transition-all ${
                inputMessage.trim()
                  ? 'bg-[#4e20b8] hover:bg-[#41189e] text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }
  return drawerContent;
};
