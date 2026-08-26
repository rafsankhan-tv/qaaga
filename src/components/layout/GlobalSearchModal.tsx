import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronRight, Stethoscope, Wrench, ShoppingBag, Hotel, Briefcase, BookOpen, User } from 'lucide-react';
import { marketplaceStore } from '../../services/marketplaceStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const categories = marketplaceStore.getCategories();
  const providers = marketplaceStore.getProviders();
  const doctors = marketplaceStore.getDoctors();
  const hotels = marketplaceStore.getHotels();
  const products = marketplaceStore.getProducts();
  const ebooks = marketplaceStore.getEbooks();
  const jobs = marketplaceStore.getJobs();

  const q = query.toLowerCase().trim();

  const matchingCategories = q ? categories.filter(c => c.name.toLowerCase().includes(q) || c.subcategories.some(s => s.toLowerCase().includes(q))) : [];
  const matchingProviders = q ? providers.filter(p => p.fullName.toLowerCase().includes(q) || p.serviceNames.some(s => s.toLowerCase().includes(q))) : [];
  const matchingDoctors = q ? doctors.filter(d => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.hospitalChamber.toLowerCase().includes(q)) : [];
  const matchingHotels = q ? hotels.filter(h => h.name.toLowerCase().includes(q) || h.district.toLowerCase().includes(q)) : [];
  const matchingProducts = q ? products.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : [];
  const matchingEbooks = q ? ebooks.filter(e => e.title.toLowerCase().includes(q) || e.author.toLowerCase().includes(q)) : [];
  const matchingJobs = q ? jobs.filter(j => j.jobTitle.toLowerCase().includes(q) || j.category.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q)) : [];

  const totalResults = matchingCategories.length + matchingProviders.length + matchingDoctors.length + matchingHotels.length + matchingProducts.length + matchingEbooks.length + matchingJobs.length;

  const modalContent = (
    <div className="fixed inset-0 z-[99990] flex items-start justify-center pt-16 sm:pt-24 p-3 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative z-[99991]">
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search size={18} className="text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, AC repair, doctors, hotels, products, jobs..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'AC Servicing', icon: Wrench, view: 'service_request', catId: 'cat-ac-repair' },
                  { name: 'Website Design', icon: Wrench, view: 'service_request', catId: 'cat-web-design' },
                  { name: 'Specialist Doctors', icon: Stethoscope, view: 'doctors' },
                  { name: 'Cox\'s Bazar Resorts', icon: Hotel, view: 'hotels' },
                  { name: 'Home Gadgets', icon: ShoppingBag, view: 'products' },
                  { name: 'IT Career Jobs', icon: Briefcase, view: 'jobs' },
                  { name: 'Programming eBooks', icon: BookOpen, view: 'ebooks' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(item.view, { categoryId: item.catId });
                        onClose();
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <Icon size={14} className="text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No results found for &ldquo;<strong>{query}</strong>&rdquo;. Try searching for &ldquo;AC&rdquo;, &ldquo;Doctor&rdquo;, or &ldquo;Developer&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Categories */}
              {matchingCategories.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Services & Categories</div>
                  <div className="space-y-1.5">
                    {matchingCategories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate('service_request', { categoryId: c.id });
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Wrench size={15} className="text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-500">{c.subcategories.slice(0, 3).join(', ')}</div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctors */}
              {matchingDoctors.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Doctors</div>
                  <div className="space-y-1.5">
                    {matchingDoctors.map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onNavigate('doctors');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Stethoscope size={15} className="text-blue-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{d.name}</div>
                            <div className="text-[10px] text-slate-500">{d.specialization} &bull; {d.hospitalChamber}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-700">BDT {d.consultationFee}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchingProducts.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Products</div>
                  <div className="space-y-1.5">
                    {matchingProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigate('products');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag size={15} className="text-amber-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{p.title}</div>
                            <div className="text-[10px] text-slate-500">{p.category} &bull; Sold by {p.sellerShopName}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">BDT {(p.discountPrice || p.price).toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {matchingJobs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Openings</div>
                  <div className="space-y-1.5">
                    {matchingJobs.map(j => (
                      <button
                        key={j.id}
                        onClick={() => {
                          onNavigate('jobs');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase size={15} className="text-purple-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{j.jobTitle}</div>
                            <div className="text-[10px] text-slate-500">{j.companyName} &bull; {j.area}</div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{j.jobType}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
