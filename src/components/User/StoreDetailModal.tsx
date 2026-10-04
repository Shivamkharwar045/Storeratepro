import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Star,
  Share2,
  Copy,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { StoreWithUserRating } from '../../types';
import { StarRating } from '../StarRating';

interface StoreDetailModalProps {
  store: StoreWithUserRating | null;
  isOpen: boolean;
  onClose: () => void;
  onRateClick: (store: StoreWithUserRating) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  store,
  isOpen,
  onClose,
  onRateClick,
  onNotify,
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !store) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(store.address);
    setCopied(true);
    onNotify('Address copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const hasRated = store.userRating !== null && store.userRating !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Store Image Banner */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
          {store.imageUrl && !imageError ? (
            <img
              src={store.imageUrl}
              alt={store.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white p-6 text-center">
              <Building2 className="w-12 h-12 text-slate-500 mb-2" />
              <span className="text-sm font-semibold">{store.name}</span>
              <span className="text-xs text-slate-400 mt-1">{store.category || 'Retail Store'}</span>
            </div>
          )}

          {/* Gradient Scrim for Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Verified Badge */}
          <div className="absolute top-3 left-3 bg-white/95 text-slate-900 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Verified Listing</span>
          </div>

          {/* Store Name Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              {store.category || 'Retail Store'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {store.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Rating & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
                  {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'New'}
                </span>
                <div className="flex items-center gap-1">
                  <StarRating value={store.overallRating} size="md" showScore={false} />
                  <span className="text-xs text-slate-500 font-mono-numbers ml-1">
                    ({store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {hasRated ? (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>You reviewed this store ({store.userRating} ⭐)</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  You haven&apos;t reviewed this store yet.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onRateClick(store);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{hasRated ? 'Modify Your Review' : 'Rate this Business'}</span>
            </button>
          </div>

          {/* Essential Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            {/* Address */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900 block">Address</span>
                <span className="text-slate-600 block leading-relaxed mt-0.5">{store.address}</span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy address'}</span>
                </button>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Operating Hours</span>
                <span className="text-emerald-700 font-semibold block mt-0.5">
                  {store.operatingHours || 'Open · Closes 10:00 PM'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Monday – Sunday</span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Contact Phone</span>
                <span className="text-slate-600 font-mono block mt-0.5">
                  {store.phone || '+91 755 244 8900'}
                </span>
              </div>
            </div>

            {/* Manager / Owner */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Store Management</span>
                <span className="text-slate-600 block mt-0.5">
                  {store.ownerName ? `Managed by ${store.ownerName}` : 'Verified Retail Partner'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified Roxiler Consumer Rating Partner</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
