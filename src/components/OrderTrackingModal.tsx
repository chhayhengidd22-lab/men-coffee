import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { X, CheckCircle, Clock, Coffee, Sparkles, MapPin, ArrowLeft, Printer } from 'lucide-react';
import { PrintableReceiptModal } from './PrintableReceiptModal';

interface OrderTrackingModalProps {
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ onClose }) => {
  const { currentTrackingOrder, language } = useStore();
  const t = translations[language];
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  if (!currentTrackingOrder) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-[#17100b] border border-[#38261b] rounded-xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto sm:my-8 max-h-[96vh] flex flex-col">
          
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
                <span className="text-[11px] font-semibold text-[#d97706] tracking-widest uppercase">
                  {t.orderTrackingTitle}
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#fcfaf7] flex items-center gap-2 mt-0.5">
                  <span>{currentTrackingOrder.orderNumber}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#d97706]/20 text-[#f59e0b] font-normal uppercase">
                    {currentTrackingOrder.status}
                  </span>
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#241710] hover:bg-[#332015] border border-[#442c1e] text-[#f4efe9] hover:text-[#fcd34d] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={language === 'kh' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}
              >
                <Printer className="w-3.5 h-3.5 text-[#d97706]" />
                <span className="hidden sm:inline">{language === 'kh' ? 'វិក្កយបត្រ' : 'Receipt'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] text-[#a8988b] hover:text-[#f4efe9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Estimated timing banner */}
          <div className="p-4 rounded-xl bg-[#1f150f] border border-[#2d1e16] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#d97706]/20 flex items-center justify-center text-[#d97706]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#8c7461]">{t.estimatedTime}</div>
                <div className="text-base font-bold text-[#fcfaf7]">4 - 7 mins</div>
              </div>
            </div>

            <div className="text-right text-xs text-[#a8988b]">
              <div className="font-medium text-[#fcfaf7] capitalize">{currentTrackingOrder.orderType.replace('_', ' ')}</div>
              {currentTrackingOrder.tableNumber && (
                <div className="text-[#d97706] font-mono">Table {currentTrackingOrder.tableNumber}</div>
              )}
              {currentTrackingOrder.deliveryAddress && (
                <div className="flex items-center gap-1 text-[11px] text-[#8c7461] max-w-[160px] truncate">
                  <MapPin className="w-3 h-3 text-[#d97706] shrink-0" />
                  <span className="truncate">{currentTrackingOrder.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2d1e16]">
            {currentTrackingOrder.timeline.map((step, idx) => {
              const isCompleted = step.completed;
              const isCurrent = currentTrackingOrder.status === step.status;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-[#d97706] border-[#d97706] text-[#120d0a]'
                        : isCurrent
                        ? 'bg-[#17100b] border-[#d97706] text-[#d97706]'
                        : 'bg-[#17100b] border-[#38261b] text-[#553c2b]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Coffee className="w-3 h-3" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold ${
                          isCompleted || isCurrent ? 'text-[#fcfaf7]' : 'text-[#7d6856]'
                        }`}
                      >
                        {language === 'kh' ? step.labelKh : step.label}
                      </h4>
                      <span className="font-mono text-[10px] text-[#8c7461]">
                        {step.timestamp}
                      </span>
                    </div>
                    {isCurrent && (
                      <p className="text-[11px] text-[#d97706] mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>In progress right now at our brew bar</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ordered items summary */}
          <div className="pt-4 border-t border-[#2d1e16]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-3">
              {t.orderSummary}
            </h4>
            <div className="space-y-2">
              {currentTrackingOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-[#20150e]">
                  <div>
                    <span className="font-semibold text-[#fcfaf7]">
                      {item.quantity}x {language === 'kh' ? item.product.nameKh : item.product.name}
                    </span>
                    <div className="text-[10px] text-[#8c7461]">
                      {item.customization.size} · {item.customization.temperature} · {item.customization.milk} milk
                    </div>
                  </div>
                  <span className="font-mono text-[#d97706] tabular-nums">
                    ${item.itemTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 text-sm font-bold text-[#fcfaf7]">
              <span>{t.grandTotal}</span>
              <span className="font-mono text-[#d97706] text-base tabular-nums">
                ${currentTrackingOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#2d1e16] bg-[#140e0a] flex items-center justify-between gap-3">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#20150e] hover:bg-[#2e1d13] border border-[#3d2719] text-xs font-semibold text-[#f4efe9] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#d97706]" />
            <span>{language === 'kh' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-xs font-semibold text-[#120d0a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToHome}</span>
          </button>
        </div>

      </div>
    </div>

    {/* Printable Receipt Modal */}
    <PrintableReceiptModal
      order={currentTrackingOrder}
      isOpen={showReceiptModal}
      onClose={() => setShowReceiptModal(false)}
    />
  </>
  );
};
