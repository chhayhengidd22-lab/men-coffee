import React from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { X, Trash2, Plus, Minus, Coffee, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOpenCheckout }) => {
  const { cart, updateCartQuantity, removeFromCart, language } = useStore();
  const t = translations[language];

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-2 sm:pl-10">
        <div className="w-screen max-w-md bg-[#17100b] border-l border-[#38261b] shadow-2xl flex flex-col text-[#f4efe9]">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#2d1e16] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] text-[#d97706] hover:text-[#f4efe9] border border-[#38261b] text-xs font-semibold transition-colors cursor-pointer mr-1"
                title={t.backToMenu}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.back}</span>
              </button>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#fcfaf7]">
                {t.cartTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] text-[#a8988b] hover:text-[#f4efe9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <Coffee className="w-12 h-12 text-[#4a3426] mb-3" />
                <p className="text-sm font-semibold text-[#b8a796]">{t.cartEmpty}</p>
                <p className="text-xs text-[#7d6856] mt-1 max-w-xs">{t.cartEmptyDesc}</p>
                <button
                  onClick={onClose}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] border border-[#d97706]/40 text-[#d97706] text-xs font-semibold cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToMenu}</span>
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#1f150f] border border-[#2d1e16] flex gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-[#120d0a] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#fcfaf7] truncate">
                        {language === 'kh' ? item.product.nameKh : item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8c7461] hover:text-[#ef4444] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Customization details */}
                    <div className="text-[10px] text-[#a8988b] mt-1 leading-snug">
                      <span className="capitalize">{item.customization.size}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="capitalize">{item.customization.temperature}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Sweet {item.customization.sweetness}</span>
                      {item.customization.milk && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="capitalize">{item.customization.milk} milk</span>
                        </>
                      )}
                      {item.customization.extraShots > 0 && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span>+{item.customization.extraShots} shot(s)</span>
                        </>
                      )}
                    </div>

                    {/* Quantity and item total */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-[#2a1d15] text-[#f4efe9] flex items-center justify-center hover:bg-[#38261b] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-[#2a1d15] text-[#f4efe9] flex items-center justify-center hover:bg-[#38261b] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-[#d97706] tabular-nums">
                        ${item.itemTotal.toFixed(2)}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#2d1e16] bg-[#140e0a] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#b8a796]">{t.subtotal}</span>
                <span className="font-mono text-base font-bold text-[#fcfaf7] tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full py-3 px-4 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#d97706]/20"
              >
                <span>{t.checkoutBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
