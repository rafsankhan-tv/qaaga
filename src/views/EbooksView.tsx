import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Star,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  Lock,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { EBook } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { PaymentModal } from '../components/common/PaymentModal';

interface EbooksViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const EbooksView: React.FC<EbooksViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const ebooks = marketplaceStore.getEbooks();
  const purchases = marketplaceStore.getEbookPurchases();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEbookForPurchase, setSelectedEbookForPurchase] = useState<EBook | null>(null);
  const [readingEbook, setReadingEbook] = useState<EBook | null>(null);

  const filteredEbooks = ebooks.filter((eb) =>
    eb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eb.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eb.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPurchased = (ebookId: string) => {
    return purchases.some((p) => p.ebookId === ebookId && p.userId === currentUser?.id);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (!selectedEbookForPurchase || !currentUser) return;
    marketplaceStore.purchaseEbook(
      selectedEbookForPurchase.id,
      currentUser.id,
      paymentData.transactionId
    );

    const target = selectedEbookForPurchase;
    setSelectedEbookForPurchase(null);
    setReadingEbook(target);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
            <BookOpen size={16} />
            <span>Digital Library & Author Store</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Technical Guides, Blueprints & eBooks
          </h1>
          <p className="text-xs sm:text-sm text-teal-100">
            Instant digital access &bull; DRM protected reader &bull; 100% author royalties guaranteed
          </p>
        </div>

        {/* Search */}
        <div className="mt-6 max-w-xl relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search eBooks by title, author or topic..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEbooks.map((eb) => {
          const owned = isPurchased(eb.id);
          return (
            <div
              key={eb.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-4 space-y-4"
            >
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                  <img src={eb.coverImage} alt={eb.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {eb.category}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">{eb.author}</div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-tight mt-0.5">{eb.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span>{eb.pageCount} Pages (PDF)</span>
                    <RatingStars rating={eb.rating} reviewCount={eb.reviewCount} />
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{eb.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-teal-800">BDT {eb.price}</div>
                  <div className="text-[10px] text-slate-400">Instant PDF</div>
                </div>

                {owned ? (
                  <button
                    onClick={() => setReadingEbook(eb)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Read Now</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedEbookForPurchase(eb)}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Buy & Read</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* READING / PDF VIEWER MODAL */}
      {readingEbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Licensed Digital Edition
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{readingEbook.title}</h3>
                <div className="text-xs text-slate-500">By {readingEbook.author} &bull; {readingEbook.pageCount} Pages</div>
              </div>
              <button
                onClick={() => setReadingEbook(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close Reader
              </button>
            </div>

            {/* Simulated Reader Container */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 font-serif text-slate-800 text-sm leading-relaxed max-h-96 overflow-y-auto shadow-inner">
              <h4 className="font-sans font-bold text-base text-slate-900 text-center">Chapter 1: Foundations & Architecture</h4>
              <p>
                Welcome to the complete authoritative reference. In this edition, we outline the exact step-by-step methodology for executing professional service diagnostics, electrical inspections, and preventative refrigeration maintenance.
              </p>
              <p>
                Proper airflow calibration requires checking evaporator coil delta temperatures (aiming for 16°F to 22°F temperature drop across supply and return ducts). Ensure electrical capacitors are tested under load using a certified multimeter.
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs font-sans text-teal-900">
                🔒 <strong>Watermarked To:</strong> {currentUser?.fullName || 'Customer'} ({currentUser?.phone || '017XXXXXXXX'})
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">Digital Token Verified for this session</span>
              <button
                onClick={() => alert('Authorized full high-resolution PDF download initiated.')}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download Watermarked PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedEbookForPurchase && (
        <PaymentModal
          isOpen={true}
          onClose={() => setSelectedEbookForPurchase(null)}
          title="eBook Digital Purchase"
          serviceTitle={`Lifetime access to ${selectedEbookForPurchase.title}`}
          totalPrice={selectedEbookForPurchase.price}
          paymentType="FULL_ONLINE_100"
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
