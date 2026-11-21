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
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SupabaseTestResult,
} from '@/lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: SiteBranding;
  profile: GuestProfile;
  onUpdateProfile: (updated: GuestProfile) => void;
  onShowToast: (toast: { message: string }) => void;
  onOpenAdminModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  branding,
  profile,
  onUpdateProfile,
  onShowToast,
  onOpenAdminModal,
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

  // Supabase Config & Connection test
  const [showConfig, setShowConfig] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      const config = getSupabaseConfig();
      setSupabaseUrlInput(config.url || '');
      setSupabaseKeyInput(config.key || '');
    }
  }, [isOpen]);

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

    const cleanTarget = emailOrPhone.trim().toLowerCase();

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Authentication service is not configured.');

      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanTarget,
        token: code,
        type: 'email',
      });

      if (error || !data?.user?.email || !data.session?.access_token) {
        throw new Error('Invalid or expired verification code. Please try again.');
      }

      // Existing members should sign in directly; only first-time members need profile setup.
      const profileResponse = await fetch(
        '/api/auth/profile?email=' + encodeURIComponent(data.user.email.toLowerCase()),
        {
          headers: { Authorization: 'Bearer ' + data.session.access_token },
          cache: 'no-store',
        }
      );

      if (profileResponse.ok) {
        const result = await profileResponse.json();
        const saved = result?.profile;
        if (!saved || saved.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error('This account is not active. Please contact QAAGA support.');
        }

        const restoredProfile: GuestProfile = {
          fullName: saved.fullName || data.user.user_metadata?.full_name || 'Member',
          email: data.user.email.toLowerCase(),
          city: saved.city || 'Dhaka',
          role: saved.role === 'admin' ? 'admin' : saved.role === 'host' ? 'host' : 'guest',
          verified: Boolean(saved.verified),
          identity_status: saved.identity_status || 'unverified',
          status: saved.status,
          phone: saved.phone || undefined,
          avatarUrl: saved.avatarUrl || undefined,
          bio: saved.bio || undefined,
        };

        onUpdateProfile(restoredProfile);
        setStep('success');
        onShowToast({ message: 'Welcome back to QAAGA.' });
        setLoading(false);
        setTimeout(() => onClose(), 900);
        return;
      }

      if (profileResponse.status !== 404) {
        throw new Error('Your account was verified, but QAAGA could not load your profile. Please try again.');
      }

      // A verified Auth user without a public profile completes the one-time setup.
      const prefix = data.user.email.split('@')[0].replace(/[._-]/g, ' ');
      const suggestedName = prefix
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setFullNameInput(data.user.user_metadata?.full_name || suggestedName || 'Member');
      setStep('complete_profile');
      onShowToast({ message: 'Email verified. Complete your profile to finish registration.' });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Unable to verify the code. Please try again.');
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
        role: result.profile?.role === 'host' ? 'host' : 'guest',
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

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
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

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setTestingConnection(false);
    onShowToast({ message: result.message });
  };

  const handleSaveSupabaseConfig = () => {
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    onShowToast({ message: 'Supabase URL and Key updated' });
    handleTestConnection();
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

          {step === 'input' && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Enter your email to receive an instant OTP verification code and set up your account.
            </p>
          )}

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
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] active:scale-[0.99] text-white font-semibold text-base transition-all shadow-[0_4px_16px_rgba(199,43,98,0.25)] flex items-center justify-center cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Continue'}
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
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
                aria-label="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
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

            {/* Supabase Connection Status Banner */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Connected
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-[#C72B62] hover:underline cursor-pointer font-medium"
              >
                {showConfig ? 'Hide Supabase details' : 'Supabase config'}
              </button>
            </div>

            {showConfig && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs animate-in fade-in">
                <div>
                  <p className="font-semibold text-slate-800">Supabase Publishable Key</p>
                  <input
                    type="text"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 bg-white font-mono text-[11px] mt-0.5"
                  />
                </div>
                <div>
                  <label htmlFor="qaaga-supabase-url" className="font-semibold text-slate-800 block">
                    Supabase Project URL
                  </label>
                  <input
                    id="qaaga-supabase-url"
                    type="url"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full p-1.5 rounded border border-slate-300 bg-white font-mono text-[11px] mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#C72B62]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveSupabaseConfig}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Save & Reconnect
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="px-3 py-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                {testResult && (
                  <p className={`text-[11px] font-medium ${testResult.connected ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {testResult.message}
                  </p>
                )}
              </div>
            )}
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
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] active:scale-[0.99] text-white font-semibold text-base transition-all shadow-[0_4px_16px_rgba(199,43,98,0.25)] flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify Code & Continue'}
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
                className={`font-semibold cursor-pointer ${
                  resendCooldown > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-[#C72B62] hover:underline'
                }`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
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
              className="w-full py-3.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-[0_4px_16px_rgba(199,43,98,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Complete Profile & Enter QAAGA</span>
                </>
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
