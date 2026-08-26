import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Search,
  User,
  Phone,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { DoctorProfile } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { PaymentModal } from '../components/common/PaymentModal';

interface DoctorsViewProps {
  initialDoctorId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({ initialDoctorId, onNavigate }) => {
  const { currentUser } = useAuth();
  const doctors = marketplaceStore.getDoctors();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(
    doctors.find((d) => d.id === initialDoctorId) || null
  );

  useEffect(() => {
    if (bookingDoctor) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setBookingDoctor(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [bookingDoctor]);

  // Booking Form State
  const [patientName, setPatientName] = useState(currentUser?.fullName || 'Mohammad Rafiq');
  const [patientAge, setPatientAge] = useState<number>(34);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '01712-345678');
  const [problemSummary, setProblemSummary] = useState('Routine consultation & checkup');
  const [appointmentDate, setAppointmentDate] = useState('2026-08-25');
  const [selectedSlot, setSelectedSlot] = useState('06:30 PM - 07:00 PM');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const specializations = ['ALL', 'Cardiology & Medicine', 'Child Health & Pediatrics', 'Orthopedics', 'Dermatology', 'Gynecology'];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialization === 'ALL' || doc.specialization.includes(selectedSpecialization);
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospitalChamber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (!bookingDoctor || !currentUser) return;

    marketplaceStore.bookDoctorAppointment({
      doctorId: bookingDoctor.id,
      customerId: currentUser.id,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      problemSummary,
      appointmentDate,
      timeSlot: selectedSlot,
      transactionId: paymentData.transactionId
    });

    setIsPaymentOpen(false);
    setBookingDoctor(null);
    onNavigate('customer_dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
            <Stethoscope size={16} />
            <span>Verified Healthcare & Telemedicine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Book Specialist Doctor Consultation Serial
          </h1>
          <p className="text-xs sm:text-sm text-blue-100">
            BMDC registered specialists &bull; Confirmed chamber appointments &bull; Zero clinic waiting queue
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor by name, specialty, or hospital chamber..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-3 py-2.5 bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={doc.doctorPhoto}
                alt={doc.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-600 shrink-0 shadow-xs"
              />

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{doc.name}</h3>
                    <div className="text-xs font-bold text-blue-700">{doc.specialization}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Consultation</div>
                    <div className="text-sm font-black text-slate-900">BDT {doc.consultationFee}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-500">{doc.degree} &bull; BMDC: {doc.bmdcRegistration}</div>
                <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <MapPin size={13} className="text-blue-600 shrink-0" />
                  <span className="truncate">{doc.hospitalChamber}</span>
                </div>
              </div>
            </div>

            {/* Available Schedule Slots */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Chamber Days: {doc.availableSchedules.map(s => s.day).join(', ')}</span>
                <RatingStars rating={doc.rating} reviewCount={doc.reviewCount} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {doc.availableSchedules.map((s, idx) => (
                  <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {s.day} ({s.startTime} - {s.endTime})
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setBookingDoctor(doc)}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Calendar size={14} />
              <span>Book Appointment Serial (BDT {doc.consultationFee})</span>
            </button>
          </div>
        ))}
      </div>

      {/* APPOINTMENT BOOKING MODAL */}
      {bookingDoctor &&
        createPortal(
          <div
            onClick={() => setBookingDoctor(null)}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
            style={{ minHeight: '100vh', minWidth: '100vw' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full p-6 my-auto shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleUp"
            >
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Book Doctor Consultation Serial</h3>
                  <div className="text-xs text-blue-700 font-semibold">{bookingDoctor.name} &bull; {bookingDoctor.specialization}</div>
                </div>
                <button
                  onClick={() => setBookingDoctor(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleOpenPayment} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name:</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Age:</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender:</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Contact Phone:</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date:</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot:</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      {bookingDoctor.availableSchedules.map((s, idx) => (
                        <option key={idx} value={`${s.day} (${s.startTime} - ${s.endTime})`}>
                          {s.day} ({s.startTime} - {s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Medical Complaint / Summary:</label>
                  <textarea
                    rows={2}
                    value={problemSummary}
                    onChange={(e) => setProblemSummary(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                  100% online advance confirmation of <strong>BDT {bookingDoctor.consultationFee}</strong> guarantees your serial number with no waiting line at {bookingDoctor.hospitalChamber}.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingDoctor(null)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Proceed to Pay BDT {bookingDoctor.consultationFee}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Payment Modal */}
      {isPaymentOpen && bookingDoctor && (
        <PaymentModal
          isOpen={true}
          onClose={() => setIsPaymentOpen(false)}
          title="Doctor Consultation Booking"
          serviceTitle={`Serial with ${bookingDoctor.name} on ${appointmentDate}`}
          totalPrice={bookingDoctor.consultationFee}
          paymentType="FULL_ONLINE_100"
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
