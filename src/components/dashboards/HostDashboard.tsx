'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Home,
  ImagePlus,
  Layers,
  MapPin,
  Plus,
  Power,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Users,
  Wifi,
  X,
  XCircle,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ListingImage } from '@/components/ListingCard';
import {
  DEFAULT_BRANDING,
  GuestProfile,
  QaagaListing,
  SiteBranding,
} from '@/data/listings';
import {
  getPropertiesByHost,
  insertListingToDatabase,
  deleteListingFromDatabase,
  updatePropertyStatus,
  getBookingsForHost,
  updateBookingStatus,
  getPaymentProofs,
  updatePaymentProofStatus,
  uploadFileToSupabaseStorage,
  getUserProfileFromDatabase,
  PaymentProofRecord,
  PropertyRecord,
} from '@/lib/supabaseService';

interface HostDashboardProps {
  branding?: SiteBranding;
}

const COMMON_FACILITIES = [
  { id: 'wifi', label: 'High-speed WiFi' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'kitchen', label: 'Fully Equipped Kitchen' },
  { id: 'washer', label: 'Washing Machine' },
  { id: 'pool', label: 'Infinity Swimming Pool' },
  { id: 'gym', label: 'Sky Fitness Center' },
  { id: 'parking', label: 'Reserved Covered Parking' },
  { id: 'security', label: '24/7 Guard & Access Card' },
  { id: 'tv', label: 'Smart TV & Netflix' },
  { id: 'balcony', label: 'Skyline Balcony' },
];

export default function HostDashboard({
  branding = DEFAULT_BRANDING,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'payments' | 'calendar' | 'profile'>('listings');
  const [hostProfile, setHostProfile] = useState<GuestProfile>({
    fullName: 'Verified Apartment Host',
    email: 'host@qaaga.com',
    city: 'Kuala Lumpur',
    role: 'host',
    verified: true,
  });

  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [payments, setPayments] = useState<PaymentProofRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add / Edit Property Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('Bukit Bintang');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [roomType, setRoomType] = useState('Entire place');
  const [priceDaily, setPriceDaily] = useState('65');
  const [priceWeekly, setPriceWeekly] = useState('400');
  const [priceMonthly, setPriceMonthly] = useState('1450');
  const [maxGuests, setMaxGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState('1 bedroom');
  const [bathrooms, setBathrooms] = useState(1);
  const [mainPhoto, setMainPhoto] = useState('/assets/kl-ui/kl-1.jpg');
  const [gallery, setGallery] = useState<string[]>(['/assets/kl-ui/kl-1.jpg']);
  const [facilities, setFacilities] = useState<Record<string, boolean>>({
    wifi: true,
    ac: true,
    kitchen: true,
    pool: true,
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // View Customer Payment Proof Modal
  const [viewPaymentProof, setViewPaymentProof] = useState<PaymentProofRecord | null>(null);

  // Reject Request Modal State
  const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Hydration
  useEffect(() => {
    let currentEmail = 'host@qaaga.com';
    try {
      const stored = localStorage.getItem('qaaga_v3_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          currentEmail = parsed.email;
          setHostProfile({ ...parsed, role: 'host' });
        }
      }
    } catch {}

    getUserProfileFromDatabase(currentEmail).then((p) => {
      if (p) setHostProfile({ ...p, role: 'host' });
    });

    // Fetch Host Properties, Incoming Bookings & Payments in parallel
    setLoadingProps(true);
    setLoadingBookings(true);
    setLoadingPayments(true);
    let active = true;

    Promise.all([
      getPropertiesByHost(currentEmail),
      getBookingsForHost(currentEmail),
      getPaymentProofs(),
    ])
      .then(([res, bks, allPays]) => {
        if (!active) return;
        setProperties(res || []);
        setBookings(bks || []);
        setPayments(allPays || []);
      })
      .finally(() => {
        if (!active) return;
        setLoadingProps(false);
        setLoadingBookings(false);
        setLoadingPayments(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Toggle Property Availability (Active / Inactive)
  const handleToggleStatus = async (prop: PropertyRecord) => {
    const nextStatus = prop.status === 'active' ? 'inactive' : 'active';
    await updatePropertyStatus(prop.id, nextStatus);
    setProperties((prev) =>
      prev.map((p) => (p.id === prop.id ? { ...p, status: nextStatus } : p))
    );
  };

  // Delete Property
  const handleConfirmDeleteProperty = async () => {
    if (!deleteConfirmId) return;
    await deleteListingFromDatabase(deleteConfirmId);
    setProperties((prev) => prev.filter((p) => p.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  // Upload Photo to Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const res = await uploadFileToSupabaseStorage(file, 'qaaga-listings');
      if (res.url) {
        setMainPhoto(res.url);
        setGallery((prev) => [res.url, ...prev.filter((p) => p !== res.url)]);
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save / Publish Property
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSavingProperty(true);

    const propId = editingPropertyId || `host-prop-${Date.now()}`;
    const pDaily = parseInt(priceDaily, 10) || 65;
    const pWeekly = parseInt(priceWeekly, 10) || pDaily * 6;
    const pMonthly = parseInt(priceMonthly, 10) || pDaily * 24;

    const payload: QaagaListing = {
      id: propId,
      title: title.trim(),
      description: description.trim() || 'Modern fully furnished apartment with skyline views.',
      area,
      city: 'Kuala Lumpur',
      subType: propertyType,
      category: 'stay',
      twoNightPriceUsd: pDaily * 2,
      rating: '5.0',
      reviewsCount: 1,
      guestFavorite: true,
      image: mainPhoto,
      gallery,
      maxGuests,
      bedrooms,
      hostName: hostProfile.fullName,
      hostYears: 2,
      amenities: Object.keys(facilities).filter((k) => facilities[k]),
      inPopularKL: true,
    };

    const saved = await insertListingToDatabase(payload);
    const fullSaved: PropertyRecord = {
      ...saved,
      hostEmail: hostProfile.email,
      propertyType,
      roomType,
      priceDaily: pDaily,
      priceWeekly: pWeekly,
      priceMonthly: pMonthly,
      status: 'active',
      facilities,
    };

    setProperties((prev) => [fullSaved, ...prev.filter((p) => p.id !== propId)]);
    setIsSavingProperty(false);
    setIsAddModalOpen(false);
    setEditingPropertyId(null);
    setTitle('');
    setDescription('');
  };

  // Open Edit Modal
  const handleOpenEdit = (prop: PropertyRecord) => {
    setEditingPropertyId(prop.id);
    setTitle(prop.title);
    setDescription(prop.description || '');
    setArea(prop.area);
    setPropertyType(prop.subType || 'Apartment');
    setPriceDaily(String(prop.priceDaily || Math.round(prop.twoNightPriceUsd / 2)));
    setPriceWeekly(String(prop.priceWeekly || (prop.priceDaily || 65) * 6));
    setPriceMonthly(String(prop.priceMonthly || (prop.priceDaily || 65) * 24));
    setMaxGuests(prop.maxGuests || 2);
    setBedrooms(prop.bedrooms || '1 bedroom');
    setMainPhoto(prop.image);
    setGallery(prop.gallery || [prop.image]);
    setIsAddModalOpen(true);
  };

  // Accept Booking Request
  const handleAcceptBooking = async (bId: string) => {
    await updateBookingStatus(bId, 'Accepted');
    setBookings((prev) =>
      prev.map((b) => (b.id === bId ? { ...b, status: 'Accepted' } : b))
    );
  };

  // Reject Booking Request
  const handleConfirmReject = async () => {
    if (!rejectBookingId) return;
    await updateBookingStatus(
      rejectBookingId,
      'Rejected',
      rejectReason || 'Unavailable for requested dates'
    );
    setBookings((prev) =>
      prev.map((b) =>
        b.id === rejectBookingId
          ? { ...b, status: 'Rejected', cancellationReason: rejectReason }
          : b
      )
    );
    setRejectBookingId(null);
    setRejectReason('');
  };

  // Verify Payment
  const handleVerifyPayment = async (pId: string) => {
    await updatePaymentProofStatus(pId, 'verified', 'Verified by Apartment Host');
    setPayments((prev) =>
      prev.map((p) => (p.id === pId ? { ...p, status: 'verified' } : p))
    );
    setViewPaymentProof(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              prefetch={true}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Marketplace</span>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <BrandLogo branding={branding} variant="header" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingPropertyId(null);
                setTitle('');
                setDescription('');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Apartment / Room</span>
            </button>

            <Link
              href="/properties"
              prefetch={true}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Home size={14} />
              <span>All Properties</span>
            </Link>

            <Link
              href="/user/dashboard"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <User size={14} />
              <span>Customer View</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Host Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center text-2xl font-black uppercase shadow-md">
              <Home size={32} className="text-[#C72B62]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Host Studio — {hostProfile.fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <ShieldCheck size={13} />
                  <span>Verified Host</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kuala Lumpur Furnished Apartment & Room Management Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Properties</p>
              <p className="text-lg font-black text-slate-900">{properties.length}</p>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Requests</p>
              <p className="text-lg font-black text-[#C72B62]">
                {bookings.filter((b) => b.status === 'Pending').length}
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-slate-400 font-medium">Active Stays</p>
              <p className="text-lg font-black text-emerald-600">
                {bookings.filter((b) => b.status === 'Accepted' || b.status === 'Confirmed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers size={15} />
            <span>My Properties ({properties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'requests'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock size={15} />
            <span>Incoming Booking Requests ({bookings.length})</span>
            {bookings.some((b) => b.status === 'Pending') && (
              <span className="w-2 h-2 rounded-full bg-[#C72B62]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign size={15} />
            <span>Customer Payment Slips ({payments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar size={15} />
            <span>Availability & Pricing</span>
          </button>
        </div>

        {/* TAB 1: MY PROPERTIES */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Hosted Properties</h2>
                <p className="text-xs text-slate-500">
                  Manage active listings, toggle availability, edit pricing and details
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPropertyId(null);
                  setTitle('');
                  setDescription('');
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                <Plus size={14} />
                <span>Add Property</span>
              </button>
            </div>

            {loadingProps ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-4 space-y-3">
                    <div className="w-full aspect-video rounded-2xl qaaga-skeleton" />
                    <div className="h-4 w-2/3 rounded-md qaaga-skeleton" />
                    <div className="h-3.5 w-1/2 rounded-md qaaga-skeleton" />
                    <div className="h-8 w-full rounded-xl qaaga-skeleton" />
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <Home size={28} className="text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No properties listed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Start hosting on QAAGA.com by listing your furnished apartment, condo, or private room.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Publish First Apartment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map((prop) => {
                  const isActive = prop.status === 'active';
                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-video">
                          <ListingImage
                            src={prop.image}
                            alt={prop.title}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                                isActive
                                  ? 'bg-emerald-600/90 text-white'
                                  : 'bg-slate-800/90 text-slate-200'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[11px] font-bold text-white">
                            ${prop.priceDaily || Math.round(prop.twoNightPriceUsd / 2)} / night
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-900">{prop.subType || 'Apartment'}</span>
                            <span>·</span>
                            <span>{prop.area}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                            {prop.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {prop.bedrooms || '1 bedroom'} · Max {prop.maxGuests} guests
                          </p>

                          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                            <span>
                              Weekly: <strong>${prop.priceWeekly || (prop.priceDaily || 60) * 6}</strong>
                            </span>
                            <span>
                              Monthly: <strong>${prop.priceMonthly || (prop.priceDaily || 60) * 24}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prop)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Power size={13} />
                          <span>{isActive ? 'Pause' : 'Activate'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prop)}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
                            title="Edit Listing"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(prop.id)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center text-rose-600 cursor-pointer transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INCOMING BOOKING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Incoming Booking Requests</h2>
            <p className="text-xs text-slate-500">
              Review guest reservations, accept or reject bookings, view contact numbers
            </p>

            {loadingBookings ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-28 rounded-2xl qaaga-skeleton" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <Clock size={28} className="text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No incoming booking requests</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When guests reserve your apartments on QAAGA.com, requests will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const isPending = b.status === 'Pending';
                  const isAccepted = b.status === 'Accepted' || b.status === 'Confirmed';
                  const isRejected = b.status === 'Rejected' || b.status === 'Cancelled';

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isAccepted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.status}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            #{b.confirmationCode || b.id}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                        <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                          <span>
                            <strong>Guest:</strong> {b.customerName || 'Verified Guest'}
                          </span>
                          <span>
                            <strong>Contact:</strong> {b.customerEmail}
                          </span>
                          <span>
                            <strong>Phone:</strong> {b.customerPhone || 'Provided upon acceptance'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>
                            {b.checkInLabel || `${b.nights} nights`}
                          </span>
                          <span>·</span>
                          <span>{b.guests || 1} guest(s)</span>
                          <span>·</span>
                          <span className="font-bold text-slate-900">${b.totalUsd} USD</span>
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAcceptBooking(b.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                          >
                            Accept Booking
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectBookingId(b.id)}
                            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-slate-700"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER PAYMENT SLIPS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Guest Direct Payment Slips</h2>
            <p className="text-xs text-slate-500">
              Inspect bank transfers, Wise receipts, and eWallet slips submitted by your guests.
            </p>

            {loadingPayments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-56 rounded-2xl qaaga-skeleton" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <DollarSign size={28} className="text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No payment proofs submitted yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When guests submit payment transfer slips for your bookings, they will show up here for your verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        {p.transactionReference}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div
                      onClick={() => setViewPaymentProof(p)}
                      className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group relative"
                    >
                      <img
                        src={p.proofImageUrl}
                        alt="Payment Receipt"
                        width={400}
                        height={225}
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payer:</span>
                        <strong className="text-slate-900">{p.payerName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Amount:</span>
                        <strong className="text-slate-900">${p.amount} {p.currency}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Method:</span>
                        <span className="capitalize">{p.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {p.status !== 'verified' && (
                      <button
                        type="button"
                        onClick={() => handleVerifyPayment(p.id)}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Verify & Confirm Payment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AVAILABILITY & PRICING CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Availability & Seasonal Pricing</h2>
                <p className="text-xs text-slate-500">
                  Manage blocked dates and weekend surcharge for Kuala Lumpur properties
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Host Best Practice:</strong> QAAGA properties with active availability and instant booking confirm up to 3.4x faster. Ensure your daily, weekly, and monthly rates are up to date.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-500">Average Daily Rate</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {properties.length > 0
                    ? `$${Math.round(
                        properties.reduce(
                          (sum, p) => sum + (p.priceDaily || Math.round(p.twoNightPriceUsd / 2)),
                          0
                        ) / properties.length
                      )} USD`
                    : '—'}
                </p>
                <span className="text-[11px] text-slate-400">
                  {properties.length > 0 ? `Across ${properties.length} hosted properties` : 'Add a property to set rates'}
                </span>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-500">Weekly Rate Average (7+ nights)</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {properties.length > 0
                    ? `$${Math.round(
                        properties.reduce(
                          (sum, p) => sum + (p.priceWeekly || (p.priceDaily || 65) * 6),
                          0
                        ) / properties.length
                      )} USD`
                    : '—'}
                </p>
                <span className="text-[11px] text-slate-400">Configured per listing</span>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-500">Monthly Furnished Average</p>
                <p className="text-2xl font-black text-[#C72B62] mt-1">
                  {properties.length > 0
                    ? `$${Math.round(
                        properties.reduce(
                          (sum, p) => sum + (p.priceMonthly || (p.priceDaily || 65) * 24),
                          0
                        ) / properties.length
                      )} USD`
                    : '—'}
                </p>
                <span className="text-[11px] text-slate-400">Long-stay monthly furnished rate</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT FURNISHED APARTMENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPropertyId ? 'Edit Apartment Details' : 'Add New Furnished Apartment / Room'}
                </h3>
                <p className="text-xs text-slate-500">
                  Publish to QAAGA.com with instant Supabase database persistence
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Property Photos <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                    <img
                      src={mainPhoto}
                      alt="Property Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
                      <ImagePlus size={15} />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">High resolution landscape photo</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Listing Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Luxury 2BR Sky Suite at Bukit Bintang with Infinity Pool"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#C72B62]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your residence, neighborhood highlights, walking distance to MRT..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C72B62]"
                />
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area / Location</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Bukit Bintang">Bukit Bintang (Golden Triangle)</option>
                    <option value="KLCC">KLCC (Petronas Twin Towers)</option>
                    <option value="Mont Kiara">Mont Kiara (Expat Enclave)</option>
                    <option value="Bangsar">Bangsar (Dining & Boutiques)</option>
                    <option value="Chinatown">Chinatown & Petaling Street</option>
                    <option value="KL Sentral">KL Sentral & Brickfields</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Apartment">Furnished Apartment</option>
                    <option value="Studio">Studio Apartment</option>
                    <option value="Private Room">Private En-suite Room</option>
                    <option value="Sky Condo">Sky Condominium</option>
                    <option value="Penthouse">Sky Penthouse</option>
                    <option value="Villa">Urban Villa</option>
                  </select>
                </div>
              </div>

              {/* Pricing: Daily, Weekly, Monthly */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Rate ($ USD)
                  </label>
                  <input
                    type="number"
                    min="15"
                    required
                    value={priceDaily}
                    onChange={(e) => setPriceDaily(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weekly Rate ($ USD)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={priceWeekly}
                    onChange={(e) => setPriceWeekly(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Rate ($ USD)
                  </label>
                  <input
                    type="number"
                    min="200"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Capacity: Guests, Bedrooms, Bathrooms */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="text"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="1 bedroom / Studio"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Facilities Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Facilities & Amenities Included
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_FACILITIES.map((f) => {
                    const checked = Boolean(facilities[f.id]);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          setFacilities((prev) => ({ ...prev, [f.id]: !checked }))
                        }
                        className={`p-2 rounded-xl border text-xs text-left font-medium flex items-center justify-between cursor-pointer transition-colors ${
                          checked
                            ? 'bg-[#C72B62]/10 border-[#C72B62] text-[#C72B62]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{f.label}</span>
                        {checked && <Check size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProperty}
                  className="px-6 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {isSavingProperty ? 'Saving to Database...' : editingPropertyId ? 'Update Listing' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reject Booking Reason */}
      {rejectBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Decline Booking Request</h3>
            <p className="text-xs text-slate-500">
              Please specify why you cannot host this guest so they can book an alternate apartment.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Apartment maintenance scheduled on these dates..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C72B62]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View Payment Proof Details */}
      {viewPaymentProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Payment Receipt Details</h3>
                <p className="text-xs text-slate-500 font-mono">{viewPaymentProof.transactionReference}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewPaymentProof(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black max-h-80 flex items-center justify-center">
              <img
                src={viewPaymentProof.proofImageUrl}
                alt="Full Slip"
                className="max-h-80 object-contain"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Name:</span>
                <strong className="text-slate-900">{viewPaymentProof.payerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Email:</span>
                <span className="font-mono text-slate-700">{viewPaymentProof.payerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <strong className="text-emerald-700 font-bold">${viewPaymentProof.amount} {viewPaymentProof.currency}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewPaymentProof(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              {viewPaymentProof.status !== 'verified' && (
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(viewPaymentProof.id)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Verify Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Property */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Property Listing?</h3>
            <p className="text-xs text-slate-500">
              This will permanently remove the property listing from Supabase. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProperty}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
