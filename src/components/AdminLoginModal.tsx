import React, { useState } from 'react';
import { 
  Check, 
  KeyRound, 
  Lock, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  X,
  Zap
} from 'lucide-react';
import { KusanyaBrandLogo } from './KusanyaBrandLogo';
import { api } from '../services/api';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

const PRESET_ADMINS = [
  { name: 'Bright', email: 'bright@kusanya.com', role: 'Super Admin' },
  { name: 'Stephen', email: 'stephen@kusanya.com', role: 'Executive Admin' },
  { name: 'Billy', email: 'billy@kusanya.com', role: 'Finance Admin' },
];

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your @kusanya.com email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.adminLogin(email.trim(), password.trim());
      if (res.success && res.admin) {
        onLoginSuccess(res.admin);
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError('Connection error during admin authorization.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('1234');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 my-0 sm:my-6 max-h-[94dvh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
                Kusanya Admin Portal
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Administrative Sign In
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Authorized portal for Kusanya executives to manage platform collections, featured fundraisers, and disbursements.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* Quick 1-Click Demo Profiles */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick Select Authorized Admin (Password: 1234)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_ADMINS.map((adm) => (
                <button
                  key={adm.email}
                  type="button"
                  onClick={() => handleQuickLogin(adm.email)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    email === adm.email
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                    {adm.name}
                    {email === adm.email && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{adm.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bright@kusanya.com or your @kusanya.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must be an active account ending with <span className="font-semibold text-slate-600">@kusanya.com</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter 1234"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Default credentials: Password is <strong>1234</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Administrative Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
            Protected by Kusanya Uganda Security & KYC Auditing Protocols
          </div>

        </div>

      </div>
    </div>
  );
};
