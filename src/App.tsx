import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { UserDashboard } from './components/User/UserDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { StoreOwnerDashboard } from './components/StoreOwner/StoreOwnerDashboard';
import { AssignmentScheduleView } from './components/Docs/AssignmentScheduleView';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Role } from './types';

const MainLayout: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const [activeView, setActiveView] = useState<string>('stores');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auto-route based on user role when user changes
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      setActiveView('admin');
    } else if (user?.role === 'STORE_OWNER') {
      setActiveView('store-owner');
    } else {
      setActiveView('stores');
    }
  }, [user?.role]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleRoleQuickSwitch = async (role: Role) => {
    try {
      const u = await quickLogin(role);
      addToast(`Logged in as ${role}: ${u.name}`, 'success');
      if (role === 'ADMIN') setActiveView('admin');
      else if (role === 'STORE_OWNER') setActiveView('store-owner');
      else setActiveView('stores');
    } catch (err: any) {
      addToast(err.message || 'Quick switch failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-enterprise-pattern text-slate-100 selection:bg-blue-600 selection:text-white relative transition-colors duration-200">
      {/* Ambient Top Glow Layer */}
      <div className="fixed top-0 left-0 right-0 h-[480px] ambient-top-glow pointer-events-none z-0" />

      {/* Top Demo Banner for 1-Click Role Testing */}
      <div className="relative z-20">
        <DemoBanner
          onRoleSwitch={handleRoleQuickSwitch}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      </div>

      {/* Main Top Navigation Bar (3-Zone Contract) */}
      <div className="relative z-30">
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAuth={handleOpenAuth}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onNotify={addToast}
        />
      </div>

      {/* Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeView === 'admin' && user?.role === 'ADMIN' && (
          <AdminDashboard onNotify={addToast} />
        )}

        {activeView === 'store-owner' && user?.role === 'STORE_OWNER' && (
          <StoreOwnerDashboard onNotify={addToast} />
        )}

        {activeView === 'stores' && (
          <UserDashboard onNotify={addToast} />
        )}

        {activeView === 'assignment-docs' && (
          <AssignmentScheduleView />
        )}

        {/* Fallbacks if someone clicks a view without role permissions */}
        {activeView === 'admin' && user?.role !== 'ADMIN' && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto my-12">
            <h2 className="text-base font-bold text-slate-900">Administrator Access Required</h2>
            <p className="text-xs text-slate-500 mt-2">
              You must be logged in as a System Administrator to access this console.
            </p>
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('ADMIN')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              1-Click Admin Sign In
            </button>
          </div>
        )}

        {activeView === 'store-owner' && user?.role !== 'STORE_OWNER' && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto my-12">
            <h2 className="text-base font-bold text-slate-900">Store Owner Access Required</h2>
            <p className="text-xs text-slate-500 mt-2">
              You must be logged in as a registered Store Owner to access this console.
            </p>
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('STORE_OWNER')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              1-Click Store Owner Sign In
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xs border-t border-slate-200/80 py-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">StoreRate Pro</span>
            <span>·</span>
            <span>Roxiler FSDI Assessment 1 Solution</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>React Frontend</span>
            <span>·</span>
            <span>Express.js Backend</span>
            <span>·</span>
            <span>Role-Based Access Control</span>
            <span>·</span>
            <span>1–5 Star Rating Upsert</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
        onSuccess={(msg) => addToast(msg, 'success')}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={(msg) => addToast(msg, 'success')}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
