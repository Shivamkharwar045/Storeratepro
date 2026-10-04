import React, { useState } from 'react';
import { X, Store, AlertCircle, Building2 } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { validateAddress, validateEmail, validateStoreName } from '../../utils/validation';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  storeOwners: User[];
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  storeOwners,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameErr = validateStoreName(name);
    if (nameErr) return setError(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) return setError(emailErr);

    const addrErr = validateAddress(address);
    if (addrErr) return setError(addrErr);

    setIsSubmitting(true);
    try {
      const res = await api.createAdminStore({
        name,
        email,
        address,
        ownerId: ownerId || undefined,
      });
      onSuccess(res.message);
      setName('');
      setEmail('');
      setAddress('');
      setOwnerId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add New Store</h3>
              <p className="text-xs text-slate-500">Register retail outlet and link Store Owner</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Store Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="e.g. Royal Fresh Mart & Bakery"
              required
            />
          </div>

          {/* Store Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="contact@royalfreshmart.com"
              required
            />
          </div>

          {/* Store Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Store Address (max 400 characters)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {address.length}/400 chars
              </span>
            </div>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              maxLength={400}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              placeholder="Full physical address including area, landmark, and city"
              required
            />
          </div>

          {/* Store Owner selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">-- Select Store Owner Account --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            {storeOwners.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1">
                No Store Owner accounts found. You can add one via the &apos;Add User&apos; option.
              </p>
            )}
          </div>

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
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding...' : 'Register Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
