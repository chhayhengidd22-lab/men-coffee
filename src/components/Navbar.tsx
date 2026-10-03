import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Shield, 
  Globe, 
  ArrowLeft, 
  Menu as MenuIcon, 
  X as CloseIcon, 
  Sparkles, 
  LogOut, 
  ChevronDown, 
  Coffee,
  Code2
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenDashboard: () => void;
  onOpenAdminGate: () => void;
  onOpenApiDocs: () => void;
  activeView: 'home' | 'menu' | 'reserve' | 'locations' | 'dashboard' | 'admin';
  setActiveView: (view: 'home' | 'menu' | 'reserve' | 'locations' | 'dashboard' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenAuth,
  onOpenDashboard,
  onOpenAdminGate,
  onOpenApiDocs,
  activeView,
  setActiveView,
}) => {
  const { user, isAuthenticated, isAdminOrStaff, logout } = useAuth();
  const { cart, language, setLanguage, storeSettings } = useStore();
  const t = translations[language];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleLanguage = () => {
    setLanguage(language === 'kh' ? 'en' : 'kh');
  };

  const handleNavClick = (view: 'home' | 'menu' | 'reserve' | 'locations' | 'dashboard' | 'admin') => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shopDisplayName = language === 'kh' ? storeSettings.shopNameKh || storeSettings.shopName : storeSettings.shopName;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#120d0a]/95 backdrop-blur-md border-b border-[#2d1e16] transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        
        {/* ================= ZONE 1: BRAND LOGO & SHOP NAME ================= */}
        <div className="flex items-center gap-3 shrink-0">
          {activeView !== 'home' && (
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1c120c] hover:bg-[#2a1c12] text-[#d97706] hover:text-[#f4efe9] border border-[#38261b] transition-all cursor-pointer text-xs font-semibold"
              title={t.backToHome}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.back}</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            {storeSettings.logo ? (
              <img
                src={storeSettings.logo}
                alt="Store Logo"
                className="w-10 h-10 rounded-xl object-contain bg-[#1c120c] p-1 border border-[#38261b] shadow-sm shrink-0 group-hover:border-[#d97706]/60 transition-colors"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#1c120c] border border-[#38261b] flex items-center justify-center text-[#d97706] shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#f4efe9] group-hover:text-[#d97706] transition-colors line-clamp-1">
                {shopDisplayName}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#8c7461]">
                {language === 'kh' ? 'ហាងកាហ្វេពិសេស' : 'Specialty Roastery'}
              </span>
            </div>
          </button>
        </div>

        {/* ================= ZONE 2: CENTER CLEAN NAVIGATION (DESKTOP) ================= */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full bg-[#18100b] border border-[#2d1e16]">
          {[
            { id: 'home' as const, label: language === 'kh' ? 'ទំព័រដើម' : 'Home' },
            { id: 'menu' as const, label: t.navMenu },
            { id: 'reserve' as const, label: t.navReserve },
            { id: 'locations' as const, label: t.navLocations },
          ].map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#d97706] text-[#120d0a] font-bold shadow-sm shadow-[#d97706]/30'
                    : 'text-[#c4b5a5] hover:text-[#f4efe9] hover:bg-[#231710]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ================= ZONE 3: ACTIONS & ACCESS GATEWAY (RIGHT) ================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-xl bg-[#1a110b] border border-[#2d1e16] text-[#c4b5a5] hover:text-[#f4efe9] hover:border-[#d97706]/40 transition-colors cursor-pointer"
            title="Switch Language (ភាសាខ្មែរ / English)"
          >
            <Globe className="w-3.5 h-3.5 text-[#d97706]" />
            <span className="font-mono text-[11px] font-bold">{language === 'kh' ? 'ខ្មែរ' : 'EN'}</span>
          </button>

          {/* Shopping Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-[#1a110b] border border-[#2d1e16] text-[#f4efe9] hover:border-[#d97706]/50 transition-colors cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#d97706]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#d97706] text-[#120d0a] text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-mono shadow">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Account / Membership Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#1a110b] border border-[#38261b] hover:border-[#d97706]/50 transition-colors cursor-pointer text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center text-[#d97706] font-bold font-mono text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-[#f4efe9] max-w-[90px] truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    ★ {user.loyaltyPoints} {language === 'kh' ? 'ពិន្ទុ' : 'pts'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8c7461]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1a110b] border border-[#38261b] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-[#2d1e16]">
                    <div className="font-bold text-xs text-[#fcfaf7]">{user.name}</div>
                    <div className="text-[10px] text-[#8c7461] font-mono truncate">{user.email}</div>
                    {user.phone && (
                      <div className="text-[10px] text-[#f59e0b] font-mono mt-0.5">{user.phone}</div>
                    )}
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#d4c5b6] hover:text-[#f4efe9] hover:bg-[#251710] rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-[#d97706]" />
                      <span>{language === 'kh' ? 'ផ្ទាំងព័ត៌មាន (User Dashboard)' : 'My Dashboard'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'kh' ? 'ចាកចេញពីគណនី' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sign In */}
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex px-3 py-2 text-xs font-semibold text-[#c4b5a5] hover:text-[#f4efe9] hover:bg-[#1a110b] rounded-xl transition-colors cursor-pointer"
              >
                {language === 'kh' ? 'ចូលគណនី' : 'Sign In'}
              </button>

              {/* Create Account / Register (Very visible and convenient as requested) */}
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold text-[#120d0a] bg-gradient-to-r from-[#d97706] to-[#f59e0b] hover:from-[#b45309] hover:to-[#d97706] rounded-xl transition-all cursor-pointer shadow-md shadow-[#d97706]/20 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'kh' ? 'បង្កើតគណនី' : 'Register'}</span>
              </button>
            </div>
          )}

          {/* Dedicated Protected Admin Access Gate */}
          <button
            onClick={onOpenAdminGate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#fcfaf7] bg-[#2a170e] hover:bg-[#3d2315] border border-[#d97706]/40 hover:border-[#d97706] rounded-xl transition-all cursor-pointer shadow-sm"
            title={language === 'kh' ? 'ច្រកសុវត្ថិភាព Admin (ត្រូវមាន Name & Password)' : 'Admin Security Portal (Requires Name & Password)'}
          >
            <Shield className="w-3.5 h-3.5 text-[#d97706]" />
            <span className="hidden xl:inline">{language === 'kh' ? 'ច្រក Admin' : 'Admin Portal'}</span>
            <span className="xl:hidden">Admin</span>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#1a110b] border border-[#2d1e16] text-[#c4b5a5] hover:text-[#f4efe9] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="w-5 h-5 text-[#d97706]" />
            ) : (
              <MenuIcon className="w-5 h-5 text-[#d97706]" />
            )}
          </button>

        </div>
      </div>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#160e0a] border-b border-[#2d1e16] px-4 py-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Section 1: Core Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#8c7461] tracking-wider px-2">
              {language === 'kh' ? 'ម៉ឺនុយទំព័រ (Navigation)' : 'Navigation'}
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'home' as const, label: language === 'kh' ? 'ទំព័រដើម' : 'Home' },
                { id: 'menu' as const, label: t.navMenu },
                { id: 'reserve' as const, label: t.navReserve },
                { id: 'locations' as const, label: t.navLocations },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-center cursor-pointer ${
                    activeView === item.id
                      ? 'bg-[#d97706] text-[#120d0a] shadow'
                      : 'bg-[#1f150f] text-[#c4b5a5] hover:bg-[#2b1c13] hover:text-[#f4efe9]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: User Account & Dashboard */}
          <div className="pt-2 border-t border-[#241710] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#8c7461] tracking-wider px-2">
              {language === 'kh' ? 'គណនីអតិថិជន (User Membership)' : 'Customer Membership'}
            </span>

            {isAuthenticated && user ? (
              <div className="p-3.5 rounded-2xl bg-[#1f150f] border border-[#38261b] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center text-[#d97706] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#fcfaf7]">{user.name}</div>
                      <div className="text-[10px] text-[#8c7461] font-mono">{user.phone || user.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    ★ {user.loyaltyPoints} pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenDashboard();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs text-center cursor-pointer transition-colors"
                  >
                    {language === 'kh' ? 'បើកផ្ទាំង Dashboard' : 'Open My Dashboard'}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="py-2 px-3 rounded-xl bg-[#2a170e] text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {language === 'kh' ? 'ចាកចេញ' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs text-center cursor-pointer transition-all shadow"
                >
                  {language === 'kh' ? '✨ បង្កើតគណនី (+50 pts)' : '✨ Register Account'}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#1f150f] hover:bg-[#2b1c13] text-[#f4efe9] font-semibold text-xs text-center cursor-pointer border border-[#38261b]"
                >
                  {language === 'kh' ? 'ចូលគណនី (Sign In)' : 'Sign In'}
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Admin Security Gate */}
          <div className="pt-2 border-t border-[#241710] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#8c7461] tracking-wider px-2">
              {language === 'kh' ? 'ផ្នែកគ្រប់គ្រងហាង (Store Administration)' : 'Store Administration'}
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminGate();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#20120b] border border-[#d97706]/40 hover:border-[#d97706] text-[#fcfaf7] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <Shield className="w-4 h-4 text-[#d97706]" />
                <span>{language === 'kh' ? 'ច្រកសុវត្ថិភាព Admin (Name & Pass)' : 'Admin Portal (Name & Password)'}</span>
              </div>
              <span className="text-[10px] font-mono text-[#d97706] uppercase bg-[#d97706]/10 px-2 py-0.5 rounded">
                Console
              </span>
            </button>
          </div>

          {/* Section 4: API & Architecture */}
          <div className="pt-1 flex items-center justify-between text-xs text-[#8c7461]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApiDocs();
              }}
              className="flex items-center gap-1.5 hover:text-[#d97706] transition-colors cursor-pointer font-mono text-[11px]"
            >
              <Code2 className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Laravel 11 REST API Docs</span>
            </button>
            <span className="text-[10px] font-mono">v2.4.0</span>
          </div>

        </div>
      )}
    </header>
  );
};
