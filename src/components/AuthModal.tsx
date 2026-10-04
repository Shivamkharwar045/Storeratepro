import React, { useState } from 'react';
import { X, LogIn, UserPlus, Check, AlertCircle, Shield, Store, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateAddress, validateEmail, validateName, validatePassword } from '../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, register, quickLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Validation checks for Signup
  const nameLength = name.trim().length;
  const isNameValid = nameLength >= 20 && nameLength <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPassLength = password.length >= 8 && password.length <= 16;
  const isPassUpper = /[A-Z]/.test(password);
  const isPassSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      onSuccess(`Welcome back, ${loggedUser.name}! Logged in as ${loggedUser.role}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameErr = validateName(name);
    if (nameErr) return setError(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) return setError(emailErr);

    const passErr = validatePassword(password);
    if (passErr) return setError(passErr);

    const addrErr = validateAddress(address);
    if (addrErr) return setError(addrErr);

    setIsSubmitting(true);
    try {
      const registeredUser = await register({ name, email, password, address });
      onSuccess(`Account created! Logged in as ${registeredUser.name}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (role: 'ADMIN' | 'STORE_OWNER' | 'USER') => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await quickLogin(role);
      onSuccess(`Quick logged in as ${user.name} (${user.role})`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {mode === 'login' ? 'Sign in to StoreRate Pro' : 'Create User Account'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Role-based access for Admin, Store Owner & Normal User'
                : 'Sign up to explore and review stores with 1–5 stars'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pre-configured Demo Accounts */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Pre-configured Demo Accounts:
            </span>
            <span className="text-[10px] text-slate-400">1-click instant login</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('ADMIN')}
              className="flex flex-col items-center justify-center py-2 px-1 text-center bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-full">admin@roxiler.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('STORE_OWNER')}
              className="flex flex-col items-center justify-center py-2 px-1 text-center bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 group-hover:text-amber-600">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>Store Owner</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-full">owner.tech@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('USER')}
              className="flex flex-col items-center justify-center py-2 px-1 text-center bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 group-hover:text-emerald-600">
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Normal User</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-full">shivam@gmail.com</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
            }`}
          >
            Create Normal User
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="admin@roxiler.com / user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Full Name (20–60 characters)
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      isNameValid ? 'text-emerald-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {nameLength}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                    nameLength > 0 && !isNameValid ? 'border-amber-300 bg-amber-50/20' : 'border-slate-300'
                  }`}
                  placeholder="e.g. Shivam Kumar Software Engineer"
                  required
                />
                {nameLength > 0 && nameLength < 20 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Needs at least {20 - nameLength} more characters (min 20 characters required).
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password (8–16 chars, 1 uppercase, 1 special)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {password.length}/16 chars
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                  placeholder="e.g. Shivam@123"
                  required
                />

                {/* Password Rule Checklist */}
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Check
                      className={`w-3.5 h-3.5 ${isPassLength ? 'text-emerald-600 font-bold' : 'text-slate-300'}`}
                    />
                    <span className={isPassLength ? 'text-emerald-700 font-medium' : ''}>
                      8–16 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check
                      className={`w-3.5 h-3.5 ${isPassUpper ? 'text-emerald-600 font-bold' : 'text-slate-300'}`}
                    />
                    <span className={isPassUpper ? 'text-emerald-700 font-medium' : ''}>
                      At least 1 uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check
                      className={`w-3.5 h-3.5 ${isPassSpecial ? 'text-emerald-600 font-bold' : 'text-slate-300'}`}
                    />
                    <span className={isPassSpecial ? 'text-emerald-700 font-medium' : ''}>
                      At least 1 special character (@, #, $, !, etc.)
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Address (max 400 characters)
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                  placeholder="Street, City, State, Postal Code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isNameValid || !isAddressValid || !isPassLength || !isPassUpper || !isPassSpecial}
                className="w-full mt-2 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Account...' : 'Complete Registration'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
