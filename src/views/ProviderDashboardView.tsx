import React, { useState, useEffect } from 'react';
import {
  Wrench,
  DollarSign,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Key,
  ShieldCheck,
  AlertCircle,
  Star,
  Send,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { ServiceRequest, ProviderOffer, Booking, ProviderProfile } from '../types';
import { PrivacyMaskedField } from '../components/common/PrivacyMaskedField';
import { BookingChatModal } from '../components/chat/BookingChatModal';

interface ProviderDashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ProviderDashboardView: React.FC<ProviderDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [requests, setRequests] = useState(() => marketplaceStore.getRequests());
  const [offers, setOffers] = useState(() => marketplaceStore.getOffers());
  const [bookings, setBookings] = useState(() => marketplaceStore.getBookings());
  const [providers, setProviders] = useState(() => marketplaceStore.getProviders());

  const currentProvider = providers.find((p) => p.userId === currentUser?.id) || providers[0];

  // Active quoting modal
  const [quotingRequest, setQuotingRequest] = useState<ServiceRequest | null>(null);
  const [offeredPrice, setOfferedPrice] = useState<number>(1400);
  const [serviceCharge, setServiceCharge] = useState<number>(1100);
  const [partsIncluded, setPartsIncluded] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState('1.5 - 2 Hours');
  const [earliestDate, setEarliestDate] = useState('2026-08-25');
  const [earliestTime, setEarliestTime] = useState('10:00 AM');
  const [offerMessage, setOfferMessage] = useState('Includes high-pressure jet wash, gas pressure check, and indoor antibacterial coil treatment.');
  const [warranty, setWarranty] = useState('45 Days QAAGA Service Guarantee');

  // OTP Start work modal
  const [otpModalBooking, setOtpModalBooking] = useState<Booking | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Chat
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const update = () => {
      setRequests(marketplaceStore.getRequests());
      setOffers(marketplaceStore.getOffers());
      setBookings(marketplaceStore.getBookings());
      setProviders(marketplaceStore.getProviders());
    };
    const unsub = marketplaceStore.subscribe(update);
    return unsub;
  }, []);

  // Filter requests routed to this provider or all eligible in his area
  const availableOpportunities = requests.filter((r) => {
    const isTargeted = r.routingMode === 'ALL_ELIGIBLE' || r.targetProviderIds.includes(currentProvider.id);
    const isStatusEligible = r.status === 'SENT_TO_PROVIDERS' || r.status === 'OFFER_RECEIVED';
    const alreadyQuoted = offers.some((o) => o.requestId === r.id && o.providerId === currentProvider.id);
    return isTargeted && isStatusEligible && !alreadyQuoted;
  });

  const myOffers = offers.filter((o) => o.providerId === currentProvider.id);
  const myBookings = bookings.filter((b) => b.providerId === currentProvider.id);

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingRequest) return;

    marketplaceStore.submitProviderOffer({
      requestId: quotingRequest.id,
      provider: currentProvider,
      offeredPrice,
      serviceCharge,
      partsIncluded,
      estimatedDuration,
      earliestDate,
      earliestTime,
      offerMessage,
      warranty
    });

    setQuotingRequest(null);
  };

  const handleStartWorkWithOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalBooking) return;
    try {
      marketplaceStore.updateBookingMilestone(
        otpModalBooking.id,
        'WORK_STARTED',
        currentProvider.fullName,
        otpInput.trim()
      );
      setOtpModalBooking(null);
      setOtpInput('');
      setOtpError('');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP code.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Provider Stats Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 min-w-16 min-h-16 shrink-0 rounded-2xl overflow-hidden ring-2 ring-teal-400">
            <img
              src={currentProvider.avatarUrl}
              alt={currentProvider.fullName}
              className="w-full h-full aspect-square object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{currentProvider.fullName}</h1>
              {currentProvider.hasVerificationBadge && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> NID Verified Provider
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {currentProvider.businessName} &bull; Service Hubs: {currentProvider.serviceAreas.join(', ')}
            </div>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-4 text-center">
          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl">
            <div className="text-xs text-slate-400 font-semibold">Completed</div>
            <div className="text-base font-black text-teal-400">{currentProvider.completedJobs} Jobs</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl">
            <div className="text-xs text-slate-400 font-semibold">Rating</div>
            <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>{currentProvider.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl">
            <div className="text-xs text-slate-400 font-semibold">Active Jobs</div>
            <div className="text-base font-black text-emerald-400">
              {myBookings.filter((b) => b.status !== 'COMPLETED').length}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CONFIRMED ACTIVE JOBS (UNLOCKED CONTACTS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={20} className="text-teal-700" />
            <span>Active Confirmed Bookings ({myBookings.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Customer details unlocked post 20% advance</span>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
            No active booked jobs right now. Submit quotes on available leads below.
          </div>
        ) : (
          myBookings.map((b) => {
            const isCompleted = b.status === 'COMPLETED';
            return (
              <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                        {b.bookingReference}
                      </span>
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">{b.serviceTitle}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">Total: BDT {b.totalAmount.toLocaleString()}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Advance Received: BDT {b.advancePaid}</div>
                  </div>
                </div>

                {/* Unlocked Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PrivacyMaskedField
                    type="phone"
                    actualValue={b.customerPhone}
                    isUnlocked={b.privacyUnlocked}
                    label={`Customer: ${b.customerName}`}
                  />

                  <PrivacyMaskedField
                    type="address"
                    actualValue={b.customerAddress}
                    isUnlocked={b.privacyUnlocked}
                    label="Service Location Address"
                  />
                </div>

                {/* Milestone Progression Buttons */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Execution Milestones & Status Updates:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* On the way */}
                    <button
                      disabled={b.status !== 'BOOKED'}
                      onClick={() => marketplaceStore.updateBookingMilestone(b.id, 'PROVIDER_ON_THE_WAY', currentProvider.fullName)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                        b.status === 'PROVIDER_ON_THE_WAY'
                          ? 'bg-teal-700 text-white'
                          : b.status === 'BOOKED'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <Navigation size={13} />
                      <span>1. I Am On The Way</span>
                    </button>

                    {/* Arrived */}
                    <button
                      disabled={b.status !== 'PROVIDER_ON_THE_WAY'}
                      onClick={() => marketplaceStore.updateBookingMilestone(b.id, 'ARRIVED', currentProvider.fullName)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                        b.status === 'ARRIVED'
                          ? 'bg-teal-700 text-white'
                          : b.status === 'PROVIDER_ON_THE_WAY'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <MapPin size={13} />
                      <span>2. I Have Arrived</span>
                    </button>

                    {/* Start Work with OTP */}
                    <button
                      disabled={b.status !== 'ARRIVED'}
                      onClick={() => setOtpModalBooking(b)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                        b.status === 'WORK_STARTED'
                          ? 'bg-teal-700 text-white'
                          : b.status === 'ARRIVED'
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <Key size={13} />
                      <span>3. Start Work (Enter Customer OTP)</span>
                    </button>

                    {/* Request Completion */}
                    <button
                      disabled={b.status !== 'WORK_STARTED'}
                      onClick={() => marketplaceStore.updateBookingMilestone(b.id, 'COMPLETION_REQUESTED', currentProvider.fullName)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                        b.status === 'COMPLETION_REQUESTED'
                          ? 'bg-teal-700 text-white'
                          : b.status === 'WORK_STARTED'
                          ? 'bg-purple-700 text-white hover:bg-purple-800'
                          : 'bg-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>4. Request Customer Sign-off</span>
                    </button>
                  </div>

                  {/* Cash remaining collector switch */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">Remaining Balance from Customer: </span>
                      <strong className="text-teal-800">BDT {b.remainingAmount.toLocaleString()}</strong>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={b.remainingCollected}
                        onChange={(e) => marketplaceStore.toggleRemainingPaymentCollected(b.id, e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Mark Cash Collected</span>
                    </label>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => setActiveChatBooking(b)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-teal-200 transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span>Customer Chat Channel</span>
                  </button>

                  {isCompleted && (
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                      ✓ Completed & Rating Applied
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </section>

      {/* SECTION 2: NEW JOB OPPORTUNITIES (ADMIN MODERATED LEADS) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench size={20} className="text-teal-700" />
            <span>Available Job Opportunities ({availableOpportunities.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Verified customer requests in your area</span>
        </div>

        {availableOpportunities.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
            No new pending leads right now. All requests in your category are quoted or in review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOpportunities.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-teal-50 text-teal-900 px-2 py-0.5 rounded border border-teal-200">
                      {req.categoryName}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {req.preferredDate} ({req.preferredTime})
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{req.description}</p>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={13} className="text-teal-700" />
                    <span>{req.area}, {req.thana} (Exact flat masked)</span>
                  </div>

                  {req.budget && (
                    <div className="text-xs font-semibold text-slate-700">
                      Customer Estimated Budget: <strong>BDT {req.budget.toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setQuotingRequest(req);
                    setOfferedPrice(req.budget || 1500);
                  }}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Submit Price Quotation / Offer</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL: SUBMIT QUOTATION */}
      {quotingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Submit Quotation Offer</h3>
              <p className="text-xs text-slate-500 truncate">{quotingRequest.title} in {quotingRequest.area}</p>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Offered Price (BDT):</label>
                  <input
                    type="number"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-teal-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service / Labor Charge:</label>
                  <input
                    type="number"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="partsInc"
                  checked={partsIncluded}
                  onChange={(e) => setPartsIncluded(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="partsInc" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Includes Materials / Spare Parts & Gas
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Duration:</label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Warranty:</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Earliest Service Date:</label>
                  <input
                    type="date"
                    value={earliestDate}
                    onChange={(e) => setEarliestDate(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Earliest Time:</label>
                  <input
                    type="text"
                    value={earliestTime}
                    onChange={(e) => setEarliestTime(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Message to Customer:</label>
                <textarea
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 text-[11px] text-teal-900">
                🔒 <strong>Admin Moderation Guard:</strong> Your quote is reviewed by QAAGA Admin before being presented to the customer to ensure fair pricing.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuotingRequest(null)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OTP JOB START */}
      {otpModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
              <Key size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Enter Customer Start OTP</h3>
              <p className="text-xs text-slate-500">
                Ask <strong>{otpModalBooking.customerName}</strong> for their 4-digit start code to verify on-site arrival.
              </p>
            </div>

            <form onSubmit={handleStartWorkWithOtp} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="4-digit OTP"
                className="w-full text-center text-2xl font-mono font-black py-2.5 bg-slate-100 border border-slate-300 rounded-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              {otpError && (
                <div className="text-xs text-rose-600 font-semibold">{otpError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalBooking(null)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Verify & Start Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChatBooking && (
        <BookingChatModal
          booking={activeChatBooking}
          isOpen={true}
          onClose={() => setActiveChatBooking(null)}
        />
      )}

    </div>
  );
};
