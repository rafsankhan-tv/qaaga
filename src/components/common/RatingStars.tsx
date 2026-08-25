import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={iconSize}
            className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-800 ml-0.5">{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-slate-500 font-normal">({reviewCount})</span>
      )}
    </div>
  );
};
