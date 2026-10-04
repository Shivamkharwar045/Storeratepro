import React, { useState } from 'react';
import {
  Shield,
  Store,
  User as UserIcon,
  LogOut,
  KeyRound,
  RotateCcw,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Role } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenChangePassword: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenChangePassword,
  onNotify,
  activeView,
  setActiveView,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleQuickSwitch = async (role: Role) => {
    setIsSwitching(true);
    try {
      const u = await quickLogin(role);
      onNotify(`Switched active session to ${role} (${u.name})`, 'success');
      if (role === 'ADMIN') setActiveView('admin');
      else if (role === 'STORE_OWNER') setActiveView('store-owner');
      else setActiveView('stores');
    } catch (err: any) {
      onNotify(err.message || 'Quick switch failed', 'error');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset platform data back to initial seed dataset?')) return;
    try {
      await api.resetDemoData();
      onNotify('Database reset to clean demo seed state!', 'success');
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      onNotify(err.message || 'Reset failed', 'error');
    }
  };

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => {
              if (user?.role === 'ADMIN') setActiveView('admin');
              else if (user?.role === 'STORE_OWNER') setActiveView('store-owner');
              else setActiveView('stores');
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                StoreRate <span className="text-blue-600 font-extrabold">Pro</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Certified Retail Store Directory
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setActiveView('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeView === 'admin'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Dashboard
              </button>
            )}

            {user?.role === 'STORE_OWNER' && (
              <button
                type="button"
                onClick={() => setActiveView('store-owner')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeView === 'store-owner'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Store Owner Console
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveView('stores')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeView === 'stores'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stores & Ratings
            </button>

            <button
              type="button"
              onClick={() => setActiveView('assignment-docs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeView === 'assignment-docs'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5-Day Spec Sheet
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <span className="text-[10px] text-slate-500 font-medium px-1.5">Test as:</span>
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => handleRoleQuickSwitch('ADMIN')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  user?.role === 'ADMIN'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to System Administrator (admin@roxiler.com)"
              >
                Admin
              </button>
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => handleRoleQuickSwitch('STORE_OWNER')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  user?.role === 'STORE_OWNER'
                    ? 'bg-white text-amber-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Store Owner (owner.abc@gmail.com)"
              >
                Owner
              </button>
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => handleRoleQuickSwitch('USER')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  user?.role === 'USER'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Normal User (shivam.kharwar@gmail.com)"
              >
                User
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Profile indicator */}
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[140px]" title={user.name}>
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {user.role}
                  </div>
                </div>

                {/* Change Password trigger */}
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Change Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                {/* Reset Data */}
                <button
                  type="button"
                  onClick={handleResetData}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Reset Demo Database"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Logout button */}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onNotify('Logged out successfully.');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Dark / Light Theme Toggle (AI Studio Theme) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-lg border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center ml-1"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
