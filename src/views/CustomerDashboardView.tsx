import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  ChevronRight,
  MapPin,
  Calendar,
  Lock,
  Stethoscope,
  Hotel,
  ShoppingBag,
  BookOpen,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { ServiceRequest, ProviderOffer, Booking } from '../types';
import { PrivacyMaskedField } from '../components/common/PrivacyMaskedField';
import { PaymentModal } from '../components/common/PaymentModal';
import { BookingChatModal } from '../components/chat/BookingChatModal';
import { RatingStars } from '../components/common/RatingStars';

interface CustomerDashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'BOOKINGS' | 'DOCTORS' | 'HOTELS' | 'ORDERS' | 'EBOOKS'>('REQUESTS');
  
  // Data from store
  const [requests, setRequests] = useState(() => marketplaceStore.getRequests());
  const [offers, setOffers] = useState(() => marketplaceStore.getOffers());
  const [bookings, setBookings] = useState(() => marketplaceStore.getBookings());
  const [appointments, setAppointments] = useState(() => marketplaceStore.getAppointments());
  const [hotelBookings, setHotelBookings] = useState(() => marketplaceStore.getHotelBookings());
  const [orders, setOrders] = useState(() => marketplaceStore.getOrders());
  const [ebookPurchases, setEbookPurchases] = useState(() => marketplaceStore.getEbookPurchases());

  // Interactive Modals State
  const [selectedOfferForPayment, setSelectedOfferForPayment] = useState<{ req: ServiceRequest; offer: ProviderOffer } | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState('Excellent, fast and courteous professional service!');

  useEffect(() => {
    const update = () => {
      setRequests(marketplaceStore.getRequests());
      setOffers(marketplaceStore.getOffers());
      setBookings(marketplaceStore.getBookings());
      setAppointments(marketplaceStore.getAppointments());
      setHotelBookings(marketplaceStore.getHotelBookings());
      setOrders(marketplaceStore.getOrders());
      setEbookPurchases(marketplaceStore.getEbookPurchases());
    };
    const unsub = marketplaceStore.subscribe(update);
    return unsub;
  }, []);

  const myRequests = requests.filter((r) => r.customerId === currentUser?.id);
  const myBookings = bookings.filter((b) => b.customerId === currentUser?.id);
  const myAppointments = appointments.filter((a) => a.customerId === currentUser?.id);
  const myHotelBookings = hotelBookings.filter((h) => h.customerId === currentUser?.id);
  const myOrders = orders.filter((o) => o.customerId === currentUser?.id);
  const myEbooks = ebookPurchases.filter((e) => e.userId === currentUser?.id);

  const handlePaymentSuccess = (paymentData: any) => {
    if (!selectedOfferForPayment) return;
    marketplaceStore.acceptOfferAndCreateBooking({
      requestId: selectedOfferForPayment.req.id,
      offerId: selectedOfferForPayment.offer.id,
      paymentGateway: paymentData.gateway,
      transactionId: paymentData.transactionId
    });
    setSelectedOfferForPayment(null);
    setActiveTab('BOOKINGS');
  };

  const handleConfirmCompletion = () => {
    if (!reviewModalBooking || !currentUser) return;
    marketplaceStore.customerConfirmCompletion(
      reviewModalBooking.id,
      ratingInput,
      reviewTextInput,
      currentUser.fullName
    );
    setReviewModalBooking(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 min-w-14 min-h-14 shrink-0 rounded-2xl overflow-hidden ring-2 ring-teal-600 shadow-sm">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
              alt="Customer"
              className="w-full h-full aspect-square object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{currentUser?.fullName}</h1>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Customer Account
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {currentUser?.phone} &bull; {currentUser?.area}, {currentUser?.thana}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('service_request')}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <span>+ Post New Service Request</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none text-xs font-bold">
        {[
          { id: 'REQUESTS', label: `Service Requests (${myRequests.length})`, icon: FileText },
          { id: 'BOOKINGS', label: `Active Bookings (${myBookings.length})`, icon: ShieldCheck },
          { id: 'DOCTORS', label: `Doctor Serials (${myAppointments.length})`, icon: Stethoscope },
          { id: 'HOTELS', label: `Hotels (${myHotelBookings.length})`, icon: Hotel },
          { id: 'ORDERS', label: `Shop Orders (${myOrders.length})`, icon: ShoppingBag },
          { id: 'EBOOKS', label: `eBooks Library (${myEbooks.length})`, icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SERVICE REQUESTS & QUOTATIONS */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-6">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <FileText size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No active service requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need AC servicing, web design, or home repairs? Submit a request and receive verified quotes.
              </p>
              <button
                onClick={() => onNavigate('service_request')}
                className="bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Post Service Request
              </button>
            </div>
          ) : (
            myRequests.map((req) => {
              const requestOffers = offers.filter((o) => o.requestId === req.id && (o.status === 'SENT_TO_CUSTOMER' || o.status === 'ACCEPTED'));
              const isBooked = req.status === 'BOOKED' || req.status === 'PROVIDER_ON_THE_WAY' || req.status === 'ARRIVED' || req.status === 'WORK_STARTED' || req.status === 'COMPLETED';

              return (
                <div key={req.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
                  
                  {/* Request Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                          {req.categoryName}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">{req.subCategory}</span>
                        {req.isUrgent && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">{req.title}</h3>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <MapPin size={12} className="text-teal-700" />
                        <span>{req.area}, {req.thana} &bull; Preferred: {req.preferredDate} at {req.preferredTime}</span>
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        req.status === 'ADMIN_REVIEW'
                          ? 'bg-amber-100 text-amber-900'
                          : req.status === 'SENT_TO_PROVIDERS'
                          ? 'bg-blue-100 text-blue-900'
                          : req.status === 'OFFERS_SENT_TO_CUSTOMER' || req.status === 'OFFER_RECEIVED'
                          ? 'bg-purple-100 text-purple-900'
                          : req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-teal-100 text-teal-900'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                      {req.budget && (
                        <span className="text-xs text-slate-500 mt-1">Est. Budget: BDT {req.budget.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {req.description}
                  </p>

                  {/* Status Progress Log */}
                  <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Audit & Moderation Timeline:
                    </div>
                    <div className="space-y-1">
                      {req.statusAuditLog.map((log, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-2 text-slate-700">
                          <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                          <span className="font-semibold">{log.status}:</span>
                          <span>{log.note}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Received Quotations Section */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Verified Provider Offers ({requestOffers.length})</span>
                      {requestOffers.length > 0 && !isBooked && (
                        <span className="text-xs font-medium text-emerald-700">
                          Review quotes & pay 20% advance to confirm
                        </span>
                      )}
                    </h4>

                    {requestOffers.length === 0 ? (
                      <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                        {req.status === 'ADMIN_REVIEW'
                          ? 'Awaiting QAAGA Admin verification and dispatch to area technicians.'
                          : 'Request dispatched to technicians. Offers will appear here once submitted and moderated.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {requestOffers.map((offer) => (
                          <div
                            key={offer.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                                : 'bg-white border-slate-200 hover:border-teal-400 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={offer.providerAvatar}
                                  alt={offer.providerName}
                                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-teal-600"
                                />
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900">{offer.providerName}</h5>
                                  <RatingStars rating={offer.providerRating} reviewCount={offer.providerReviewCount} />
                                  <div className="text-[10px] text-slate-400">{offer.providerCompletedJobs} jobs done</div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-black text-teal-800">BDT {offer.offeredPrice.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-500">20% Adv: BDT {Math.round(offer.offeredPrice * 0.2)}</div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 mt-2.5 bg-slate-50 p-2 rounded-lg italic">
                              &ldquo;{offer.offerMessage}&rdquo;
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100">
                              <div>Duration: <strong>{offer.estimatedDuration}</strong></div>
                              <div>Warranty: <strong>{offer.warranty}</strong></div>
                              <div>Earliest: <strong>{offer.earliestDate} ({offer.earliestTime})</strong></div>
                              <div>Parts Included: <strong>{offer.partsIncluded ? 'Yes' : 'No (Labor Only)'}</strong></div>
                            </div>

                            {/* Action */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              {offer.status === 'ACCEPTED' ? (
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Offer Accepted & Booked
                                </span>
                              ) : (
                                <button
                                  onClick={() => setSelectedOfferForPayment({ req, offer })}
                                  className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <ShieldCheck size={14} />
                                  <span>Accept & Pay 20% Advance (BDT {Math.round(offer.offeredPrice * 0.2)})</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE BOOKINGS & PRIVACY UNLOCKED TRACKING */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-6">
          {myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <ShieldCheck size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No confirmed bookings yet</h3>
              <p className="text-xs text-slate-500">
                Accept a technician quote from your requests tab and pay the 20% deposit to confirm.
              </p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                
                {/* Booking Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                        {b.bookingReference}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified 20% Paid ({b.paymentGateway})
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{b.serviceTitle}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-900">
                      Status: {b.status.replace(/_/g, ' ')}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">Total: BDT {b.totalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Milestone & Start Code Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Code PIN */}
                  <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 space-y-1">
                    <div className="text-xs font-semibold text-teal-900">Technician Start Work OTP Code:</div>
                    <div className="text-2xl font-black text-teal-800 font-mono tracking-widest">
                      {b.otpStartCode || '4829'}
                    </div>
                    <p className="text-[11px] text-teal-700">
                      Give this code to <strong>{b.providerName}</strong> only after they arrive at your location to begin work.
                    </p>
                  </div>

                  {/* Financial Settlement */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs text-slate-700">
                    <div className="text-xs font-bold text-slate-900">Payment Breakdown:</div>
                    <div className="flex justify-between">
                      <span>Total Agreed Price:</span>
                      <strong>BDT {b.totalAmount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>20% Advance Paid Online:</span>
                      <strong>- BDT {b.advancePaid.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900 font-bold">
                      <span>Remaining Payable to Provider (Cash/bKash):</span>
                      <strong className="text-teal-800">BDT {b.remainingAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Privacy-Unlocked Contact Card */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Technician Contact & Communication (Unlocked):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PrivacyMaskedField
                      type="phone"
                      actualValue={b.providerPhone}
                      isUnlocked={b.privacyUnlocked}
                      label={`Technician: ${b.providerName}`}
                    />

                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-teal-950">Encrypted Chat Channel</div>
                        <div className="text-[11px] text-teal-700">Share photos and instant coordination</div>
                      </div>
                      <button
                        onClick={() => setActiveChatBooking(b)}
                        className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageSquare size={13} />
                        <span>Open Chat</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Completion Confirmation Trigger */}
                {b.status !== 'COMPLETED' ? (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Work in progress. Once satisfied with the service, confirm completion to release ratings.
                    </span>
                    <button
                      onClick={() => setReviewModalBooking(b)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Confirm Work Done & Rate
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800 font-bold bg-emerald-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Service successfully completed, inspected & rated.</span>
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: DOCTOR APPOINTMENTS */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-4">
          {myAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Stethoscope size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No doctor appointments booked</h3>
              <button onClick={() => onNavigate('doctors')} className="bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                Browse Specialist Doctors
              </button>
            </div>
          ) : (
            myAppointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                      Serial #{apt.serialNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{apt.doctorName}</span>
                  </div>
                  <div className="text-xs text-slate-500">{apt.specialization} &bull; {apt.hospitalChamber}</div>
                  <div className="text-xs text-slate-700 font-medium">
                    Patient: <strong>{apt.patientName}</strong> ({apt.patientAge}y, {apt.patientGender}) &bull; {apt.patientPhone}
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <div className="text-xs font-bold text-slate-900">{apt.appointmentDate} at {apt.timeSlot}</div>
                  <div className="text-[11px] text-emerald-700 font-bold">100% Paid (BDT {apt.consultationFee})</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: HOTEL BOOKINGS */}
      {activeTab === 'HOTELS' && (
        <div className="space-y-4">
          {myHotelBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Hotel size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No hotel reservations</h3>
              <button onClick={() => onNavigate('hotels')} className="bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                Explore Hotels & Resorts
              </button>
            </div>
          ) : (
            myHotelBookings.map((hb) => (
              <div key={hb.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{hb.hotelName}</h4>
                  <div className="text-xs text-teal-800 font-semibold">{hb.roomTitle} &bull; {hb.roomCount} Room(s)</div>
                  <div className="text-xs text-slate-500">
                    Guest: {hb.guestName} &bull; Check-in: {hb.checkInDate} &bull; Check-out: {hb.checkOutDate} ({hb.nights} Nights)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">Total: BDT {hb.totalPrice.toLocaleString()}</div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                    {hb.paymentMode} ({hb.paymentStatus})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: PRODUCT SHOP ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <ShoppingBag size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No shopping orders</h3>
              <button onClick={() => onNavigate('products')} className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
                Browse Products (COD)
              </button>
            </div>
          ) : (
            myOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className="text-slate-400 ml-2">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                    {ord.orderStatus} ({ord.paymentMethod})
                  </span>
                </div>

                <div className="space-y-2">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-700">
                      <span>{it.quantity}x {it.title}</span>
                      <span className="font-semibold">BDT {(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-900">
                  <span>Total (inc. BDT {ord.deliveryFee} delivery):</span>
                  <span>BDT {ord.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: EBOOKS LIBRARY */}
      {activeTab === 'EBOOKS' && (
        <div className="space-y-4">
          {myEbooks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <BookOpen size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No eBooks in your library</h3>
              <button onClick={() => onNavigate('ebooks')} className="bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                Explore eBook Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myEbooks.map((ebp) => (
                <div key={ebp.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
                  <img src={ebp.ebookCover} alt={ebp.ebookTitle} className="w-14 h-20 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{ebp.ebookTitle}</h4>
                    <div className="text-[10px] text-slate-400">Purchased: {new Date(ebp.purchaseDate).toLocaleDateString()}</div>
                    <button
                      onClick={() => alert(`Authorizing PDF download for token: ${ebp.secureDownloadToken}`)}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg"
                    >
                      Read / Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Advance Modal */}
      {selectedOfferForPayment && (
        <PaymentModal
          isOpen={true}
          onClose={() => setSelectedOfferForPayment(null)}
          title="Confirm Booking & 20% Advance"
          serviceTitle={selectedOfferForPayment.req.title}
          totalPrice={selectedOfferForPayment.offer.offeredPrice}
          advanceRate={0.20}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Booking Chat Modal */}
      {activeChatBooking && (
        <BookingChatModal
          booking={activeChatBooking}
          isOpen={true}
          onClose={() => setActiveChatBooking(null)}
        />
      )}

      {/* Customer Rating & Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Rate & Confirm Service</h3>
              <p className="text-xs text-slate-500">How was your experience with {reviewModalBooking.providerName}?</p>
            </div>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingInput(star)}
                  className="p-1 text-2xl transition-transform hover:scale-125"
                >
                  <Star
                    size={28}
                    className={star <= ratingInput ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Write your review:</label>
              <textarea
                rows={3}
                value={reviewTextInput}
                onChange={(e) => setReviewTextInput(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalBooking(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Submit & Complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
