import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Send,
  Sparkles,
  Tag,
  Stethoscope,
  Wrench,
  Building2,
  ShoppingBag,
  Briefcase,
  AlertCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceStore } from '../../services/marketplaceStore';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const SAMPLE_POST_IMAGES = [
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryKey, setCategoryKey] = useState('general');
  const [postType, setPostType] = useState<'UPDATE' | 'OFFER' | 'HEALTH_TIP' | 'SERVICE_SHOWCASE' | 'JOB_ALERT' | 'HOTEL_DEAL'>('UPDATE');
  const [imageUrl, setImageUrl] = useState('');
  const [hasActionCta, setHasActionCta] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('সার্ভিস বুকিং করুন');
  const [ctaTargetView, setCtaTargetView] = useState('service_request');
  const [ctaPriceOrDiscount, setCtaPriceOrDiscount] = useState('২০% অফার');
  const [tagsInput, setTagsInput] = useState('HealthTips, Doctor, Offer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    marketplaceStore.createFeedPost({
      authorId: currentUser?.id || 'user-admin',
      authorName: currentUser?.fullName || 'Rafsan Khan',
      authorAvatar:
        currentUser?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      authorRole: currentUser?.activeRole || 'SUPER_ADMIN',
      authorBadge: 'ভেরিফাইড মেম্বার',
      authorDistrict: currentUser?.district || 'ঢাকা',
      postType,
      title: title.trim() || undefined,
      content: content.trim(),
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      tags,
      categoryKey,
      actionCta: hasActionCta
        ? {
            label: ctaLabel.trim() || 'বিস্তারিত দেখুন',
            targetView: ctaTargetView,
            priceOrDiscount: ctaPriceOrDiscount.trim() || undefined
          }
        : undefined
    });

    setIsSubmitting(false);
    onPostCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4e20b8] flex items-center justify-center font-black">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">নতুন পোস্ট / আপডেট শেয়ার করুন</h3>
              <p className="text-[11px] text-slate-500">আপনার ফলোয়ার ও সকল ভিজিটর এই আপডেট দেখতে পাবেন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Author Badge Info */}
          <div className="flex items-center gap-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
              alt="Author Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#4e20b8]/30"
            />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">{currentUser?.fullName || 'Rafsan Khan'}</h4>
              <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {currentUser?.activeRole || 'SUPER_ADMIN'} • পাবলিক পোস্ট
              </span>
            </div>
          </div>

          {/* Category & Post Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#4e20b8] outline-none"
              >
                <option value="general">সাধারণ আপডেট (General)</option>
                <option value="doctor">ডাক্তার ও স্বাস্থ্য (Health/Doctor)</option>
                <option value="repair">হোম ও রিপেয়ার সার্ভিস (Service/Repair)</option>
                <option value="hotel">হোটেল ও ট্রাভেল (Hotel & Travel)</option>
                <option value="products">গ্যাজেট ও শপিং (Product Deals)</option>
                <option value="jobs">জবস ও নিয়োগ (Job Alert)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পোস্টের ধরন</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#4e20b8] outline-none"
              >
                <option value="UPDATE">সাধারণ নোটিস / আপডেট</option>
                <option value="HEALTH_TIP">স্বাস্থ্য টিপস / পরামর্শ</option>
                <option value="OFFER">স্পেশাল ডিসকাউন্ট অফার</option>
                <option value="SERVICE_SHOWCASE">সার্ভিস বা কাজের ডেমো</option>
                <option value="JOB_ALERT">নতুন চাকরির সার্কুলার</option>
                <option value="HOTEL_DEAL">হোটেল বুকিং প্যাকেজ</option>
              </select>
            </div>
          </div>

          {/* Post Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পোস্টের শিরোনাম (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="যেমন: গ্রীষ্মকালীন এসি সার্ভিসে ২০% ছাড় বা হার্টের স্বাস্থ্য টিপস"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#4e20b8] outline-none"
            />
          </div>

          {/* Post Body Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পোস্টের মূল বক্তব্য *</label>
            <textarea
              rows={4}
              required
              placeholder="আপনার ফলোয়ার ও গ্রাহকদের সাথে বিস্তারিত তথ্য, স্বাস্থ্য পরামর্শ, সার্ভিস ডিটেইলস বা অফার শেয়ার করুন..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-normal focus:ring-2 focus:ring-[#4e20b8] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Post Image URL or Quick Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#4e20b8]" /> ছবির লিঙ্ক (Image URL)
              </label>
              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="text-[11px] text-[#4e20b8] font-bold hover:underline cursor-pointer"
              >
                {showImagePicker ? 'স্যাম্পল ছবি বন্ধ করুন' : 'স্যাম্পল ছবি বেছে নিন'}
              </button>
            </div>

            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#4e20b8] outline-none"
            />

            {showImagePicker && (
              <div className="grid grid-cols-5 gap-2 mt-2 p-2 bg-slate-100 rounded-xl">
                {SAMPLE_POST_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(img);
                      setShowImagePicker(false);
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-[#4e20b8] transition-all cursor-pointer"
                  >
                    <img src={img} alt="Sample" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action CTA Option */}
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasActionCta}
                onChange={(e) => setHasActionCta(e.target.checked)}
                className="w-4 h-4 text-[#ff6d00] rounded accent-[#ff6d00]"
              />
              <span className="text-xs font-bold text-amber-950">পোস্টে সরাসরি বুকিং বা অ্যাকশন বাটন যুক্ত করুন</span>
            </label>

            {hasActionCta && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-2 border-t border-amber-200/60">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="বুকিং করুন"
                    className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">টার্গেট ভিউ</label>
                  <select
                    value={ctaTargetView}
                    onChange={(e) => setCtaTargetView(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs"
                  >
                    <option value="service_request">সার্ভিস বুকিং</option>
                    <option value="doctors">ডাক্তার অ্যাপয়েন্টমেন্ট</option>
                    <option value="hotels">হোটেল বুকিং</option>
                    <option value="products">প্রোডাক্ট শপিং</option>
                    <option value="jobs">জব আবেদন</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">প্রাইস/অফার ট্যাগ</label>
                  <input
                    type="text"
                    value={ctaPriceOrDiscount}
                    onChange={(e) => setCtaPriceOrDiscount(e.target.value)}
                    placeholder="২০% ছাড়"
                    className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Tag size={13} className="text-[#4e20b8]" /> হ্যাশট্যাগ (কমা দিয়ে লিখুন)
            </label>
            <input
              type="text"
              placeholder="HealthTips, ACRepair, OfferDhaka, HotelDeal"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#4e20b8] outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-2 bg-[#4e20b8] hover:bg-[#41189e] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'পোস্ট হচ্ছে...' : 'পোস্ট প্রকাশ করুন'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
