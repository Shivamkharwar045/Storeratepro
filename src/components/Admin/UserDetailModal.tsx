import React from 'react';
import { X, User as UserIcon, Shield, Store, Mail, MapPin, Calendar, Star, Building2, ExternalLink } from 'lucide-react';
import { User } from '../../types';
import { StarRating } from '../StarRating';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const roleConfig = {
    ADMIN: {
      label: 'System Administrator',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Shield,
    },
    STORE_OWNER: {
      label: 'Store Owner',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Store,
    },
    USER: {
      label: 'Normal User',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: UserIcon,
    },
  }[user.role];

  const RoleIcon = roleConfig.icon;
  const isStoreOwner = user.role === 'STORE_OWNER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <RoleIcon className="w-5 h-5" />
            </div>
            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${roleConfig.bg}`}>
                {roleConfig.label}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                User Profile Details
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main User Info Box */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{user.name}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <p className="font-mono text-slate-800 break-all">{user.email}</p>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Registered
                </span>
                <p className="font-mono-numbers text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-xs">
              <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                <MapPin className="w-3.5 h-3.5" /> Address
              </span>
              <p className="text-slate-700 leading-relaxed">{user.address}</p>
            </div>
          </div>

          {/* If the user is a Store Owner, their Rating should also be displayed (Explicit PDF Requirement) */}
          {isStoreOwner && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Store Owner Rating &amp; Storefront
                  </span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                  Managed Business
                </span>
              </div>

              {user.storeName ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">{user.storeName}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 font-mono-numbers">
                      {user.storeRating !== null && user.storeRating !== undefined && user.storeRating > 0
                        ? user.storeRating.toFixed(1)
                        : 'No ratings yet'}
                    </span>
                    {user.storeRating !== null && user.storeRating !== undefined && user.storeRating > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating value={user.storeRating} size="sm" showScore={false} />
                        <span className="text-xs text-slate-500 font-mono-numbers">
                          ({user.storeTotalRatings || 0} customer reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  This user is designated as a Store Owner, but no store is currently assigned to their profile.
                </p>
              )}
            </div>
          )}

          {/* Close button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
