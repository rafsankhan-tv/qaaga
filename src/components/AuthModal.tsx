'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Loader2,
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  User,
  MapPin,
  Sparkles,
  Camera,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SiteBranding, GuestProfile } from '@/data/listings';
import { BrandLogo } from './BrandLogo';
import {
  getSupabase,
} from '@/lib/supabaseClient';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_WEB_CLIENT_ID =
  '135829209048-df2r8snoh6q9el96s1n6an2fs8mtn3dp.apps.googleusercontent.com';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: SiteBranding;
  profile: GuestProfile;
  onUpdateProfile: (updated: GuestProfile) => void;
  onShowToast: (toast: { message: string }) => void;
  onOpenAdminModal?: () => void;
  preferredRole?: 'guest' | 'host';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  branding,
  profile,
  onUpdateProfile,
  onShowToast,
  onOpenAdminModal,
  preferredRole = 'guest',
}) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'complete_profile' | 'success'>('input');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Profile completion fields
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [cityInput, setCityInput] = useState('Dhaka');
  const [roleInput, setRoleInput] = useState<'guest' | 'host'>('guest');
  const [bioInput, setBioInput] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [googleReady, setGoogleReady] = useState(false);

  // Keep the hover highlight directly beneath the pointer.
  const handlePrimaryButtonMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  };

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setRoleInput(preferredRole);
    }
  }, [isOpen, preferredRole]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const mountGoogleButton = () => {
      if (cancelled || !window.google?.accounts.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_WEB_CLIENT_ID,
        callback: async ({ credential }) => {
          if (!credential) {
            setErrorMessage('Google did not return a valid sign-in token. Please try again.');
            return;
          }

          setLoading(true);
          setErrorMessage('');
          try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Authentication service is not configured.');

            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: credential,
            });
            if (error) throw error;

            onShowToast({ message: 'Successfully signed in with Google.' });
            onClose();
          } catch (err: any) {
            setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      });

      setGoogleReady(true);
    };

    if (window.google?.accounts.id) {
      mountGoogleButton();
    } else {
      let script = document.getElementById('google-identity-services') as HTMLScriptElement | null;
      const handleLoad = () => mountGoogleButton();
      const handleError = () => {
        if (!cancelled) setErrorMessage('Google sign-in could not load. Please refresh and try again.');
      };

      if (!script) {
        script = document.createElement('script');
        script.id = 'google-identity-services';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });
      }
    }

    return () => {
      cancelled = true;
      setGoogleReady(false);
    };
  }, [isOpen, onClose, onShowToast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const validateInput = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Please enter your email address';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const err = validateInput(emailOrPhone);
    if (err) {
      setErrorMessage(err);
      return;
    }

    setLoading(true);

    const cleanTarget = emailOrPhone.trim().toLowerCase();

    try {
      // 1. Trigger server-side OTP dispatcher
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanTarget }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to send verification email.');
      }

      setLoading(false);
      setStep('otp');
      setResendCooldown(30);

      // Pre-populate name prediction for Complete Profile step
      {
        const prefix = cleanTarget.split('@')[0].replace(/[._-]/g, ' ');
        const cap = prefix
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setFullNameInput(cap || 'Guest User');
      }

      onShowToast({
        message: `OTP verification code sent to ${cleanTarget}`,
      });

      setTimeout(() => digitRefs.current[0]?.focus(), 120);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Unable to send verification email. Please try again.');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      pasted.forEach((char, idx) => {
        newDigits[idx] = char;
      });
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        handleVerifyOtp(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d.length === 1)) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const cleanTarget = emailOrPhone.trim();
    let isVerified = false;

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Authentication service is not configured.');
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanTarget,
        token: code,
        type: 'email',
      });
      if (!error && data?.user) isVerified = true;
      else if (error) setErrorMessage('Invalid or expired verification code. Please try again.');
    } catch {
      setErrorMessage('Unable to verify the code. Please try again.');
    }

    if (isVerified) {
      setLoading(false);

      // Standard user flow: transition to Complete Profile step!
      setStep('complete_profile');
      onShowToast({
        message: 'OTP verified! Now complete your profile details.',
      });
    } else {
      setLoading(false);
      setErrorMessage('Invalid verification code. Please check the code and try again.');
    }
  };

  const handleSaveCompletedProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput.trim()) {
      setErrorMessage('Full name is required to complete your profile.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const finalEmail = emailOrPhone.trim().toLowerCase();
    const completedProfile: GuestProfile = {
      fullName: fullNameInput.trim(),
      email: finalEmail,
      city: cityInput.trim() || 'Dhaka',
      phone: phoneInput.trim() || undefined,
      role: roleInput,
      bio: bioInput.trim() || undefined,
      avatarUrl: AVATAR_OPTIONS[avatarIndex],
      verified: true,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'active',
    };

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Authentication service is not configured.');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (sessionError || !accessToken) {
        throw new Error('Your login session has expired. Please verify your email again.');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(completedProfile),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to save your profile. Please try again.');
      }

      const savedProfile: GuestProfile = {
        ...completedProfile,
        role: result.profile?.role === 'admin' ? 'admin' : result.profile?.role === 'host' ? 'host' : 'guest',
        verified: Boolean(result.profile?.verified),
      };

      onUpdateProfile(savedProfile);
      setLoading(false);
      setStep('success');
      onShowToast({
        message: `Profile complete! Welcome to qaaga.com, ${savedProfile.fullName}.`,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Unable to save your profile. Please try again.');
    }
  };

  const handleSocialLogin = async (provider: 'apple') => {
    setLoading(true);
    setErrorMessage('');
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setErrorMessage('Authentication service is not configured.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.28)] border border-slate-100 overflow-hidden text-slate-900 transition-all p-6 sm:p-9 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X size={19} />
        </button>

        {/* Top Center: Website Official Brand Logo */}
        <div className="flex flex-col items-center justify-center pt-1 pb-3 text-center">
          <div className="flex items-center justify-center">
            <BrandLogo branding={branding} variant="header" />
          </div>

          <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-950 mt-3.5 tracking-tight">
            {step === 'input' && 'Log in or sign up'}
            {step === 'otp' && 'Enter verification code'}
            {step === 'complete_profile' && 'Complete your profile'}
            {step === 'success' && 'Account verified!'}
          </h2>

          {step === 'otp' && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-slate-900">{emailOrPhone}</span>
            </p>
          )}

          {step === 'complete_profile' && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add your name and details to finalize your verified qaaga.com profile.
            </p>
          )}
        </div>

        {/* STEP 1: Phone / Email Input Form */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
            <div className="space-y-1.5 text-left">
              <label htmlFor="qaaga-auth-input" className="block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <input
                  id="qaaga-auth-input"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@example.com"
                  autoFocus
                  className={`w-full px-4 py-3.5 sm:py-4 rounded-xl border text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                    errorMessage
                      ? 'border-red-500 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-[#C72B62] focus:ring-3 focus:ring-[#C72B62]/15'
                  }`}
                />
              </div>
              {errorMessage && (
                <p className="text-xs text-red-600 font-medium px-1">{errorMessage}</p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseMove={handlePrimaryButtonMouseMove}
              className="qaaga-auth-primary w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <span className="relative z-10 inline-flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin" />
                </span>
              ) : (
                <span className="relative z-10">Continue</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-xs text-slate-500 font-medium lowercase">
                or
              </span>
            </div>

            {/* Social Login Buttons: Google & Apple */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  if (!googleReady || !window.google?.accounts.id) {
                    setErrorMessage('Google sign-in is still loading. Please try again in a moment.');
                    return;
                  }
                  setErrorMessage('');
                  window.google.accounts.id.prompt();
                }}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-60"
                aria-label="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.8 46.98 24.55z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className="w-full h-12 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
                aria-label="Continue with Apple"
              >
                <svg className="w-5 h-5 fill-slate-950" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.63 1.36-.56.65-.99 1.72-.88 2.76 1.01.08 2.02-.52 2.58-1.27z" />
                </svg>
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 'otp' && (
          <div className="space-y-4 pt-2 text-center">
            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    digitRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-300 focus:border-[#C72B62] focus:ring-3 focus:ring-[#C72B62]/15 focus:outline-none transition-all tabular-nums text-slate-900 bg-white"
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
            )}

            {/* Verify Code Button */}
            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpDigits.some((d) => !d)}
              onMouseMove={handlePrimaryButtonMouseMove}
              className="qaaga-auth-primary w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <span className="relative z-10 inline-flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin" />
                </span>
              ) : (
                <span className="relative z-10">Verify Code &amp; Continue</span>
              )}
            </button>

            {/* Resend & Back actions */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                <ArrowLeft size={13} />
                <span>Change email</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={() => handleSendOtp()}
                className={`qaaga-auth-resend ${resendCooldown > 0 ? 'is-disabled' : ''}`}
              >
                <span className="relative z-10">
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete Profile Screen */}
        {step === 'complete_profile' && (
          <form onSubmit={handleSaveCompletedProfile} className="space-y-4 pt-1 text-left animate-in fade-in">
            {/* Avatar Selection */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div className="relative">
                <img
                  src={AVATAR_OPTIONS[avatarIndex]}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-3 border-[#C72B62] shadow-sm"
                />
                <span className="absolute bottom-0 right-0 bg-[#C72B62] text-white p-1 rounded-full shadow">
                  <Check size={12} strokeWidth={3} />
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-2">Choose your avatar:</p>
              <div className="flex items-center gap-2 mt-1.5">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarIndex(idx)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarIndex === idx ? 'border-[#C72B62] scale-110 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Email (Read-only with Verified Badge) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Verified Email</label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                <span>{emailOrPhone}</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md text-[10px]">
                  <CheckCircle2 size={11} /> Verified
                </span>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="qaaga-full-name" className="block text-xs font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="qaaga-full-name"
                type="text"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="e.g. Rafsan Khan"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/15 text-sm focus:outline-none"
              />
            </div>

            {/* Phone & City row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="qaaga-phone" className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="qaaga-phone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+880 1711..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/15 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="qaaga-city" className="block text-xs font-semibold text-slate-700">
                  City / Location
                </label>
                <input
                  id="qaaga-city"
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Dhaka, KL..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/15 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Account Role */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Primary Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'guest' as const, label: 'Guest', desc: 'Book stays' },
                  { id: 'host' as const, label: 'Host', desc: 'List stays' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleInput(r.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      roleInput === r.id
                        ? 'border-[#C72B62] bg-[#C72B62]/[0.08] text-[#C72B62] font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs">{r.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bio / About */}
            <div className="space-y-1">
              <label htmlFor="qaaga-bio" className="block text-xs font-semibold text-slate-700">
                About / Bio
              </label>
              <textarea
                id="qaaga-bio"
                rows={2}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Tell hosts and guests a little about yourself..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/15 text-xs focus:outline-none resize-none"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
            )}

            {/* Save & Complete Button */}
            <button
              type="submit"
              disabled={loading || !fullNameInput.trim()}
              onMouseMove={handlePrimaryButtonMouseMove}
              className="qaaga-auth-primary w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="relative z-10 inline-flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin" />
                </span>
              ) : (
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  <span>Complete Profile &amp; Enter QAAGA</span>
                </span>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 'success' && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Welcome to qaaga.com!
            </h3>
            <p className="text-sm text-slate-600 max-w-xs">
              Your profile has been created and verified via Supabase. You are now logged in as{' '}
              <span className="font-semibold text-slate-900">{fullNameInput || 'Member'}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
