import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image, Lock, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { marketplaceStore } from '../../services/marketplaceStore';

interface BookingChatModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingChatModal: React.FC<BookingChatModalProps> = ({ booking, isOpen, onClose }) => {
  const { currentUser, activeRole } = useAuth();
  const [messages, setMessages] = useState(() => marketplaceStore.getChatMessages(booking.id));
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setMessages(marketplaceStore.getChatMessages(booking.id));
    };
    update();
    const unsub = marketplaceStore.subscribe(update);
    return unsub;
  }, [booking.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const isPrivacyUnlocked = booking.privacyUnlocked;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser || !isPrivacyUnlocked) return;

    marketplaceStore.sendChatMessage({
      bookingId: booking.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: activeRole,
      text: inputMessage.trim()
    });

    setInputMessage('');
  };

  const handleSendMockImage = () => {
    if (!currentUser || !isPrivacyUnlocked) return;
    marketplaceStore.sendChatMessage({
      bookingId: booking.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: activeRole,
      text: 'Shared photo attachment:',
      attachmentUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full h-[600px] max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {currentUser?.id === booking.customerId ? booking.providerName : booking.customerName}
                </h4>
                {isPrivacyUnlocked ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={11} /> Pre-Payment Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs">{booking.serviceTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Locked State Warning if not unlocked */}
        {!isPrivacyUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Lock size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Direct Chat is Locked</h3>
            <p className="text-xs text-slate-600 max-w-sm mb-4">
              To protect both customers and service technicians, direct chat and contact numbers remain masked until the 20% advance booking payment is confirmed.
            </p>
            <div className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
              Booking Ref: {booking.bookingReference}
            </div>
          </div>
        ) : (
          <>
            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <p>Booking chat initiated. Say hello!</p>
                  <p className="text-[11px] text-slate-400 mt-1">Verified QAAGA encrypted conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 px-1">
                        <span className="text-[11px] font-semibold text-slate-600">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-teal-700 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                        {msg.attachmentUrl && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-white/20">
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment"
                              className="max-h-44 w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendMockImage}
                title="Send Photo"
                className="p-2 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Image size={18} />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message to technician / customer..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl shadow transition-colors cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
