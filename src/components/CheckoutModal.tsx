import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n/translations';
import { OrderType, PaymentMethod } from '../types';
import { X, QrCode, CreditCard, Banknote, ShieldAlert, CheckCircle2, Utensils, ShoppingBag, Truck, ArrowLeft } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    tables,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    createOrder,
    language,
    showToast,
  } = useStore();
  const t = translations[language];

  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTable, setSelectedTable] = useState<string>('A-01');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>(user?.phone || '+855 12 345 678');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('aba_khqr');
  const [couponInput, setCouponInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const deliveryFee = orderType === 'delivery' ? 1.50 : 0;
  const total = Math.max(0, Number((subtotal - discount + deliveryFee).toFixed(2)));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput.trim());
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) setCouponInput('');
  };

  const handleConfirmOrder = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      showToast(
        language === 'kh'
          ? 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូនរបស់អ្នក'
          : 'Please specify delivery address',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createOrder({
        orderType,
        tableNumber: orderType === 'dine_in' ? selectedTable : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        phone,
        paymentMethod,
        notes: notes.trim(),
      });

      if (res.success) {
        onClose();
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#17100b] border border-[#38261b] rounded-xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto sm:my-8 max-h-[96vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#2d1e16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] text-[#d97706] hover:text-[#f4efe9] border border-[#38261b] transition-colors cursor-pointer text-xs font-semibold"
              title={t.backToCart}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#fcfaf7]">
                {t.checkoutBtn}
              </h2>
              <p className="text-xs text-[#8c7461] mt-0.5">
                {language === 'kh' ? 'ប្រព័ន្ធទូទាត់ប្រាក់ស្តង់ដារអន្តរជាតិ & KHQR' : 'International payment architecture & order fulfillment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] text-[#a8988b] hover:text-[#f4efe9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* USER REQUIREMENT: Authentication check before purchasing */}
          {!isAuthenticated ? (
            <div className="p-5 rounded-xl border border-[#d97706]/40 bg-[#d97706]/10 text-[#f4efe9] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f59e0b]">
                <ShieldAlert className="w-5 h-5 text-[#f59e0b]" />
                <span>{language === 'kh' ? 'តម្រូវការចូលគណនីមុនពេលបញ្ជាទិញ' : 'Login Required to Complete Order'}</span>
              </div>
              <p className="text-xs text-[#d4c5b6] leading-relaxed">
                {t.loginRequiredNotice}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-xs transition-colors cursor-pointer"
              >
                {t.login} / {t.register}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1f150f] border border-[#2d1e16] text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span className="text-[#a8988b]">
                  {language === 'kh' ? 'បានចូលគណនីជា៖' : 'Authenticated as:'}
                </span>
                <span className="font-semibold text-[#f4efe9]">{user?.name}</span>
              </div>
              <span className="text-[11px] font-mono text-[#8c7461]">{user?.email}</span>
            </div>
          )}

          {/* Fulfillment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2.5">
              {t.orderType}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  orderType === 'dine_in'
                    ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                    : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                }`}
              >
                <Utensils className="w-4 h-4 text-[#d97706] mb-1" />
                <div className="text-xs font-semibold">{t.dineIn}</div>
                <div className="text-[10px] text-[#8c7461] mt-0.5">Table service</div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                    : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#d97706] mb-1" />
                <div className="text-xs font-semibold">{t.takeaway}</div>
                <div className="text-[10px] text-[#8c7461] mt-0.5">Pick up at bar</div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                    : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#d97706] mb-1" />
                <div className="text-xs font-semibold">{t.delivery}</div>
                <div className="text-[10px] text-[#8c7461] mt-0.5">Direct to door</div>
              </button>
            </div>
          </div>

          {/* Conditional Input depending on Order Type */}
          {orderType === 'dine_in' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                {t.tableSelection}
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1f150f] border border-[#2d1e16] text-xs text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
              >
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.number} disabled={tbl.status === 'occupied'}>
                    Table {tbl.number} — ({tbl.capacity} seats, {tbl.section.replace('_', ' ')}){' '}
                    {tbl.status === 'occupied' ? '(Occupied)' : tbl.status === 'reserved' ? '(Reserved)' : '(Available)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'delivery' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                {t.deliveryAddress}
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={2}
                placeholder={language === 'kh' ? 'ផ្ទះលេខ ផ្លូវ សង្កាត់ និងទីតាំងសម្គាល់...' : 'Street address, apartment/floor, landmark in Phnom Penh...'}
                className="w-full px-3.5 py-2 rounded-lg bg-[#1f150f] border border-[#2d1e16] text-xs text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
              />
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
              {t.phonePrompt}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#1f150f] border border-[#2d1e16] text-xs text-[#f4efe9] font-mono focus:outline-none focus:border-[#d97706]"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2.5">
              {t.paymentMethod}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('aba_khqr')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  paymentMethod === 'aba_khqr'
                    ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                    : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#d97706] mb-1" />
                <div className="text-xs font-semibold">Bakong KHQR</div>
                <div className="text-[10px] text-[#8c7461] mt-0.5">ABA / Acleda</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                    : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#d97706] mb-1" />
                <div className="text-xs font-semibold">Credit Card</div>
                <div className="text-[10px] text-[#8c7461] mt-0.5">Visa / Mastercard</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                    : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                }`}
              >
                <Banknote className="w-4 h-4 text-[#d97706] mb-1" />
                <div className="text-xs font-semibold">Cash</div>
                <div className="text-[10px] text-[#8c7461] mt-0.5">At Barista Counter</div>
              </button>
            </div>
          </div>

          {/* KHQR Dynamic Preview for Cambodian Mobile Pay */}
          {paymentMethod === 'aba_khqr' && (
            <div className="p-4 rounded-xl border border-[#38261b] bg-[#1a120d] flex items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-lg shrink-0 flex items-center justify-center">
                {/* Clean CSS/SVG QR code representation */}
                <div className="w-full h-full border-2 border-black p-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 bg-black" />
                    <div className="w-4 h-4 bg-black" />
                  </div>
                  <div className="text-center font-mono font-bold text-[8px] text-black">
                    KHQR · USD
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 bg-black" />
                    <div className="w-3 h-3 bg-[#d97706]" />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#fcfaf7]">
                  {language === 'kh' ? 'ស្កេនជាមួយ ABA ឬ ធនាគារនានា (KHQR)' : 'Scan with ABA Mobile or Bakong'}
                </div>
                <p className="text-[11px] text-[#8c7461] mt-1 leading-relaxed">
                  Merchant: <span className="text-[#f4efe9] font-mono font-bold">AURA SPECIALTY ROASTERY</span>
                  <br />
                  Amount: <span className="text-[#d97706] font-mono font-bold">${total.toFixed(2)} USD</span>
                </p>
              </div>
            </div>
          )}

          {/* Promo Code Input */}
          <div className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder={language === 'kh' ? 'កូដបញ្ចុះតម្លៃ (ឧ. AURA20, FIRSTBREW)' : 'Promo code (e.g. AURA20, FIRSTBREW)'}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#1f150f] border border-[#2d1e16] font-mono text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2a1d15] hover:bg-[#38261b] text-[#f4efe9] border border-[#38261b] cursor-pointer"
              >
                {t.applyCoupon}
              </button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-[#10b981] mt-2 bg-[#10b981]/10 px-3 py-1.5 rounded border border-[#10b981]/30">
                <span>
                  ✓ {appliedCoupon.code} applied (
                  {appliedCoupon.discountType === 'percentage'
                    ? `-${appliedCoupon.discountValue}%`
                    : `-$${appliedCoupon.discountValue.toFixed(2)}`}
                  )
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs underline text-[#ef4444] cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Barista Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
              {t.specialInstructions}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'kh' ? 'ចំណាំបន្ថែមសម្រាប់ Barista...' : 'Notes for barista...'}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
            />
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-xl bg-[#1f150f] border border-[#2d1e16] space-y-2 text-xs">
            <div className="flex justify-between text-[#b8a796]">
              <span>{t.subtotal}</span>
              <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#10b981]">
                <span>{t.discount}</span>
                <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
              </div>
            )}
            {orderType === 'delivery' && (
              <div className="flex justify-between items-center text-[#b8a796]">
                <div className="flex items-center gap-1.5">
                  <span>{language === 'kh' ? 'ថ្លៃដឹកជញ្ជូន (អតិថិជនជាអ្នកចេញ)' : 'Delivery Fee (Paid by Customer)'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d97706]/20 text-[#d97706] font-semibold">អតិថិជនចេញ</span>
                </div>
                <span className="font-mono tabular-nums text-[#fcd34d] font-bold">
                  ${deliveryFee.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-[#2d1e16] flex justify-between text-sm font-bold text-[#fcfaf7]">
              <span>{t.grandTotal}</span>
              <span className="font-mono text-base text-[#d97706] tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2d1e16] bg-[#140e0a] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] border border-[#38261b] text-xs font-medium text-[#d4c5b6] hover:text-[#f4efe9] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#d97706]" />
            <span>{t.backToCart}</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={isSubmitting || cart.length === 0}
            className="flex-1 py-3 px-5 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#d97706]/20 disabled:opacity-50"
          >
            <span>{isSubmitting ? t.loading : t.confirmOrder}</span>
            <span className="font-mono font-bold">(${total.toFixed(2)})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
