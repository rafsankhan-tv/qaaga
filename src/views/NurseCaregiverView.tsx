import React, { useState } from 'react';
import {
  HeartPulse,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { NurseProfile, CaregiverProfile } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { PaymentModal } from '../components/common/PaymentModal';

interface NurseCaregiverViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const NurseCaregiverView: React.FC<NurseCaregiverViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const nurses = marketplaceStore.getNurses();
  const caregivers = marketplaceStore.getCaregivers();

  const [activeTab, setActiveTab] = useState<'NURSE' | 'CAREGIVER'>('NURSE');
  const [selectedNurse, setSelectedNurse] = useState<NurseProfile | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverProfile | null>(null);

  // Booking Modal State
  const [packageType, setPackageType] = useState<'HOURLY' | 'DAILY_12H' | 'RESIDENTIAL_24H' | 'MONTHLY'>('DAILY_12H');
  const [durationCount, setDurationCount] = useState<number>(3); // e.g. 3 days
  const [patientCondition, setPatientCondition] = useState('Post-stroke recovery, requires medication administration and vital checks');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const calculateTotalPrice = () => {
    if (selectedNurse) {
      if (packageType === 'HOURLY') return selectedNurse.hourlyRate * durationCount * 4;
      if (packageType === 'DAILY_12H') return selectedNurse.dailyRate * durationCount;
      if (packageType === 'RESIDENTIAL_24H') return Math.round(selectedNurse.dailyRate * 1.7) * durationCount;
      return selectedNurse.monthlyPackageRate || selectedNurse.monthlyRate || 25000;
    }
    if (selectedCaregiver) {
      if (packageType === 'DAILY_12H') return selectedCaregiver.dailyRate * durationCount;
      return selectedCaregiver.monthlyRate;
    }
    return 3000;
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setIsPaymentOpen(false);
    setSelectedNurse(null);
    setSelectedCaregiver(null);
    alert('Home Care Booking Confirmed! Our coordinator will contact you immediately.');
    onNavigate('customer_dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
            <HeartPulse size={16} />
            <span>Certified Home Care & Nursing Support</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Verified Home Nurses & Elderly Caregivers
          </h1>
          <p className="text-xs sm:text-sm text-teal-100">
            12-Hour & 24-Hour Resident Care &bull; Post-operative, Stroke, Dressing & Elderly Support &bull; BNMC Certified
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setActiveTab('NURSE')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'NURSE'
                ? 'bg-white text-teal-950 shadow-md'
                : 'bg-teal-950/60 text-white hover:bg-teal-950 border border-teal-700'
            }`}
          >
            <HeartPulse size={15} />
            <span>Registered Home Nurses ({nurses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CAREGIVER')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'CAREGIVER'
                ? 'bg-white text-teal-950 shadow-md'
                : 'bg-teal-950/60 text-white hover:bg-teal-950 border border-teal-700'
            }`}
          >
            <Users size={15} />
            <span>Elderly & Patient Caregivers ({caregivers.length})</span>
          </button>
        </div>
      </div>

      {/* NURSES STREAM */}
      {activeTab === 'NURSE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nurses.map((n) => (
            <div key={n.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-4">
                <img src={n.photoUrl} alt={n.name} className="w-18 h-18 rounded-2xl object-cover ring-2 ring-teal-600 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{n.name}</h3>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                        {n.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-teal-800">BDT {n.dailyRate} / Day</div>
                      <div className="text-[10px] text-slate-400">BDT {n.hourlyRate} / Hr</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">{n.qualification} &bull; {n.experienceYears} Yrs Exp</div>
                  <div className="text-xs text-slate-600 font-medium">Area: {n.area}, {n.thana}</div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                  <span>Specialized Clinical Services</span>
                  <RatingStars rating={n.rating} reviewCount={n.reviewCount} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {n.services.map((sk, idx) => (
                    <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedNurse(n)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Book Home Nurse
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CAREGIVERS STREAM */}
      {activeTab === 'CAREGIVER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caregivers.map((cg) => (
            <div key={cg.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-4">
                <img src={cg.photoUrl} alt={cg.name} className="w-18 h-18 rounded-2xl object-cover ring-2 ring-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{cg.name}</h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {cg.type} ({cg.gender})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-800">BDT {cg.dailyRate} / Day</div>
                      <div className="text-[10px] text-slate-400">BDT {cg.monthlyRate.toLocaleString()} / Mo</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">{cg.experienceYears} Years Experience &bull; Background Verified</div>
                  <div className="text-xs text-slate-600 font-medium">Available Shifts: {cg.shiftTypes.join(', ')}</div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                  <span>Caregiver Capabilities & Shifts</span>
                  <RatingStars rating={cg.rating} reviewCount={cg.reviewCount} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cg.shiftTypes.map((sk, idx) => (
                    <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {sk} Shift Available
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedCaregiver(cg)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Book Caregiver Attendant
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {(selectedNurse || selectedCaregiver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Book {selectedNurse ? selectedNurse.name : selectedCaregiver?.name}
                </h3>
                <div className="text-xs text-teal-700 font-semibold">
                  {selectedNurse ? 'Registered Nurse' : 'Elderly Caregiver'}
                </div>
              </div>
              <button
                onClick={() => { setSelectedNurse(null); setSelectedCaregiver(null); }}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Shift Package:</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="DAILY_12H">12-Hour Day / Night Shift</option>
                  <option value="RESIDENTIAL_24H">24-Hour Resident Stay</option>
                  <option value="HOURLY">Hourly Visits (Procedures)</option>
                  <option value="MONTHLY">Full Month Contract</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Days / Units):</label>
                  <input
                    type="number"
                    value={durationCount}
                    onChange={(e) => setDurationCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Condition & Special Care Needs:</label>
                <textarea
                  rows={2}
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex justify-between items-center text-teal-900 font-bold">
                <span>Calculated Booking Advance (20%):</span>
                <span>BDT {Math.round(calculateTotalPrice() * 0.2).toLocaleString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedNurse(null); setSelectedCaregiver(null); }}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Pay 20% Deposit (BDT {Math.round(calculateTotalPrice() * 0.2).toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={true}
          onClose={() => setIsPaymentOpen(false)}
          title="Home Care Booking Deposit"
          serviceTitle={`Care for ${patientCondition.slice(0, 30)}...`}
          totalPrice={calculateTotalPrice()}
          advanceRate={0.20}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
