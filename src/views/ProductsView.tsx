import React, { useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  MapPin,
  Truck,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { Product } from '../types';
import { RatingStars } from '../components/common/RatingStars';

interface ProductsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const products = marketplaceStore.getProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout form
  const [recipientName, setRecipientName] = useState(currentUser?.fullName || 'Mohammad Rafiq');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone || '01712-345678');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'House 42, Road 7, Sector 3, Uttara');
  const [deliveryArea, setDeliveryArea] = useState(currentUser?.area || 'Uttara');
  const [deliveryThana, setDeliveryThana] = useState(currentUser?.thana || 'Uttara');
  const [deliveryDistrict, setDeliveryDistrict] = useState(currentUser?.district || 'Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'BKASH_ONLINE'>('CASH_ON_DELIVERY');

  const categories = ['ALL', 'Tools & Hardware', 'Electronics & Spares', 'Home Automation', 'Safety Equipment'];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.category === selectedCat;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    marketplaceStore.addToCart(product, 1);
    setCart(marketplaceStore.getCartItems());
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 80 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    marketplaceStore.createProductOrder({
      customerId: currentUser?.id || 'guest',
      customerName: recipientName,
      customerPhone: recipientPhone,
      deliveryAddress,
      district: deliveryDistrict,
      thana: deliveryThana,
      area: deliveryArea,
      items: cart.map((c) => ({
        productId: c.product.id,
        title: c.product.title,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.images[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
        sellerId: c.product.sellerId
      })),
      paymentMethod
    });

    setCart([]);
    setIsCartOpen(false);
    alert('Order placed successfully! Cash on Delivery confirmed.');
    onNavigate('customer_dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShoppingBag size={16} />
            <span>Hardware, Spares & Tools Store</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Original Tools & Spare Parts Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-amber-100">
            Cash on Delivery nationwide &bull; 7-day return warranty &bull; Verified sellers
          </p>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          <ShoppingCart size={18} />
          <span>My Cart</span>
          {cart.length > 0 && (
            <span className="bg-slate-950 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spare parts, tools, capacitors, pressure washers..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-slate-100">
                <img src={prod.images[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'} alt={prod.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {prod.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">By {prod.sellerShopName}</span>
                  <RatingStars rating={prod.rating} reviewCount={prod.reviewCount} />
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{prod.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-base font-black text-amber-700">BDT {prod.price.toLocaleString()}</div>
                  {prod.discountPrice && (
                    <div className="text-[10px] text-slate-400 line-through">BDT {prod.discountPrice}</div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SHOPPING CART & CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Your Shopping Cart</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2">
                <ShoppingBag size={40} className="text-slate-200" />
                <p>Your shopping cart is currently empty.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <img src={item.product.coverImage} alt={item.product.title} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.title}</h4>
                        <div className="text-xs text-amber-700 font-bold">BDT {item.product.price.toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Delivery Form */}
                <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs pt-3 border-t border-slate-100">
                  <div className="font-bold text-slate-900">Delivery Information (Nationwide Courier):</div>
                  
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Full Name & Phone:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Recipient Name"
                        className="p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                      <input
                        type="text"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Delivery Address & Area:</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Road, House, Flat number"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Payment Option:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                        className={`p-2 rounded-xl border text-center font-bold ${
                          paymentMethod === 'CASH_ON_DELIVERY'
                            ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-500'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        Cash on Delivery
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('BKASH_ONLINE')}
                        className={`p-2 rounded-xl border text-center font-bold ${
                          paymentMethod === 'BKASH_ONLINE'
                            ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-500'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        bKash / Card Online
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>BDT {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Delivery Fee:</span>
                      <span>BDT {deliveryFee}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900 text-sm">
                      <span>Grand Total:</span>
                      <span className="text-amber-800">BDT {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Confirm & Place Order (BDT {grandTotal.toLocaleString()})
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
