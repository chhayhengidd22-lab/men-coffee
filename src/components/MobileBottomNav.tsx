import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { Home, Coffee, Calendar, ShoppingBag, User as UserIcon, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'home' | 'menu' | 'reserve' | 'locations' | 'dashboard' | 'admin';
  setActiveView: (view: 'home' | 'menu' | 'reserve' | 'locations' | 'dashboard' | 'admin') => void;
  onOpenCart: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenDashboard: () => void;
  onOpenAdminGate: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenCart,
  onOpenAuth,
  onOpenDashboard,
  onOpenAdminGate,
}) => {
  const { user, isAuthenticated, isAdminOrStaff } = useAuth();
  const { cart, language } = useStore();
  const t = translations[language];

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleNav = (view: 'home' | 'menu' | 'reserve') => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
    } else {
      onOpenDashboard();
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#140e0a]/95 backdrop-blur-xl border-t border-[#2d1e16] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer ${
            activeView === 'home'
              ? 'text-[#d97706]'
              : 'text-[#8c7461] hover:text-[#f4efe9]'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeView === 'home' ? 'scale-110 bg-[#d97706]/15' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'kh' ? 'ដើម' : 'Home'}
          </span>
        </button>

        {/* 2. Menu */}
        <button
          type="button"
          onClick={() => handleNav('menu')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer ${
            activeView === 'menu'
              ? 'text-[#d97706]'
              : 'text-[#8c7461] hover:text-[#f4efe9]'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeView === 'menu' ? 'scale-110 bg-[#d97706]/15' : ''}`}>
            <Coffee className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {t.navMenu}
          </span>
        </button>

        {/* 3. Table Reserve */}
        <button
          type="button"
          onClick={() => handleNav('reserve')}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer ${
            activeView === 'reserve'
              ? 'text-[#d97706]'
              : 'text-[#8c7461] hover:text-[#f4efe9]'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeView === 'reserve' ? 'scale-110 bg-[#d97706]/15' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {t.navReserve}
          </span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 px-1 text-[#8c7461] hover:text-[#f4efe9] transition-all cursor-pointer"
        >
          <div className="relative p-1 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-[#d97706]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d97706] text-[#120d0a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'kh' ? 'កន្ត្រក' : 'Cart'}
          </span>
        </button>

        {/* 5. User Dashboard / Admin Gate */}
        <button
          type="button"
          onClick={handleAccountClick}
          className="flex flex-col items-center justify-center py-1 px-1 text-[#8c7461] hover:text-[#f4efe9] transition-all cursor-pointer"
        >
          <div className="p-1 rounded-lg">
            {isAuthenticated ? (
              <UserIcon className="w-5 h-5 text-[#d97706]" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-[55px]">
            {isAuthenticated
              ? user?.name.split(' ')[0] || (language === 'kh' ? 'គណនី' : 'Profile')
              : (language === 'kh' ? 'ចូល/ចុះឈ្មោះ' : 'Sign In')}
          </span>
        </button>

      </div>
    </nav>
  );
};
