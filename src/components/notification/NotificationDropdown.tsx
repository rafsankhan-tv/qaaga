import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Truck,
  Wrench,
  AlertCircle,
  X
} from 'lucide-react';
import { marketplaceStore } from '../../services/marketplaceStore';
import { NotificationItem } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    marketplaceStore.getNotifications()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications([...marketplaceStore.getNotifications()]);
    };
    const unsub = marketplaceStore.subscribe(handleUpdate);
    return unsub;
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    marketplaceStore.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => marketplaceStore.markNotificationAsRead(n.id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROVIDER_ON_THE_WAY':
        return <Truck className="text-blue-600" size={16} />;
      case 'OFFER_RECEIVED':
        return <Wrench className="text-[#4e20b8]" size={16} />;
      case 'ORDER_STATUS_UPDATE':
        return <CheckCircle2 className="text-emerald-600" size={16} />;
      default:
        return <Bell className="text-[#ff6d00]" size={16} />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold">
            <Bell size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">নোটিফিকেশন (Notifications)</h4>
            <span className="text-[10px] text-slate-500">{unreadCount} টি নতুন বার্তা</span>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-[#4e20b8] hover:underline font-semibold cursor-pointer"
          >
            সব পড়া হয়েছে
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            কোনো নোটিফিকেশন নেই
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                handleMarkAsRead(notif.id);
                onClose();
                onNavigate('customer_dashboard');
              }}
              className={`p-3.5 hover:bg-purple-50/40 transition-colors flex gap-3 cursor-pointer ${
                !notif.isRead ? 'bg-purple-50/20' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className={`text-xs truncate ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h5>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#ff6d00] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {notif.message}
                </p>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/60 text-center rounded-b-2xl">
        <button
          onClick={() => {
            onClose();
            onNavigate('customer_dashboard');
          }}
          className="text-xs text-[#4e20b8] hover:text-[#ff6d00] font-bold py-1 flex items-center justify-center gap-1 w-full transition-colors cursor-pointer"
        >
          <span>সব নোটিফিকেশন দেখুন ড্যাশবোর্ডে</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
