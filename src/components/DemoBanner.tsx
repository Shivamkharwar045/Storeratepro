import React from 'react';
import { Shield, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface DemoBannerProps {
  onRoleSwitch: (role: Role) => void;
  onOpenAuth: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onRoleSwitch, onOpenAuth }) => {
  const { user } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            Campus Roxiler FSDI Assessment:
          </span>
          <span className="text-slate-400">
            {user
              ? `Currently viewing as ${user.role} (${user.name})`
              : 'Sign in to access role-specific dashboards and rating tools'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">1-Click Role Switch:</span>
          <button
            type="button"
            onClick={() => onRoleSwitch('ADMIN')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              user?.role === 'ADMIN'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleSwitch('STORE_OWNER')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              user?.role === 'STORE_OWNER'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Store Owner</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleSwitch('USER')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              user?.role === 'USER'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Normal User</span>
          </button>

          {!user && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="ml-2 text-[11px] underline text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
