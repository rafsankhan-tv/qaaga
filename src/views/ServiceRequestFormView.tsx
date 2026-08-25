import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { BANGLADESH_LOCATIONS } from '../data/bangladeshLocations';

interface ServiceRequestFormViewProps {
  initialCategoryId?: string;
  initialProviderId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const ServiceRequestFormView: React.FC<ServiceRequestFormViewProps> = ({
  initialCategoryId,
  initialProviderId,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const { selectedLocation } = useLocation();

  const categories = marketplaceStore.getCategories();
  const providers = marketplaceStore.getProviders();

  const defaultCat = categories.find((c) => c.id === initialCategoryId) || categories[0];

  const [selectedCategory, setSelectedCategory] = useState(defaultCat);
  const [selectedSubCategory, setSelectedSubCategory] = useState(defaultCat.subcategories[0] || 'General Repair');
  const [title, setTitle] = useState(
    initialCategoryId === 'cat-ac-repair'
      ? 'Split AC Master Servicing & Jet Cleaning'
      : initialCategoryId === 'cat-web-design'
      ? 'Custom E-Commerce Store Development'
      : `${defaultCat.name} Service Needed`
  );
  const [description, setDescription] = useState(
    'Need experienced professional technician for thorough inspection, diagnostic check, and servicing. Please provide your best quote.'
  );
  const [budget, setBudget] = useState<number>(1500);
  const [isUrgent, setIsUrgent] = useState(false);
  const [preferredDate, setPreferredDate] = useState('2026-08-25');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');

  // Location
  const [division, setDivision] = useState(selectedLocation.division || 'Dhaka');
  const [district, setDistrict] = useState(selectedLocation.district || 'Dhaka');
  const [thana, setThana] = useState(selectedLocation.thana || 'Gulshan');
  const [area, setArea] = useState(selectedLocation.area || 'Gulshan 2');
  const [address, setAddress] = useState('House 42, Road 11, Block D');

  // Routing Mode
  const [routingMode, setRoutingMode] = useState<'ALL_ELIGIBLE' | 'SELECTED_PROVIDERS'>(
    initialProviderId ? 'SELECTED_PROVIDERS' : 'ALL_ELIGIBLE'
  );
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(
    initialProviderId ? [initialProviderId] : []
  );

  // Photos
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
  ]);

  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string>('');

  const currentDivData = BANGLADESH_LOCATIONS.find((d) => d.division === division);
  const currentDistData = currentDivData?.districts.find((d) => d.name === district);
  const currentThanaData = currentDistData?.thanas.find((t) => t.name === thana);

  const eligibleProviders = providers.filter((p) =>
    p.serviceCategoryIds.includes(selectedCategory.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newReq = marketplaceStore.createServiceRequest({
      customer: currentUser,
      categoryId: selectedCategory.id,
      subCategory: selectedSubCategory,
      title,
      description,
      budget: budget || undefined,
      isUrgent,
      preferredDate,
      preferredTime,
      district,
      thana,
      area,
      address,
      images,
      routingMode,
      targetProviderIds: routingMode === 'SELECTED_PROVIDERS' ? selectedProviderIds : []
    });

    setCreatedRequestId(newReq.id);
    setIsSubmitted(true);
  };

  const addMockImage = () => {
    setImages([
      ...images,
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    ]);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Service Request Submitted!</h2>
            <p className="text-xs text-slate-500">Request ID: <strong className="text-slate-800">{createdRequestId}</strong></p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-slate-700 text-left space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#4e20b8]">
              <ShieldCheck size={16} className="text-[#4e20b8]" />
              <span>qaaga.com Moderated Workflow in Progress:</span>
            </div>
            <p className="leading-relaxed">
              1. Your request has arrived in the qaaga.com Admin Portal for verification.
              <br />
              2. Eligible area technicians will review your problem and submit competitive price quotes.
              <br />
              3. You will receive notifications as soon as quotes arrive. You can compare warranties, technician ratings, and pay the 20% advance booking deposit securely.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigate('customer_dashboard')}
              className="flex-1 bg-[#4e20b8] hover:bg-[#41189e] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Go to Customer Dashboard
            </button>
            <button
              onClick={() => onNavigate('admin_portal')}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              View in Admin Portal (Live Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Post a Service Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Get transparent, competitive quotes from verified service technicians in your area
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 bg-slate-100 p-2 rounded-2xl">
        {[
          { num: 1, label: 'Service Category' },
          { num: 2, label: 'Problem & Schedule' },
          { num: 3, label: 'Location & Routing' }
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === s.num
                ? 'bg-white text-[#4e20b8] shadow-xs ring-1 ring-[#4e20b8]/20'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.num ? 'bg-[#4e20b8] text-white font-bold' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Service Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c);
                      setSelectedSubCategory(c.subcategories[0] || 'General');
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                      selectedCategory.id === c.id
                        ? 'border-[#4e20b8] bg-purple-50 text-[#32107e] ring-2 ring-[#4e20b8]/30 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.subcategories.length} sub-services</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Sub-Category / Specific Issue:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                      selectedSubCategory === sub
                        ? 'bg-[#4e20b8] text-white border-[#4e20b8] shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#4e20b8] hover:bg-[#41189e] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Problem Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROBLEM DETAILS & SCHEDULE */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Request Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 1.5 Ton Inverter AC Cooling Issue & Deep Wash"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Problem Description:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact symptoms, brand, floor level, and any previous repairs..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Customer Budget (BDT):
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUrgent(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      !isUrgent
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUrgent(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isUrgent
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <AlertCircle size={13} />
                    <span>Urgent (Today)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Service Date:
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Time Slot:
                </label>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
                  placeholder="e.g. 10:00 AM - 01:00 PM"
                />
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attach Diagnostic Photos (Optional):
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={img} alt="Problem preview" className="w-full h-full object-cover" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMockImage}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#4e20b8] bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-[#4e20b8] text-xs gap-1 transition-colors cursor-pointer"
                >
                  <UploadCloud size={18} />
                  <span className="text-[10px]">Add Photo</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#4e20b8] hover:bg-[#41189e] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Location & Dispatch</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION & ROUTING DISPATCH */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    const divObj = BANGLADESH_LOCATIONS.find((d) => d.division === e.target.value);
                    setDistrict(divObj?.districts[0]?.name || '');
                    setThana(divObj?.districts[0]?.thanas[0]?.name || '');
                    setArea(divObj?.districts[0]?.thanas[0]?.areas[0] || '');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {BANGLADESH_LOCATIONS.map((d) => (
                    <option key={d.division} value={d.division}>{d.division}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    const distObj = currentDivData?.districts.find((d) => d.name === e.target.value);
                    setThana(distObj?.thanas[0]?.name || '');
                    setArea(distObj?.thanas[0]?.areas[0] || '');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {currentDivData?.districts.map((dist) => (
                    <option key={dist.name} value={dist.name}>{dist.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thana</label>
                <select
                  value={thana}
                  onChange={(e) => {
                    setThana(e.target.value);
                    const thObj = currentDistData?.thanas.find((t) => t.name === e.target.value);
                    setArea(thObj?.areas[0] || '');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {currentDistData?.thanas.map((th) => (
                    <option key={th.name} value={th.name}>{th.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  {currentThanaData?.areas.map((ar) => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exact Flat, Road & Landmark:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House 12, Road 4, Sector 7"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4e20b8] focus:bg-white"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                🔒 Protected by qaaga.com Privacy Gate: Exact address is hidden from technicians until booking advance is paid.
              </p>
            </div>

            {/* Provider Routing Dispatch Mode */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Routing & Dispatch Strategy:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoutingMode('ALL_ELIGIBLE')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    routingMode === 'ALL_ELIGIBLE'
                      ? 'bg-purple-50 border-[#4e20b8] text-[#32107e] ring-1 ring-[#4e20b8]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Broadcast to All Area Providers</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Admin dispatches to all verified technicians in {area} for fastest competitive quotes.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoutingMode('SELECTED_PROVIDERS')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    routingMode === 'SELECTED_PROVIDERS'
                      ? 'bg-purple-50 border-[#4e20b8] text-[#32107e] ring-1 ring-[#4e20b8]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Target Specific Selected Providers</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Send quote request only to selected specialist technicians you trust.
                  </div>
                </button>
              </div>

              {routingMode === 'SELECTED_PROVIDERS' && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Select Target Technicians ({eligibleProviders.length} available):
                  </div>
                  <div className="space-y-2">
                    {eligibleProviders.map((p) => {
                      const isSelected = selectedProviderIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedProviderIds(selectedProviderIds.filter((id) => id !== p.id));
                            } else {
                              setSelectedProviderIds([...selectedProviderIds, p.id]);
                            }
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-50 border-[#4e20b8] text-[#32107e]'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.avatarUrl} alt={p.fullName} className="w-9 h-9 rounded-xl object-cover" />
                            <div>
                              <div className="text-xs font-bold">{p.fullName}</div>
                              <div className="text-[11px] text-slate-500">{p.businessName} &bull; {p.completedJobs} jobs</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-[#4e20b8] text-white border-[#4e20b8]' : 'border-slate-300'}`}>
                            {isSelected && <Check size={13} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="bg-[#ff6d00] hover:bg-[#ea6000] text-white text-xs font-bold px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <ShieldCheck size={16} />
                <span>Submit Request to qaaga.com</span>
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
