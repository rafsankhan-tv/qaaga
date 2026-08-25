import React from 'react';
import { Lock, Phone, MapPin, CheckCircle, ExternalLink } from 'lucide-react';

interface PrivacyMaskedFieldProps {
  type: 'phone' | 'address' | 'coordinates';
  actualValue: string;
  isUnlocked: boolean;
  approximateValue?: string;
  label?: string;
  onCallClick?: () => void;
}

export const PrivacyMaskedField: React.FC<PrivacyMaskedFieldProps> = ({
  type,
  actualValue,
  isUnlocked,
  approximateValue,
  label,
  onCallClick
}) => {
  if (isUnlocked) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-slate-800">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle size={14} className="text-emerald-600" />
            <span>{label || (type === 'phone' ? 'Verified Phone (Unlocked)' : 'Exact Address (Unlocked)')}</span>
          </div>
          <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Payment Verified
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
            {type === 'phone' ? <Phone size={15} className="text-emerald-700" /> : <MapPin size={15} className="text-emerald-700" />}
            <span>{actualValue}</span>
          </div>

          {type === 'phone' && (
            <a
              href={`tel:${actualValue}`}
              onClick={onCallClick}
              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <Phone size={12} />
              <span>Call Now</span>
            </a>
          )}

          {type === 'address' && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(actualValue)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink size={12} />
              <span>Google Maps</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Masked State
  const maskedPhone = actualValue ? actualValue.slice(0, 5) + '••••-••••' : '+880 1••••-••••';
  const maskedAddress = approximateValue || 'Service Area (Exact address hidden)';

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-slate-700">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900">
          <Lock size={13} className="text-amber-700" />
          <span>{label || (type === 'phone' ? 'Phone Number (Protected)' : 'Exact Address (Protected)')}</span>
        </div>
        <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
          Masked Pre-Payment
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-800 tracking-wide font-mono">
          {type === 'phone' ? maskedPhone : maskedAddress}
        </div>
        <div className="text-[11px] text-amber-800 italic bg-amber-100/60 px-2 py-1 rounded-md">
          Unlocks upon 20% advance booking
        </div>
      </div>
    </div>
  );
};
