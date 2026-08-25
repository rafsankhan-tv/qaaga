import React, { useState } from 'react';
import {
  UserCheck,
  Wrench,
  Stethoscope,
  HeartPulse,
  Hotel,
  ShoppingBag,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { UserRole } from '../types';

interface RoleRegistrationViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const RoleRegistrationView: React.FC<RoleRegistrationViewProps> = ({ onNavigate }) => {
  const { currentUser, applyForRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('PROVIDER');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [businessName, setBusinessName] = useState('Metro Cooling & Engineering');
  const [nidNumber, setNidNumber] = useState('19942691234567890');
  const [tradeLicense, setTradeLicense] = useState('TRAD/DNCC/2026/04912');
  const [experience, setExperience] = useState('6 Years');
  const [serviceCategories, setServiceCategories] = useState('AC Servicing & Gas Charging, Refrigerator Repair');
  const [submitted, setSubmitted] = useState(false);

  const roles = [
    { role: 'PROVIDER' as UserRole, title: 'Technician / Service Provider', icon: Wrench, desc: 'Receive vetted repair, installation and maintenance leads with instant advance escrow.' },
    { role: 'DOCTOR' as UserRole, title: 'Medical Doctor / Specialist', icon: Stethoscope, desc: 'Publish chamber serial slots and receive 100% online advance bookings.' },
    { role: 'NURSE' as UserRole, title: 'Home Nurse & Caregiver', icon: HeartPulse, desc: 'Provide 12h/24h post-operative, elderly, and patient care contracts.' },
    { role: 'HOTEL_MANAGER' as UserRole, title: 'Hotelier & Resort Owner', icon: Hotel, desc: 'Manage room availability in top tourist hubs with guaranteed reservations.' },
    { role: 'SELLER' as UserRole, title: 'Tools & Spares Merchant', icon: ShoppingBag, desc: 'Sell hardware, electronics, and tools with nationwide Cash on Delivery.' },
    { role: 'RECRUITER' as UserRole, title: 'Company Recruiter / Employer', icon: Briefcase, desc: 'Post technical job opportunities and receive verified resumes.' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      applyForRole(selectedRole);
      onNavigate(
        selectedRole === 'PROVIDER'
          ? 'provider_dashboard'
          : selectedRole === 'SELLER'
          ? 'seller_dashboard'
          : selectedRole === 'DOCTOR'
          ? 'doctors'
          : selectedRole === 'NURSE'
          ? 'nurses'
          : selectedRole === 'HOTEL_MANAGER'
          ? 'hotels'
          : 'jobs'
      );
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 font-bold text-xs px-3.5 py-1 rounded-full border border-teal-200">
          <ShieldCheck size={14} />
          <span>QAAGA Partner Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Join QAAGA Marketplace as a Verified Partner
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Scale your business, get guaranteed advance payments, and gain customer trust with QAAGA NID verification.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl space-y-4 animate-fadeIn">
          <CheckCircle2 size={56} className="text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Application Submitted for KYC Review!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your credentials and NID have been lodged with QAAGA Admin. Switching your active session into partner mode...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          
          {/* Role Selection Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Select Your Partnership Vertical:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{r.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal & Business Info */}
          <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
            <label className="block font-bold text-slate-800 uppercase tracking-wider">
              2. Credentials & Verification Details:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name (as per NID):</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Brand Name:</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Mobile Number:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">National ID (NID / Smart Card):</label>
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trade License / BMDC / BNMC (Optional):</label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experience / Track Record:</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Services / Products Offered:</label>
              <input
                type="text"
                value={serviceCategories}
                onChange={(e) => setServiceCategories(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 flex items-start gap-3">
            <ShieldCheck size={20} className="text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong>QAAGA Privacy & Security Guarantee:</strong> Customer addresses and direct numbers are protected by the Master Privacy Gate until a verified 20% advance is deposited into platform escrow.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Submit Verification & Enter Dashboard</span>
            <ArrowRight size={15} />
          </button>
        </form>
      )}

    </div>
  );
};
