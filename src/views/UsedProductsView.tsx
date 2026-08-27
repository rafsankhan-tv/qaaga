import React, { useState } from 'react';
import {
  Tag,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { UsedProductListing } from '../types';

interface UsedProductsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const UsedProductsView: React.FC<UsedProductsViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const usedItems = marketplaceStore.getUsedProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedItemForContact, setSelectedItemForContact] = useState<UsedProductListing | null>(null);

  // Post form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics & Appliances');
  const [price, setPrice] = useState<number>(15000);
  const [condition, setCondition] = useState<'Brand New (Sealed)' | 'Like New' | 'Good' | 'Fair' | 'Needs Repair'>('Good');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState(currentUser?.area || 'Mirpur');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');

  const filteredItems = usedItems.filter((it) =>
    it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    marketplaceStore.postUsedProduct({
      sellerId: currentUser?.id || 'guest',
      sellerName: currentUser?.fullName || 'Seller',
      sellerPhone: currentUser?.phone || '01712-345678',
      title,
      category,
      price,
      isNegotiable: true,
      condition,
      description,
      photos: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'],
      area,
      district
    });

    setIsPostModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Tag size={16} />
            <span>Pre-Owned & Verified Second-Hand Market</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Buy & Sell Verified Used Electronics & Appliances
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Direct peer-to-peer trading with QAAGA escrow inspection support
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>Post Free Used Item Ad</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-xl relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search used laptops, TVs, ACs, generators..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 bg-slate-100">
                <img src={item.photos[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Condition: {item.condition}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{item.category}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={11} className="text-teal-700" />
                    <span>{item.area}, {item.district}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-base font-black text-slate-900">
                  BDT {item.price.toLocaleString()}
                </div>

                <button
                  onClick={() => setSelectedItemForContact(item)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone size={13} />
                  <span>Contact Seller</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* POST AD MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Post Used Product Advertisement</h3>
                <p className="text-xs text-slate-500">Reach verified buyers across Bangladesh</p>
              </div>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gree 1.5 Ton Inverter AC (1 Year Used)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Laptops & Computers">Laptops & Computers</option>
                    <option value="Mobile Phones">Mobile Phones</option>
                    <option value="Home & Furniture">Home & Furniture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Condition:</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="LIKE_NEW">Like New (Flawless)</option>
                    <option value="EXCELLENT">Excellent (Minor signs)</option>
                    <option value="GOOD">Good (Working fine)</option>
                    <option value="FAIR">Fair (Needs minor repair)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asking Price (BDT):</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Area:</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description & Reason for Selling:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention warranty receipts, original box, and operating status..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Advertisement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT SELLER MODAL */}
      {selectedItemForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
              <Phone size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Contact Seller</h3>
              <p className="text-xs text-slate-500">{selectedItemForContact.title}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div>Seller Name: <strong>{selectedItemForContact.sellerName}</strong></div>
              <div>Location: <strong>{selectedItemForContact.area}, {selectedItemForContact.district}</strong></div>
              <div className="text-base font-black text-teal-800 pt-1">{selectedItemForContact.sellerPhone}</div>
            </div>

            <div className="text-[11px] text-slate-400">
              Tip: Test the device thoroughly in a public place before payment.
            </div>

            <button
              onClick={() => setSelectedItemForContact(null)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
