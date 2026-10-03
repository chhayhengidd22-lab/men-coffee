import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { TableReservationSection } from './components/TableReservationSection';
import { LocationsSection } from './components/LocationsSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AuthModal } from './components/AuthModal';
import { ApiArchitectureModal } from './components/ApiArchitectureModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { translations } from './i18n/translations';
import { Shield, User as UserIcon, Code2, ArrowLeft, ChevronRight } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isAdminOrStaff, quickSwitchAccount } = useAuth();
  const { currentTrackingOrder, language, showToast, storeSettings } = useStore();
  const t = translations[language];

  // Dynamically update document title with the custom store name
  useEffect(() => {
    const shopName = language === 'kh'
      ? (storeSettings.shopNameKh || storeSettings.shopName)
      : storeSettings.shopName;
    document.title = `${shopName} | Specialty Roastery & Cafe`;
  }, [storeSettings.shopName, storeSettings.shopNameKh, language]);

  const [activeView, setActiveView] = useState<'home' | 'menu' | 'reserve' | 'locations' | 'dashboard' | 'admin'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Automatically open tracking modal when a new order is placed
  useEffect(() => {
    if (currentTrackingOrder) {
      setIsTrackingOpen(true);
    }
  }, [currentTrackingOrder]);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenAdminGate = () => {
    // Enforce name & password security requirement before granting admin access
    setIsAdminLoginOpen(true);
  };

  const handleDemoQuickSwitch = (role: 'super_admin' | 'admin' | 'staff' | 'customer') => {
    quickSwitchAccount(role);
    showToast(
      language === 'kh'
        ? `បានប្តូរទៅគណនី ${role.toUpperCase()}`
        : `Switched session to ${role.toUpperCase()}`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-[#120d0a] text-[#f4efe9] flex flex-col selection:bg-[#d97706]/30 selection:text-[#fcfaf7]">
      
      {/* Discreet System Quick-Bar */}
      <div className="bg-[#170f0a] border-b border-[#241710] px-3 sm:px-4 py-1 text-[11px] text-[#8c7461]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <span className="font-mono text-[#d97706] font-semibold text-[10px]">Laravel 11.x API Active</span>
            <span className="text-[#3d2719]">·</span>
            <span className="text-[10px] text-[#8c7461] hidden md:inline">
              {language === 'kh' ? 'ប្រព័ន្ធសុវត្ថិភាព Admin & គណនីអតិថិជន' : 'Admin Security Gateway & Customer System'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none py-0.5 text-[10px] font-mono">
            <span className="text-[#6e5848] mr-1 hidden sm:inline">Role preview:</span>
            <button
              onClick={() => handleDemoQuickSwitch('customer')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                user?.role === 'customer'
                  ? 'bg-[#d97706] text-[#120d0a] font-bold'
                  : 'bg-[#1f150f] hover:bg-[#2b1c13] text-[#a8988b]'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => handleDemoQuickSwitch('super_admin')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                user?.role === 'super_admin'
                  ? 'bg-[#d97706] text-[#120d0a] font-bold'
                  : 'bg-[#1f150f] hover:bg-[#2b1c13] text-[#a8988b]'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setIsApiDocsOpen(true)}
              className="ml-1 px-2 py-0.5 rounded bg-[#1f150f] hover:bg-[#2b1c13] text-[#d97706] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3 h-3" />
              <span>API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Structured Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdminGate={handleOpenAdminGate}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Back Navigation Bar for Non-Home Views */}
      {activeView !== 'home' && (
        <div className="bg-[#19110b] border-b border-[#2d1e16] px-4 py-2.5 sm:px-8 sticky top-20 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#d97706] hover:text-[#f4efe9] transition-colors cursor-pointer group bg-[#26170f] hover:bg-[#38261b] px-3 py-1.5 rounded-xl border border-[#3d2719]"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t.backToHome}</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-[#8c7461]">
              <button
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:underline cursor-pointer"
              >
                {language === 'kh' ? 'ទំព័រដើម' : 'Home'}
              </button>
              <span>/</span>
              <span className="text-[#f4efe9] font-medium">
                {activeView === 'menu'
                  ? t.navMenu
                  : activeView === 'reserve'
                  ? t.navReserve
                  : t.navLocations}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-20 lg:pb-0">
        {activeView === 'home' && (
          <>
            <HeroSection
              onExploreMenu={() => {
                setActiveView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onReserveTable={() => {
                setActiveView('reserve');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <MenuSection />
            <TableReservationSection onOpenAuth={() => handleOpenAuth('login')} />
            <LocationsSection />
          </>
        )}

        {activeView === 'menu' && (
          <div className="pt-4">
            <MenuSection />
          </div>
        )}

        {activeView === 'reserve' && (
          <div className="pt-4">
            <TableReservationSection onOpenAuth={() => handleOpenAuth('login')} />
          </div>
        )}

        {activeView === 'locations' && (
          <div className="pt-4">
            <LocationsSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Drawers and Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {isTrackingOpen && (
        <OrderTrackingModal onClose={() => setIsTrackingOpen(false)} />
      )}

      {/* Customer Dashboard */}
      {isDashboardOpen && (
        <CustomerDashboard
          onClose={() => setIsDashboardOpen(false)}
          onTrackOrder={(ord) => {
            setIsTrackingOpen(true);
          }}
          onExploreMenu={() => {
            setActiveView('menu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Admin Name & Password Security Gate */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminOpen(true);
        }}
      />

      {/* Full Admin System Console */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthOpen(false)}
      />

      <ApiArchitectureModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdminGate={handleOpenAdminGate}
      />

      {/* Toast Notifications */}
      <ToastContainer />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
