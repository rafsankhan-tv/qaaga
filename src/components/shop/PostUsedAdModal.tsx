import React, { useState } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Tag,
  MapPin,
  DollarSign,
  Plus
} from 'lucide-react';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';

interface PostUsedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostUsedAdModal: React.FC<PostUsedAdModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Laptops & Computers');
  const [condition, setCondition] = useState<'Brand New (Sealed)' | 'Like New' | 'Good' | 'Fair' | 'Needs Repair'>('Like New');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');
  const [area, setArea] = useState(currentUser?.area || 'Dhanmondi');
  const [phone, setPhone] = useState(currentUser?.phone || '01712-345678');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !description.trim()) {
      alert('অনুগ্রহ করে পণ্যের শিরোনাম, মূল্য ও বিবরণ পূরণ করুন।');
      return;
    }

    setLoading(true);
    try {
      const photos = imageUrl.trim()
        ? [imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'];

      marketplaceStore.postUsedProduct({
        sellerId: currentUser?.id || 'guest-seller',
        sellerName: currentUser?.fullName || 'রাকিব হাসান',
        sellerPhone: phone,
        title: title.trim(),
        category,
        condition,
        description: description.trim(),
        price: Number(price),
        isNegotiable,
        district,
        area,
        photos
      });

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      alert(err?.message || 'বিজ্ঞাপন পোস্ট করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Tag size={18} className="text-[#4e20b8]" />
              <span>সেকেন্ড হ্যান্ড বিজ্ঞাপন পোস্ট করুন</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              আপনার ব্যবহৃত ইলেকট্রনিক্স, গ্যাজেট বা টুলস বিনামূল্যে বিক্রি করুন
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">বিজ্ঞাপনের শিরোনাম *</label>
            <input
              type="text"
              required
              placeholder="উদাঃ Apple MacBook Pro 14 M2 Pro 16/512GB Space Gray"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] text-slate-900"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] text-slate-900"
              >
                <option value="Laptops & Computers">ল্যাপটপ ও কম্পিউটার</option>
                <option value="Cameras & Photography">ক্যামেরা ও ফটোগ্রাফি</option>
                <option value="Smartphones & Tablets">স্মার্টফোন ও ট্যাবলেট</option>
                <option value="Home Appliances">হোম অ্যাপ্লায়েন্স ও এসি</option>
                <option value="Bikes & Vehicles">বাইক ও মোটর ভেহিকেল</option>
                <option value="Tools & Machinery">টুলস ও মেশিনারিজ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">কন্ডিশন *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] text-slate-900"
              >
                <option value="Brand New">Brand New (সিল্ড / অব্যবহৃত)</option>
                <option value="Like New">Like New (নতুন এর মত ফ্রেশ)</option>
                <option value="Good">Good (ভালো কন্ডিশন)</option>
                <option value="Fair">Fair (ব্যবহারযোগ্য)</option>
              </select>
            </div>
          </div>

          {/* Price & Negotiable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block font-bold text-slate-700 mb-1">বিক্রয় মূল্য (টাকা) *</label>
              <input
                type="number"
                required
                placeholder="উদাঃ 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] text-slate-900 font-bold"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="isNegotiable"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 text-[#4e20b8] rounded-sm focus:ring-[#4e20b8]"
              />
              <label htmlFor="isNegotiable" className="font-bold text-slate-700 cursor-pointer">
                দরদাম করার সুযোগ আছে (Negotiable)
              </label>
            </div>
          </div>

          {/* Location & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">জেলা *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">এলাকা / থানা *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">যোগাযোগের ফোন নম্বর *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">পণ্যের ছবির লিংক (Image URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ ও স্পেসিফিকেশন *</label>
            <textarea
              required
              rows={4}
              placeholder="পণ্যের ব্যাটারি ব্যাকআপ, বক্স বা চার্জার আছে কি না, কোনো সমস্যা আছে কি না ইত্যাদি বিস্তারিত লিখুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] text-slate-900"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4e20b8] to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white font-black shadow-md cursor-pointer transition-all active:scale-98"
            >
              {loading ? 'পোস্ট হচ্ছে...' : 'বিজ্ঞাপন পাবলিশ করুন'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
