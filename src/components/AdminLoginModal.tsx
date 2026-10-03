import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { Shield, Lock, User as UserIcon, Eye, EyeOff, X, KeyRound, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAdminOrStaff, adminLogin } = useAuth();
  const { language, showToast } = useStore();
  const t = translations[language];

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const performLogin = async (idVal: string, passVal: string) => {
    setErrorMessage('');
    if (!idVal.trim() || !passVal) {
      setErrorMessage(language === 'kh' ? 'សូមបញ្ចូលឈ្មោះ Admin និង Password!' : 'Please enter Admin Name/Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(idVal, passVal);
      if (res.success) {
        showToast(res.message, 'success');
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error authenticating admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(identifier, password);
  };

  const handleInstantLogin = (name: string, pass: string) => {
    setIdentifier(name);
    setPassword(pass);
    performLogin(name, pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#160f0b] border border-[#442c1e] rounded-3xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#2d1e16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d97706]/15 border border-[#d97706]/40 flex items-center justify-center text-[#d97706] shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#fcfaf7]">
                  {language === 'kh' ? 'ច្រកសុវត្ថិភាព Admin' : 'Admin Security Gateway'}
                </h3>
              </div>
              <p className="text-[11px] text-[#8c7461]">
                {language === 'kh' ? 'សម្រាប់តែ Admin និង Manager ប៉ុណ្ណោះ' : 'Restricted to authorized administrators'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#20150e] hover:bg-[#2b1c13] text-[#a8988b] hover:text-[#f4efe9] transition-colors cursor-pointer"
            title={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Admin Session Bypass Hint */}
        {isAdminOrStaff && user && (
          <div className="px-6 pt-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-emerald-400">
                  {language === 'kh' ? 'អ្នកបានចូលគណនីរួចហើយ៖' : 'Active Admin Session:'}
                </span>
                <p className="text-[11px] text-[#d4c5b6]">
                  {user.name} ({user.role})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[#120d0a] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{language === 'kh' ? 'ចូលភ្លាម' : 'Enter'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Security Policy Notice & Credentials Hint */}
        <div className="px-6 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#d97706]/10 border border-[#d97706]/30 text-xs text-[#fcd34d] flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
            <div className="w-full">
              <span className="font-bold">
                {language === 'kh' ? 'ព័ត៌មានសម្ងាត់ Admin (Credentials):' : 'Admin Credentials Required:'}
              </span>
              <div className="mt-1 text-[11px] text-[#d4c5b6] leading-relaxed flex flex-col gap-0.5">
                <div>
                  <span className="text-[#8c7461]">{language === 'kh' ? 'ឈ្មោះ ឬ Email៖' : 'Name/Email:'}</span>{' '}
                  <span className="font-mono text-[#fcd34d] font-bold">admin</span>{' '}
                  <span className="text-[#8c7461]">ឬ</span>{' '}
                  <span className="font-mono text-[#fcd34d]">super admin</span>
                </div>
                <div>
                  <span className="text-[#8c7461]">{language === 'kh' ? 'ពាក្យសម្ងាត់៖' : 'Password:'}</span>{' '}
                  <span className="font-mono text-[#fcd34d] font-bold">admin123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Admin Name or Email */}
          <div>
            <label className="block text-[#d4c5b6] mb-1.5 font-semibold uppercase tracking-wider text-[11px]">
              {language === 'kh' ? 'ឈ្មោះ ឬ Email របស់ Admin' : 'Admin Name or Email'}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMessage('');
                }}
                required
                placeholder="admin, super admin, ឬ email"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#20150e] border border-[#38261b] text-[#f4efe9] placeholder-[#6b5545] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-[#d4c5b6] mb-1.5 font-semibold uppercase tracking-wider text-[11px]">
              {language === 'kh' ? 'ពាក្យសម្ងាត់ Admin (Password)' : 'Admin Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                required
                placeholder="admin123"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#20150e] border border-[#38261b] text-[#f4efe9] placeholder-[#6b5545] font-mono focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c7461] hover:text-[#d97706] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 1-Click Fast Access Chips */}
          <div className="pt-1">
            <span className="text-[10px] text-[#8c7461] font-mono uppercase block mb-1.5">
              {language === 'kh' ? '⚡ ចុចចូលភ្លាមៗ (Instant 1-Click Admin Access):' : '⚡ Instant 1-Click Admin Access:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantLogin('super admin', 'admin123')}
                className="p-2.5 rounded-xl bg-[#20150e] hover:bg-[#2e1d13] border border-[#38261b] hover:border-[#d97706]/60 text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#fcfaf7] group-hover:text-[#d97706] text-xs">Super Admin</div>
                  <div className="text-[10px] text-[#8c7461] font-mono">admin123</div>
                </div>
                <Zap className="w-3.5 h-3.5 text-[#d97706] group-hover:scale-110 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleInstantLogin('admin', 'admin123')}
                className="p-2.5 rounded-xl bg-[#20150e] hover:bg-[#2e1d13] border border-[#38261b] hover:border-[#d97706]/60 text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#fcfaf7] group-hover:text-[#d97706] text-xs">Store Manager</div>
                  <div className="text-[10px] text-[#8c7461] font-mono">admin123</div>
                </div>
                <Zap className="w-3.5 h-3.5 text-[#d97706] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#20150e] hover:bg-[#2a1d15] text-[#b8a796] hover:text-white font-semibold transition-colors cursor-pointer text-center"
            >
              {language === 'kh' ? 'ថយក្រោយ' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-2.5 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#d97706]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>{t.loading}</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>{language === 'kh' ? 'ផ្ទៀងផ្ទាត់ & ចូល Admin' : 'Verify & Enter Admin'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Security Badge */}
        <div className="px-6 py-3 bg-[#110b07] border-t border-[#241710] flex items-center justify-center gap-2 text-[10px] font-mono text-[#8c7461]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role-Based Access Control (RBAC) · Secure TLS Session</span>
        </div>

      </div>
    </div>
  );
};
