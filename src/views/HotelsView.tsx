import React, { useState } from 'react';
import {
  Hotel,
  Star,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Coffee,
  Wifi,
  Waves,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { HotelProfile, HotelRoom } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { PaymentModal } from '../components/common/PaymentModal';

interface HotelsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const HotelsView: React.FC<HotelsViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const hotels = marketplaceStore.getHotels();

  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedHotel, setSelectedHotel] = useState<HotelProfile | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  // Reservation form
  const [guestName, setGuestName] = useState(currentUser?.fullName || 'Mohammad Rafiq');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '01712-345678');
  const [checkInDate, setCheckInDate] = useState('2026-09-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-03');
  const [nights, setNights] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [adultCount, setAdultCount] = useState(2);
  const [paymentMode, setPaymentMode] = useState<'FULL_ONLINE' | 'ADVANCE_ONLY' | 'PAY_AT_HOTEL'>('ADVANCE_ONLY');

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const districts = ['ALL', "Cox's Bazar", 'Sylhet', 'Dhaka', 'Chittagong'];

  const filteredHotels = hotels.filter((h) => {
    return selectedDistrict === 'ALL' || h.district === selectedDistrict;
  });

  const calculateRoomTotal = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.pricePerNight * nights * roomCount;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !selectedRoom) return;

    if (paymentMode === 'PAY_AT_HOTEL') {
      marketplaceStore.bookHotelRoom({
        hotelId: selectedHotel.id,
        roomId: selectedRoom.id,
        customerId: currentUser?.id || 'guest',
        guestName,
        guestPhone,
        checkInDate,
        checkOutDate,
        nights,
        roomCount,
        adultCount,
        paymentMode: 'PAY_AT_HOTEL',
        paidAmount: 0
      });
      setSelectedHotel(null);
      setSelectedRoom(null);
      alert('Hotel reservation confirmed! Please pay at check-in counter.');
      onNavigate('customer_dashboard');
    } else {
      setIsPaymentOpen(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (!selectedHotel || !selectedRoom) return;
    marketplaceStore.bookHotelRoom({
      hotelId: selectedHotel.id,
      roomId: selectedRoom.id,
      customerId: currentUser?.id || 'guest',
      guestName,
      guestPhone,
      checkInDate,
      checkOutDate,
      nights,
      roomCount,
      adultCount,
      paymentMode,
      paidAmount: paymentData.amountPaid
    });

    setIsPaymentOpen(false);
    setSelectedHotel(null);
    setSelectedRoom(null);
    onNavigate('customer_dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
            <Hotel size={16} />
            <span>Luxury Resorts & City Hotels</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Book Sea-Facing Resorts & Verified Hotels
          </h1>
          <p className="text-xs sm:text-sm text-teal-100">
            Instant room inventory &bull; Free breakfast &bull; 20% advance booking or pay at hotel check-in
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {districts.map((dist) => (
            <button
              key={dist}
              onClick={() => setSelectedDistrict(dist)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDistrict === dist
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHotels.map((h) => (
          <div key={h.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-52 sm:h-60">
                <img src={h.coverImage} alt={h.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{h.stars} Star</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/70 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                  {h.area}, {h.district}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">{h.name}</h3>
                  <RatingStars rating={h.rating} reviewCount={h.reviewCount} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Facilities: {h.facilities.join(', ')} &bull; {h.address}
                </p>

                {/* Rooms List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Rooms:</div>
                  {h.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{room.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {room.bedType} &bull; {room.capacityAdults} Adults &bull; {room.amenities.join(', ')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-teal-800">BDT {room.pricePerNight.toLocaleString()} / Night</div>
                        <button
                          onClick={() => {
                            setSelectedHotel(h);
                            setSelectedRoom(room);
                          }}
                          className="mt-1 bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-xs cursor-pointer"
                        >
                          Book Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RESERVATION MODAL */}
      {selectedHotel && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedHotel.name}</h3>
                <div className="text-xs text-teal-700 font-semibold">{selectedRoom.title}</div>
              </div>
              <button
                onClick={() => { setSelectedHotel(null); setSelectedRoom(null); }}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-in Date:</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-out Date:</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Nights:</label>
                  <input
                    type="number"
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Count:</label>
                  <input
                    type="number"
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guest Name & Phone:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest Name"
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Guest Phone"
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Preference:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('ADVANCE_ONLY')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      paymentMode === 'ADVANCE_ONLY'
                        ? 'bg-teal-50 border-teal-700 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    20% Advance Online
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('FULL_ONLINE')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      paymentMode === 'FULL_ONLINE'
                        ? 'bg-teal-50 border-teal-700 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    100% Full Online
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('PAY_AT_HOTEL')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      paymentMode === 'PAY_AT_HOTEL'
                        ? 'bg-teal-50 border-teal-700 text-teal-900 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Pay at Hotel
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center font-bold text-slate-900">
                <span>Total Room Cost:</span>
                <span className="text-teal-800 text-sm">BDT {calculateRoomTotal().toLocaleString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedHotel(null); setSelectedRoom(null); }}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {paymentMode === 'PAY_AT_HOTEL'
                    ? 'Confirm Reservation'
                    : `Pay ${paymentMode === 'ADVANCE_ONLY' ? '20% (BDT ' + Math.round(calculateRoomTotal() * 0.2).toLocaleString() + ')' : 'Full (BDT ' + calculateRoomTotal().toLocaleString() + ')'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentOpen && selectedRoom && (
        <PaymentModal
          isOpen={true}
          onClose={() => setIsPaymentOpen(false)}
          title="Hotel Room Reservation"
          serviceTitle={`${selectedRoom.title} at ${selectedHotel?.name} (${nights} Nights)`}
          totalPrice={calculateRoomTotal()}
          advanceRate={paymentMode === 'ADVANCE_ONLY' ? 0.20 : 1.0}
          paymentType={paymentMode === 'ADVANCE_ONLY' ? 'SERVICE_ADVANCE_20' : 'FULL_ONLINE_100'}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
