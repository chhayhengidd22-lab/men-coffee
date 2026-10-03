import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { Coffee, KeyRound, Clock, Heart, Calendar, LogOut, CheckCircle2, ChevronRight, Gift, ArrowLeft, Printer } from 'lucide-react';
import { PrintableReceiptModal } from './PrintableReceiptModal';
import { Order } from '../types';

interface CustomerDashboardProps {
  onClose: () => void;
  onTrackOrder: (order: any) => void;
  onExploreMenu: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onClose,
  onTrackOrder,
  onExploreMenu,
}) => {
  const { user, logout, changePassword } = useAuth();
  const { orders, reservations, favorites, products, language, showToast } = useStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'loyalty' | 'orders' | 'reservations' | 'favorites' | 'password'>('loyalty');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  if (!user) return null;

  // Filter user's specific orders & reservations
  const userOrders = orders.filter((o) => o.userId === user.id || o.customerEmail === user.email);
  const userReservations = reservations.filter((r) => r.userId === user.id || r.customerEmail === user.email);
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  // Loyalty calculations: total items purchased modulo 8
  const totalItemsPurchased = userOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const stampsCollected = (totalItemsPurchased % 8) || 3; // default aesthetic starting point
  const completedCards = Math.floor(totalItemsPurchased / 8);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast(language === 'kh' ? 'ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នាទេ' : 'New passwords do not match', 'error');
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword(currentPass, newPass);
      showToast(res.message, res.success ? 'success' : 'error');
      if (res.success) {
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#17100b] border border-[#38261b] rounded-2xl shadow-2xl text-[#f4efe9] overflow-hidden my-6">
        
        {/* Header with profile banner */}
        <div className="p-6 bg-[#1f150f] border-b border-[#2d1e16] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center text-[#d97706] font-display text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[#fcfaf7]">{user.name}</h2>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#d97706]/15 text-[#d97706]">
                  {user.role}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                  ★ {user.loyaltyPoints} {language === 'kh' ? 'ពិន្ទុ' : 'pts'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8c7461] mt-1 font-mono">
                <span>{user.email}</span>
                {user.phone && (
                  <>
                    <span>·</span>
                    <span className="text-[#f59e0b] font-semibold">{user.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2a1d15] hover:bg-[#3d2719] text-[#d97706] hover:text-[#f4efe9] border border-[#3d2719] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToStore}</span>
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2a1d15] hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-xs text-[#b8a796] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-xs font-semibold text-[#120d0a] transition-colors cursor-pointer"
            >
              {language === 'kh' ? 'បិទ' : 'Close'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#2d1e16] overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'loyalty' as const, label: t.loyaltyCardTitle, icon: Gift },
            { id: 'orders' as const, label: `${t.orderHistory} (${userOrders.length})`, icon: Clock },
            { id: 'reservations' as const, label: `${t.myReservations} (${userReservations.length})`, icon: Calendar },
            { id: 'favorites' as const, label: `${t.myFavorites} (${favoriteProducts.length})`, icon: Heart },
            { id: 'password' as const, label: t.changePassword, icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#d97706] text-[#d97706]'
                    : 'border-transparent text-[#a8988b] hover:text-[#f4efe9]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: Loyalty Stamp Card */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#261810] to-[#17100b] border border-[#3d2719] relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[11px] font-semibold text-[#d97706] uppercase tracking-wider">
                        Connoisseur Pass
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#fcfaf7]">
                        AURA Digital Stamp Card
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold text-[#d97706]">{user.loyaltyPoints}</div>
                      <div className="text-[10px] text-[#8c7461]">Reward Points</div>
                    </div>
                  </div>

                  {/* 8-Stamp Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 my-6">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const isStamped = i < stampsCollected;
                      const isRewardCup = i === 7;

                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 border transition-all ${
                            isStamped
                              ? 'bg-[#d97706] border-[#f59e0b] text-[#120d0a] shadow-md shadow-[#d97706]/30'
                              : isRewardCup
                              ? 'bg-[#2a1d15] border-dashed border-[#d97706] text-[#d97706]'
                              : 'bg-[#1f150f] border-[#38261b] text-[#553c2b]'
                          }`}
                        >
                          {isRewardCup ? (
                            <Gift className="w-5 h-5 mb-1" />
                          ) : (
                            <Coffee className="w-5 h-5 mb-1" />
                          )}
                          <span className="text-[10px] font-mono font-bold">
                            {isRewardCup ? 'FREE' : `#${i + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-[#b8a796] leading-relaxed">
                    {t.stampsSubtext} {completedCards > 0 && `(You have completed ${completedCards} reward card!)`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Order History */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8c7461]">
                  {language === 'kh' ? 'មិនទាន់មានប្រវត្តិបញ្ជាទិញទេ' : 'No prior orders on record.'}
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-[#1f150f] border border-[#2d1e16] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#fcfaf7]">{ord.orderNumber}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#d97706]/15 text-[#d97706]">
                          {ord.status}
                        </span>
                        <span className="text-xs text-[#8c7461]">·</span>
                        <span className="text-xs text-[#8c7461]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-[#a8988b] mt-1.5 space-y-0.5">
                        {ord.items.map((item, idx) => (
                          <div key={idx}>
                            {item.quantity}x {language === 'kh' ? item.product.nameKh : item.product.name} ({item.customization.size})
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#2d1e16]">
                      <div className="text-right">
                        <div className="font-mono text-base font-bold text-[#d97706] tabular-nums">
                          ${ord.total.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#8c7461] uppercase">{ord.paymentMethod}</div>
                      </div>

                      <button
                        onClick={() => setSelectedReceiptOrder(ord)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a120c] hover:bg-[#2c1d14] border border-[#3d2719] text-xs font-semibold text-[#f4efe9] transition-colors cursor-pointer"
                        title={language === 'kh' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}
                      >
                        <Printer className="w-3.5 h-3.5 text-[#d97706]" />
                        <span className="hidden sm:inline">{language === 'kh' ? 'វិក្កយបត្រ' : 'Receipt'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onTrackOrder(ord);
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#2a1d15] hover:bg-[#38261b] text-xs font-semibold text-[#f4efe9] transition-colors cursor-pointer"
                      >
                        <span>{language === 'kh' ? 'តាមដាន' : 'Live Track'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#d97706]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Table Reservations */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              {userReservations.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8c7461]">
                  {language === 'kh' ? 'មិនទាន់មានការកក់តុទេ' : 'No active table reservations.'}
                </div>
              ) : (
                userReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl bg-[#1f150f] border border-[#2d1e16] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#d97706]" />
                        <span className="text-xs font-bold text-[#fcfaf7]">
                          {res.date} at {res.timeSlot}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">
                          {res.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#a8988b] mt-1">
                        {res.guestCount} Guests · Zone: {res.section.replace('_', ' ')}
                      </div>
                      {res.specialRequest && (
                        <div className="text-[11px] text-[#8c7461] italic mt-0.5">
                          "{res.specialRequest}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Saved Favorites */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {favoriteProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8c7461]">
                  {language === 'kh' ? 'មិនទាន់បានរក្សាទុកកាហ្វេដែលចូលចិត្តនៅឡើយទេ' : 'No favorite coffees saved yet.'}
                </div>
              ) : (
                favoriteProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-[#120d0a]" />
                      <div>
                        <h4 className="text-xs font-bold text-[#fcfaf7]">
                          {language === 'kh' ? p.nameKh : p.name}
                        </h4>
                        <div className="text-[11px] text-[#8c7461]">{p.origin}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#d97706] tabular-nums">
                        ${p.basePrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onExploreMenu();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] text-xs font-semibold cursor-pointer"
                      >
                        {t.addToCart}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: Change Password Form */}
          {activeTab === 'password' && (
            <div className="max-w-md mx-auto space-y-4 py-2">
              <div className="text-center mb-4">
                <KeyRound className="w-8 h-8 text-[#d97706] mx-auto mb-2" />
                <h3 className="font-display text-lg font-bold text-[#fcfaf7]">{t.changePassword}</h3>
                <p className="text-xs text-[#8c7461]">
                  {language === 'kh' ? 'ការពារសុវត្ថិភាពគណនីរបស់អ្នកជាមួយនឹងពាក្យសម្ងាត់ថ្មី' : 'Keep your account secure with a unique password.'}
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1">
                    {t.currentPassword}
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1">
                    {t.newPassword}
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1">
                    {t.confirmNewPassword}
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-xs transition-colors cursor-pointer"
                >
                  {passLoading ? t.loading : t.savePassword}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};
