import React, { useState } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  Package,
  TrendingUp,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { Product } from '../types';

interface SellerDashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const products = marketplaceStore.getProducts();
  const orders = marketplaceStore.getOrders();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tools & Hardware');
  const [price, setPrice] = useState<number>(2400);
  const [stock, setStock] = useState<number>(15);
  const [description, setDescription] = useState('');

  const myProducts = products.filter((p) => p.sellerId === currentUser?.id || p.sellerShopName.includes(currentUser?.fullName || ''));
  const myOrders = orders; // Seller sees received orders

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    marketplaceStore.addProduct({
      sellerId: currentUser?.id || 'seller-1',
      sellerShopName: currentUser?.fullName || 'Verified Seller Shop',
      title,
      sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      category,
      price,
      stock,
      description,
      images: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'],
      warranty: '1 Year Brand Replacement Warranty',
      deliveryInfo: 'Inside Dhaka 24-48h, Nationwide 72h',
      isApproved: true
    });

    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-amber-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="text-amber-400" />
            <h1 className="text-xl font-black">{currentUser?.fullName} - Merchant Hub</h1>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Verified Merchant
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage your hardware inventory, process Cash on Delivery dispatches, and track daily sales.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <PlusCircle size={15} />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Listed SKUs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{products.length} Items</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Received Orders</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{myOrders.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Sales</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            BDT {myOrders.reduce((a, o) => a + o.totalAmount, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Fulfillment Rate</div>
          <div className="text-2xl font-black text-teal-800 mt-1">99.4%</div>
        </div>
      </div>

      {/* Orders to Dispatch */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Courier Dispatch Queue ({myOrders.length})</h3>
        
        {myOrders.length === 0 ? (
          <div className="text-xs text-slate-400 p-4 text-center">No orders awaiting dispatch.</div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {ord.orderStatus}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Ship to: <strong>{ord.customerName}</strong> ({ord.customerPhone}) &bull; {ord.deliveryAddress}, {ord.area}, {ord.district}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Items: {ord.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <div className="font-black text-slate-900 text-sm">BDT {ord.totalAmount.toLocaleString()}</div>
                  <div className="text-[10px] text-amber-700 font-bold">{ord.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Product to QAAGA Shop</h3>
                <p className="text-xs text-slate-500">Listed across web and mobile apps</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Copper Pipe Tube Expander Set"
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
                    <option value="Tools & Hardware">Tools & Hardware</option>
                    <option value="Electronics & Spares">Electronics & Spares</option>
                    <option value="Home Automation">Home Automation</option>
                    <option value="Safety Equipment">Safety Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (BDT):</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available Stock Units:</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Warranty:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include specs, compatibility, and box contents..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Publish SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
