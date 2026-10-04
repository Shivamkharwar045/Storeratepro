import React, { useState, useEffect } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import { StoreWithUserRating } from '../../types';
import { api } from '../../services/api';

interface RateStoreModalProps {
  store: StoreWithUserRating | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSuccess: (message: string) => void;
}

export const RateStoreModal: React.FC<RateStoreModalProps> = ({
  store,
  isOpen,
  onClose,
  onRatingSuccess,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (store && store.userRating) {
      setSelectedRating(store.userRating);
    } else {
      setSelectedRating(5);
    }
    setError(null);
  }, [store]);

  if (!isOpen || !store) return null;

  const isUpdate = store.userRating !== null && store.userRating !== undefined;

  const ratingDescriptions: { [key: number]: string } = {
    1: '1 Star - Poor / Disappointing Experience',
    2: '2 Stars - Fair / Needs Substantial Improvement',
    3: '3 Stars - Average / Meets Basic Expectations',
    4: '4 Stars - Very Good / Highly Recommended',
    5: '5 Stars - Excellent / Outstanding Quality & Service',
  };

  const currentHoverOrSelected = hoverRating !== null ? hoverRating : selectedRating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.submitOrUpdateRating(store.id, selectedRating);
      onRatingSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isUpdate ? 'Modify Submitted Rating' : 'Rate Store'}
            </span>
            <h3 className="text-base font-bold text-slate-900 truncate max-w-xs">{store.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Store Quick Info */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="line-clamp-2 leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-700">Location:</span> {store.address}
            </p>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200/60 font-mono-numbers">
              <span>Overall Rating: ⭐ {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'New'}</span>
              <span>·</span>
              <span>{store.totalRatings} total reviews</span>
            </div>
          </div>

          {/* Star selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-slate-700 mb-3">
              {isUpdate ? 'Select New Rating (1 to 5 Stars):' : 'Choose Your Rating (1 to 5 Stars):'}
            </label>

            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-125 transition-transform duration-100 cursor-pointer focus:outline-none"
                  aria-label={`Select ${star} stars`}
                >
                  <Star
                    className={`w-9 h-9 transition-colors duration-150 ${
                      currentHoverOrSelected >= star
                        ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                        : 'fill-slate-100 text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-slate-700 h-5 transition-all">
              {ratingDescriptions[currentHoverOrSelected]}
            </p>

            {isUpdate && (
              <p className="text-[11px] text-indigo-600 mt-2">
                Your currently recorded rating is <span className="font-semibold">{store.userRating} ⭐</span>. Submitting will update your existing score.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{isSubmitting ? 'Saving...' : isUpdate ? 'Update Rating' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
