import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 to 5
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  totalRatings?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  interactive = false,
  onChange,
  size = 'md',
  showScore = true,
  totalRatings,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const activeRating = hoverValue !== null ? hoverValue : value;

  return (
    <div className="inline-flex items-center gap-1.5" role={interactive ? 'radiogroup' : undefined}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeRating >= star;
          const isHalf = !isFilled && activeRating >= star - 0.5 && !hoverValue;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(star)}
              onMouseEnter={() => interactive && setHoverValue(star)}
              onMouseLeave={() => interactive && setHoverValue(null)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform duration-100 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded'
                  : 'cursor-default'
              }`}
              title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : `${value} stars`}
              aria-label={`${star} star`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : isHalf
                    ? 'fill-amber-200 text-amber-500'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-slate-700 font-mono-numbers ml-1">
          {value > 0 ? value.toFixed(1) : 'No ratings'}
        </span>
      )}

      {totalRatings !== undefined && (
        <span className="text-xs text-slate-500 font-mono-numbers">
          ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
