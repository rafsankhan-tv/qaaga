'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Upload,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ListingImage } from '@/components/ListingCard';
import {
  DEFAULT_BRANDING,
  GuestProfile,
  SiteBranding,
  SUPER_ADMIN_EMAIL,
} from '@/data/listings';
import {
  getUserProfileFromDatabase,
  saveUserProfileToDatabase,
  getBookingsFromDatabase,
  cancelBookingInDatabase,
  submitIdentityVerification,
  getIdentityVerifications,
  IdentityVerificationRecord,
  submitPaymentProof,
  getPaymentProofs,
  PaymentProofRecord,
  uploadFileToSupabaseStorage,
  getNotificationsFromDatabase,
} from '@/lib/supabaseService';

interface UserDashboardProps {
  branding?: SiteBranding;
}

export default function UserDashboard({
  branding = DEFAULT_BRANDING,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'verification' | 'payments' | 'notifications'>('bookings');
  const [profile, setProfile] = useState<GuestProfile>({
    fullName: 'Verified Customer',
    email: 'customer@qaaga.com',
    city: 'Kuala Lumpur',
    role: 'customer',
    verified: false,
    identity_status: 'unverified',
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [payments, setPayments] = useState<PaymentProofRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [verifications, setVerifications] = useState<IdentityVerificationRecord[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Cancel Modal State
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Payment Upload Modal State
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [paymentTxRef, setPaymentTxRef] = useState<string>('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>('');
  const [isUploadingSlip, setIsUploadingSlip] = useState<boolean>(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string>('');

  // ID Verification Upload State
  const [docType, setDocType] = useState<'passport' | 'national_id' | 'driving_license'>('passport');
  const [docFrontUrl, setDocFrontUrl] = useState<string>('');
  const [docBackUrl, setDocBackUrl] = useState<string>('');
  const [docSelfieUrl, setDocSelfieUrl] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState<boolean>(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState<string>('');

  // Host Contact View Modal
  const [contactHostModal, setContactHostModal] = useState<{
    hostName: string;
    hostEmail?: string;
    hostPhone?: string;
    listingTitle: string;
  } | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('Kuala Lumpur');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Hydrate Profile & Data
  useEffect(() => {
    let currentEmail = 'customer@qaaga.com';
    try {
      const stored = localStorage.getItem('qaaga_v3_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          currentEmail = parsed.email;
          setProfile(parsed);
          setEditName(parsed.fullName || '');
          setEditPhone(parsed.phone || '');
          setEditCity(parsed.city || 'Kuala Lumpur');
          setEditBio(parsed.bio || '');
          setEditAvatarUrl(parsed.avatarUrl || '');
        }
      }
    } catch {}

    let active = true;
    setLoadingBookings(true);
    setLoadingPayments(true);

    Promise.all([
      getUserProfileFromDatabase(currentEmail),
      getBookingsFromDatabase(currentEmail),
      getPaymentProofs(),
      getIdentityVerifications(currentEmail),
      getNotificationsFromDatabase(currentEmail),
    ])
      .then(([p, bks, pays, idvs, notifs]) => {
        if (!active) return;
        if (p) {
          setProfile(p);
          setEditName(p.fullName || '');
          setEditPhone(p.phone || '');
          setEditCity(p.city || 'Kuala Lumpur');
          setEditBio(p.bio || '');
          setEditAvatarUrl(p.avatarUrl || '');
        }
        setBookings(bks || []);
        const userPays = (pays || []).filter(
          (r) => r.payerEmail.toLowerCase() === currentEmail.toLowerCase()
        );
        setPayments(userPays);
        setVerifications(idvs || []);
        setNotifications(notifs || []);
      })
      .finally(() => {
        if (!active) return;
        setLoadingBookings(false);
        setLoadingPayments(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const updated: GuestProfile = {
      ...profile,
      fullName: editName.trim() || profile.fullName,
      phone: editPhone.trim() || undefined,
      city: editCity.trim() || 'Kuala Lumpur',
      bio: editBio.trim() || undefined,
      avatarUrl: editAvatarUrl || undefined,
    };
    const saved = await saveUserProfileToDatabase(updated);
    setProfile(saved);
    setIsSavingProfile(false);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // Avatar Upload Handler
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFileToSupabaseStorage(file, 'qaaga-avatars');
      if (res.url) {
        setEditAvatarUrl(res.url);
      }
    } catch (err) {
      console.warn('Avatar upload failed:', err);
    }
  };

  // Cancel Booking Handler
  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    setIsCancelling(true);
    await cancelBookingInDatabase(cancelBookingId, cancelReason || 'Cancelled by guest');
    setBookings((prev) =>
      prev.map((b) =>
        b.id === cancelBookingId
          ? { ...b, status: 'Cancelled', cancellationReason: cancelReason }
          : b
      )
    );
    setIsCancelling(false);
    setCancelBookingId(null);
    setCancelReason('');
  };

  // Payment Slip Upload
  const handlePaymentSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSlip(true);
    try {
      const res = await uploadFileToSupabaseStorage(file, 'qaaga-listings');
      if (res.url) {
        setPaymentSlipUrl(res.url);
      }
    } catch (err) {
      console.warn('Slip upload err:', err);
    } finally {
      setIsUploadingSlip(false);
    }
  };

  // Submit Payment Proof
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForPayment || !paymentSlipUrl) return;
    setIsSubmittingPayment(true);
    const res = await submitPaymentProof({
      bookingId: selectedBookingForPayment.id,
      amount: selectedBookingForPayment.totalUsd,
      currency: 'USD',
      paymentMethod,
      transactionReference: paymentTxRef.trim() || `TX-${Date.now().toString().slice(-6)}`,
      proofImageUrl: paymentSlipUrl,
      payerName: profile.fullName,
      payerEmail: profile.email,
    });
    if (res) {
      setPayments((prev) => [res, ...prev]);
      setPaymentSuccessMsg('Payment slip submitted successfully! The host will review and verify your booking.');
      setTimeout(() => {
        setPaymentSuccessMsg('');
        setSelectedBookingForPayment(null);
        setPaymentSlipUrl('');
        setPaymentTxRef('');
      }, 2500);
    }
    setIsSubmittingPayment(false);
  };

  // ID Document Front Upload
  const handleDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back' | 'selfie'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const res = await uploadFileToSupabaseStorage(file, 'qaaga-listings');
      if (res.url) {
        if (type === 'front') setDocFrontUrl(res.url);
        if (type === 'back') setDocBackUrl(res.url);
        if (type === 'selfie') setDocSelfieUrl(res.url);
      }
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Submit ID Verification
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFrontUrl) return;
    setIsSubmittingDoc(true);
    const res = await submitIdentityVerification({
      userEmail: profile.email,
      userName: profile.fullName,
      documentType: docType,
      documentFrontUrl: docFrontUrl,
      documentBackUrl: docBackUrl || undefined,
      selfieUrl: docSelfieUrl || undefined,
    });
    if (res) {
      setVerifications((prev) => [res, ...prev]);
      setProfile((prev) => ({ ...prev, identity_status: 'pending' }));
      setDocSuccessMsg('Identity verification documents submitted! Our compliance team will review within 24 hours.');
      setTimeout(() => {
        setDocSuccessMsg('');
        setDocFrontUrl('');
        setDocBackUrl('');
        setDocSelfieUrl('');
      }, 3000);
    }
    setIsSubmittingDoc(false);
  };

  const isVerifiedUser = profile.verified || profile.identity_status === 'verified';

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
            <Link
              href="/properties"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
            >
              <Search size={14} />
              <span>Find Apartments</span>
            </Link>
            <div className="flex items-center gap-2 pl-2">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  width={32}
                  height={32}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-[#C72B62]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C72B62] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {profile.fullName.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{profile.fullName}</p>
                <span className="text-[10px] text-slate-500 font-medium capitalize">
                  {profile.role || 'Customer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  width={80}
                  height={80}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#C72B62] to-rose-600 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md">
                  {profile.fullName.charAt(0) || 'U'}
                </div>
              )}
              {isVerifiedUser && (
                <span
                  title="Identity Verified"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
                >
                  <CheckCircle2 size={14} />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back, {profile.fullName}
                </h1>
                {isVerifiedUser ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    <ShieldCheck size={13} />
                    <span>ID Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
                    <ShieldAlert size={13} />
                    <span>ID Pending Verification</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {profile.email} · {profile.city || 'Kuala Lumpur'} · Customer Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/properties"
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Search size={14} />
              <span>Book an Apartment</span>
            </Link>
            <Link
              href="/host/dashboard"
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Home size={14} />
              <span>Switch to Host</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar size={15} />
            <span>My Bookings ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User size={15} />
            <span>Profile & Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'verification'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield size={15} />
            <span>Identity Verification</span>
            {verifications.some((v) => v.status === 'pending') && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
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
            <CreditCard size={15} />
            <span>Direct Payments & Proofs ({payments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={15} />
            <span>Notifications ({notifications.length})</span>
          </button>
        </div>

        {/* TAB 1: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Reservations</h2>
                <p className="text-xs text-slate-500">
                  Track booking confirmations, payment proofs, and host contact info
                </p>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Plus size={14} />
                <span>New Reservation</span>
              </Link>
            </div>

            {loadingBookings ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl qaaga-skeleton shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-28 rounded-md qaaga-skeleton" />
                        <div className="h-5 w-3/4 rounded-md qaaga-skeleton" />
                        <div className="h-3.5 w-1/2 rounded-md qaaga-skeleton" />
                      </div>
                    </div>
                    <div className="h-9 w-36 rounded-xl qaaga-skeleton shrink-0" />
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Calendar size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No active bookings found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  You haven&apos;t booked any furnished apartments yet. Explore available residences in Kuala Lumpur.
                </p>
                <Link
                  href="/properties"
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C72B62] text-white text-xs font-bold shadow-xs hover:bg-[#ad2253]"
                >
                  <span>Explore Apartments Now</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((bk) => {
                  const isAccepted = bk.status === 'Accepted' || bk.status === 'Confirmed';
                  const isPending = bk.status === 'Pending';
                  const isCancelled = bk.status === 'Cancelled' || bk.status === 'Rejected';

                  return (
                    <div
                      key={bk.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 relative">
                          <ListingImage
                            src={bk.image || '/assets/kl-ui/kl-1.jpg'}
                            alt={bk.title}
                            sizes="120px"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {bk.status}
                            </span>
                            <span className="font-mono text-slate-500 font-semibold">
                              #{bk.confirmationCode || bk.id}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">
                            {bk.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{bk.area || 'Kuala Lumpur'}</span>
                          </p>

                          <div className="text-xs text-slate-600 mt-2 flex items-center gap-3 flex-wrap">
                            <span>
                              <strong>Dates:</strong> {bk.checkInLabel || `${bk.nights} nights`}
                            </span>
                            <span>
                              <strong>Guests:</strong> {bk.guests || 1}
                            </span>
                            <span>
                              <strong>Total:</strong> ${bk.totalUsd} USD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                        {isAccepted && (
                          <button
                            type="button"
                            onClick={() =>
                              setContactHostModal({
                                hostName: bk.hostName || 'Furnished Apartment Host',
                                hostEmail: bk.hostEmail || 'host@qaaga.com',
                                hostPhone: '+60 12 345 6789',
                                listingTitle: bk.title,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
                          >
                            <Phone size={13} />
                            <span>Host Contact</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedBookingForPayment(bk)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C72B62]/10 hover:bg-[#C72B62]/20 border border-[#C72B62]/20 text-[#C72B62] text-xs font-bold transition-colors"
                        >
                          <Upload size={13} />
                          <span>Upload Payment Slip</span>
                        </button>

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => setCancelBookingId(bk.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                          >
                            <XCircle size={13} />
                            <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & ACCOUNT */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Personal Profile</h2>
            <p className="text-xs text-slate-500 mb-6">
              Update your contact info and personal details stored in Supabase.
            </p>

            {profileSavedToast && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {editAvatarUrl ? (
                    <img
                      src={editAvatarUrl}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C72B62]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <User size={28} />
                    </div>
                  )}
                  <div>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer transition-colors">
                      <Camera size={14} />
                      <span>Upload New Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFile}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">JPG, PNG or WebP under 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#C72B62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+880 1711... / +60 12..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#C72B62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Home City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Kuala Lumpur"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#C72B62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">About / Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell hosts about yourself (frequent traveler, business trip, etc.)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C72B62]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: IDENTITY VERIFICATION */}
        {activeTab === 'verification' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#C72B62]/10 text-[#C72B62] flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Government Identity Verification</h2>
                <p className="text-xs text-slate-500">
                  Required by Malaysian hospitality regulations to book furnished apartments
                </p>
              </div>
            </div>

            {isVerifiedUser ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 size={18} />
                  <span>You are Identity Verified!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Your identity has been verified by the QAAGA Super Admin team. You can make instant reservations on any furnished apartment or room without restrictions.
                </p>
              </div>
            ) : verifications.some((v) => v.status === 'pending') ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <Clock size={18} />
                  <span>Verification Under Review</span>
                </div>
                <p className="text-xs text-amber-700">
                  We have received your document submission. Our compliance team is currently reviewing your identity. This usually takes under 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitVerification} className="space-y-4">
                {docSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {docSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#C72B62]"
                  >
                    <option value="passport">International Passport</option>
                    <option value="national_id">National ID Card (NID / MyKad)</option>
                    <option value="driving_license">Driving License</option>
                  </select>
                </div>

                {/* Front Document Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Front Side Photo <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
                      <Upload size={14} />
                      <span>{docFrontUrl ? 'Change Front Photo' : 'Upload Front Side'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDocUpload(e, 'front')}
                      />
                    </label>
                    {docFrontUrl && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Front uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Back Document Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Back Side Photo (Optional if Passport)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
                      <Upload size={14} />
                      <span>{docBackUrl ? 'Change Back Photo' : 'Upload Back Side'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDocUpload(e, 'back')}
                      />
                    </label>
                    {docBackUrl && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Back uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Selfie Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selfie Holding Document (Verification of Ownership)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
                      <Camera size={14} />
                      <span>{docSelfieUrl ? 'Change Selfie' : 'Take or Upload Selfie'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDocUpload(e, 'selfie')}
                      />
                    </label>
                    {docSelfieUrl && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Selfie uploaded
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!docFrontUrl || isUploadingDoc || isSubmittingDoc}
                  className="px-6 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingDoc ? 'Submitting Verification...' : 'Submit Verification Documents'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & PROOFS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Direct Payment Receipts</h2>
              <p className="text-xs text-slate-500">
                QAAGA supports direct payments between guest and apartment provider (Bank Transfer, bKash, Nagad, Wise, Cash on Check-in).
              </p>
            </div>

            {loadingPayments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-56 rounded-2xl qaaga-skeleton" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <CreditCard size={28} className="text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No payment records yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Once you book an apartment, you can upload your payment slip or transfer confirmation directly to your host.
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
                            : p.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={p.proofImageUrl}
                        alt="Payment Slip"
                        width={400}
                        height={225}
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Method:</span>
                        <strong className="capitalize">{p.paymentMethod.replace('_', ' ')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Amount:</span>
                        <strong className="text-slate-900">${p.amount} {p.currency}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Booking:</span>
                        <span className="font-mono">{p.bookingId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                You have no new alerts or notifications at this time.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#C72B62] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Upload Payment Slip */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Payment Proof</h3>
                <p className="text-xs text-slate-500">
                  {selectedBookingForPayment.title} (${selectedBookingForPayment.totalUsd} USD)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForPayment(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            {paymentSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {paymentSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="bank_transfer">Direct Bank Transfer (Maybank / CIMB / Public Bank)</option>
                    <option value="tng_ewallet">Touch &apos;n Go eWallet</option>
                    <option value="wise">Wise (International Transfer)</option>
                    <option value="cash_checkin">Cash upon Check-in (Host approved)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction Reference / Receipt ID
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentTxRef}
                    onChange={(e) => setPaymentTxRef(e.target.value)}
                    placeholder="e.g. MBB-987654321 / Wise-3498"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Transfer Slip / Receipt Photo
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
                      <Upload size={14} />
                      <span>{paymentSlipUrl ? 'Change Slip' : 'Upload Receipt'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePaymentSlipUpload}
                      />
                    </label>
                    {paymentSlipUrl && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Slip attached
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForPayment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!paymentSlipUrl || isSubmittingPayment}
                    className="px-5 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold disabled:opacity-50"
                  >
                    {isSubmittingPayment ? 'Submitting...' : 'Confirm Submission'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Cancel Booking */}
      {cancelBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Reservation</h3>
            <p className="text-xs text-slate-500">
              Please provide a valid cancellation reason. Your host will be notified immediately.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Flight rescheduling, personal emergency..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#C72B62]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Host Contact Information */}
      {contactHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Host Contact Info</h3>
                <p className="text-xs text-slate-500">{contactHostModal.listingTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setContactHostModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Host Name:</span>
                  <strong className="text-slate-900">{contactHostModal.hostName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Direct Phone / WhatsApp:</span>
                  <strong className="text-emerald-700 font-mono">{contactHostModal.hostPhone}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Host Email:</span>
                  <span className="text-slate-900 font-mono">{contactHostModal.hostEmail}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                You can contact your host directly for key handover instructions, parking access cards, and WiFi credentials.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setContactHostModal(null)}
                className="px-4 py-2 rounded-xl bg-[#C72B62] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
