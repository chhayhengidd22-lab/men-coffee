import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { UserRole } from '../types';
import { X, Lock, Mail, User as UserIcon, Phone, Shield, Sparkles, ArrowLeft, Gift, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, quickSwitchAccount } = useAuth();
  const { language, showToast } = useStore();
  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(identifier, password);
        showToast(res.message, res.success ? 'success' : 'error');
        if (res.success) {
          onSuccess?.();
          onClose();
        }
      } else {
        if (!name.trim() || !phone.trim() || !email.trim() || !password) {
          showToast(language === 'kh' ? 'សូមបំពេញព័ត៌មានទាំងអស់!' : 'Please fill all required fields', 'error');
          return;
        }
        const res = await register(name, email, password, phone);
        showToast(res.message, res.success ? 'success' : 'error');
        if (res.success) {
          onSuccess?.();
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    quickSwitchAccount(role);
    showToast(
      language === 'kh'
        ? `បានចូលគណនីសាកល្បងជា ${role.toUpperCase()}`
        : `Switched session to ${role.toUpperCase()} mode!`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#17100b] border border-[#38261b] rounded-3xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto sm:my-8 max-h-[96vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#2d1e16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] text-[#d97706] hover:text-[#f4efe9] border border-[#38261b] transition-colors cursor-pointer text-xs font-semibold"
              title={t.back}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#fcfaf7]">
                {mode === 'login'
                  ? (language === 'kh' ? 'ចូលគណនីអតិថិជន' : 'Member Sign In')
                  : (language === 'kh' ? 'បង្កើតគណនីថ្មី' : 'Create Customer Account')}
              </h2>
              <p className="text-[11px] text-[#8c7461] mt-0.5">
                {mode === 'login'
                  ? (language === 'kh' ? 'ចូលប្រើប្រាស់ដើម្បីកុម្ម៉ង់កាហ្វេ និងសន្សំពិន្ទុ' : 'Access your profile, orders & rewards')
                  : (language === 'kh' ? 'បង្កើតម្តង រក្សាទុកជារៀងរហូត មិនបាច់ Login ម្តងទៀតទេ' : 'One-time registration · Always kept logged in')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1f150f] hover:bg-[#2a1d15] text-[#a8988b] hover:text-[#f4efe9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 rounded-xl bg-[#120d0a] border border-[#2d1e16] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-[#d97706] text-[#120d0a] font-bold shadow'
                : 'text-[#a8988b] hover:text-[#f4efe9]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{language === 'kh' ? 'ចូលគណនី' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-[#d97706] text-[#120d0a] font-bold shadow'
                : 'text-[#a8988b] hover:text-[#f4efe9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'kh' ? 'បង្កើតគណនី' : 'Create Account'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Registration Perks Banner */}
          {mode === 'register' && (
            <div className="p-3 bg-gradient-to-r from-[#d97706]/15 to-[#b45309]/15 border border-[#d97706]/30 rounded-2xl text-[11px] text-[#fcd34d] flex items-start gap-2.5">
              <Gift className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {language === 'kh' ? 'រង្វាន់ស្វាគមន៍សមាជិកថ្មី៖' : 'New Member Privilege:'}
                </span>
                <p className="mt-0.5 text-[#d4c5b6] leading-relaxed">
                  {language === 'kh'
                    ? 'ចុះឈ្មោះភ្លាម ទទួលបាន +50 ពិន្ទុរង្វាន់ភ្លាមៗ ហើយប្រព័ន្ធនឹងចងចាំគណនីរបស់អ្នករហូត ដោយមិនបាច់ Login ម្តងទៀតទេ!'
                    : 'Get 50 bonus points immediately! Your account stays active and remembered on this device.'}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' ? (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-[#d4c5b6] mb-1 font-semibold uppercase text-[11px] flex items-center justify-between">
                    <span>{language === 'kh' ? 'ឈ្មោះពេញ (Full Name)' : 'Full Name'}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={language === 'kh' ? 'ឧទាហរណ៍៖ សុខា សេង' : 'e.g. Sokha Seng'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] placeholder-[#6b5545] focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[#d4c5b6] mb-1 font-semibold uppercase text-[11px] flex items-center justify-between">
                    <span>{language === 'kh' ? 'លេខទូរស័ព្ទ (Phone Number - ចាំបាច់)' : 'Phone Number (Required)'}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="012 345 678"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] placeholder-[#6b5545] font-mono focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#d4c5b6] mb-1 font-semibold uppercase text-[11px] flex items-center justify-between">
                    <span>{language === 'kh' ? 'អាសយដ្ឋាន Email' : 'Email Address'}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="sokha@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] placeholder-[#6b5545] focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#d4c5b6] mb-1 font-semibold uppercase text-[11px] flex items-center justify-between">
                    <span>{language === 'kh' ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] placeholder-[#6b5545] focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Login: Name, Email, or Phone */}
                <div>
                  <label className="block text-[#d4c5b6] mb-1 font-semibold uppercase text-[11px] flex items-center justify-between">
                    <span>{language === 'kh' ? 'ឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទ' : 'Name, Email, or Phone'}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      placeholder={language === 'kh' ? 'ឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទ' : 'Enter name, email or phone'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] placeholder-[#6b5545] focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#d4c5b6] mb-1 font-semibold uppercase text-[11px] flex items-center justify-between">
                    <span>{language === 'kh' ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] placeholder-[#6b5545] focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#d97706]/20 disabled:opacity-50 mt-2"
            >
              {loading
                ? t.loading
                : mode === 'login'
                ? (language === 'kh' ? 'ចូលគណនី (Sign In)' : 'Sign In')
                : (language === 'kh' ? 'ចុះឈ្មោះ & ចូលប្រើភ្លាមៗ (+50 ពិន្ទុ)' : 'Register & Start Ordering (+50 Pts)')}
            </button>
          </form>

          {/* Switch Mode Prompt */}
          <div className="text-center text-xs text-[#8c7461] pt-1">
            {mode === 'login' ? (
              <span>
                {language === 'kh' ? 'មិនទាន់មានគណនីមែនទេ? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#d97706] font-bold hover:underline cursor-pointer ml-1"
                >
                  {language === 'kh' ? 'ចុះឈ្មោះនៅទីនេះ' : 'Create Account'}
                </button>
              </span>
            ) : (
              <span>
                {language === 'kh' ? 'មានគណនីរួចហើយ? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#d97706] font-bold hover:underline cursor-pointer ml-1"
                >
                  {language === 'kh' ? 'ចូលគណនី' : 'Sign In'}
                </button>
              </span>
            )}
          </div>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-[#2d1e16]">
            <span className="text-[10px] text-[#8c7461] font-mono uppercase block mb-2 text-center">
              {language === 'kh' ? 'ចូលគណនីសាកល្បងរហ័ស (Quick Demo Accounts):' : 'Demo Instant Sign-in:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="p-2 rounded-xl bg-[#1f150f] hover:bg-[#2a1d15] border border-[#2d1e16] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-[#fcfaf7]">Sokha Seng</div>
                <div className="text-[10px] text-[#8c7461]">Customer (50 pts)</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('staff')}
                className="p-2 rounded-xl bg-[#1f150f] hover:bg-[#2a1d15] border border-[#2d1e16] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-[#fcfaf7]">Dara Barista</div>
                <div className="text-[10px] text-[#8c7461]">Staff (POS)</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
