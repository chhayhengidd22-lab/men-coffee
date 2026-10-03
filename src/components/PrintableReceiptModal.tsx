import React, { useRef } from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { Printer, X, CheckCircle, Coffee, ShieldCheck, MapPin, Phone, Calendar, Clock, CreditCard, Download } from 'lucide-react';

interface PrintableReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { storeSettings, language } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const exchangeRate = 4100;
  const khrTotal = Math.round(order.total * exchangeRate);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Container - hide non-receipt elements on print via print:hidden */}
      <div className="relative w-full max-w-lg bg-[#140e0a] border border-[#3d2719] rounded-2xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 border-b border-[#2b1b12] bg-[#1a120c] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#d97706]/15 text-[#d97706]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fcfaf7]">
                {language === 'kh' ? 'វិក្កយបត្រផ្លូវការ (Official Receipt)' : 'Official Tax Receipt / POS Invoice'}
              </h3>
              <p className="text-[11px] text-[#8c7461]">
                {language === 'kh' ? 'អាចបោះពុម្ពជាក្រដាស A4 ឬក្រដាសវិក្កយបត្រ POS' : 'Ready to print via standard or POS thermal printer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'kh' ? 'បោះពុម្ព (Print)' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#20150e] hover:bg-[#2e1d13] text-[#a8988b] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Styled like authentic thermal POS receipt with crisp typography) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-[#0d0906]">
          <div
            ref={printRef}
            id="printable-receipt"
            className="w-full max-w-sm bg-white text-neutral-900 p-5 rounded-lg shadow-xl font-mono text-xs border border-neutral-200 select-text print:border-none print:shadow-none print:p-0 print:w-full"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-neutral-300">
              <div className="flex items-center justify-center gap-2 mb-1">
                {storeSettings.logo ? (
                  <img
                    src={storeSettings.logo}
                    alt="Logo"
                    className="w-6 h-6 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Coffee className="w-5 h-5 text-neutral-900" />
                )}
                <h1 className="font-bold text-base tracking-tight uppercase">
                  {storeSettings.shopNameKh || 'AURA ហាងកាហ្វេពិសេស'}
                </h1>
              </div>
              <p className="text-[10px] text-neutral-600 font-sans font-semibold">
                {storeSettings.shopName}
              </p>
              <p className="text-[10px] text-neutral-500 mt-1 leading-tight font-sans">
                {storeSettings.addressKh || storeSettings.address}
              </p>
              <p className="text-[10px] text-neutral-600 font-sans mt-0.5">
                ទូរស័ព្ទ (Tel): {storeSettings.contactPhone || '+855 23 888 777'}
              </p>
              <div className="inline-block mt-1 px-2 py-0.5 bg-neutral-100 rounded text-[9px] text-neutral-600 font-mono">
                VAT-TIN: K008-90230198
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="py-3 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>វិក្កយបត្រ (RECEIPT):</span>
                <span>#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>កាលបរិច្ឆេទ (Date):</span>
                <span>{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>ប្រភេទ (Type):</span>
                <span className="font-bold text-neutral-800 uppercase">
                  {order.orderType === 'dine_in'
                    ? `ញ៉ាំនៅហាង (តុ ${order.tableNumber || 'A-01'})`
                    : order.orderType === 'delivery'
                    ? 'ដឹកជញ្ជូន (Delivery)'
                    : 'ខ្ចប់ទៅផ្ទះ (Takeaway)'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>អតិថិជន (Customer):</span>
                <span className="font-semibold text-neutral-800">{order.customerName}</span>
              </div>
              {order.customerPhone && (
                <div className="flex justify-between text-neutral-600">
                  <span>លេខទូរស័ព្ទ (Phone):</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="pt-1 text-[10px] text-neutral-700 leading-tight">
                  <span className="font-bold">ទីតាំងដឹកជញ្ជូន (Address):</span> {order.deliveryAddress}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-3 border-b-2 border-dashed border-neutral-300">
              <div className="flex justify-between font-bold text-[10px] text-neutral-500 uppercase pb-1.5 border-b border-neutral-200">
                <span className="flex-1">មុខទំនិញ (Item)</span>
                <span className="w-10 text-center">ចំនួន (Qty)</span>
                <span className="w-16 text-right">តម្លៃ (Total)</span>
              </div>

              <div className="divide-y divide-neutral-100 py-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-neutral-900">
                          {item.product.nameKh || item.product.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-sans">
                          {item.product.name}
                        </div>
                        {item.customization && (
                          <div className="text-[9px] text-neutral-500 leading-tight mt-0.5">
                            {item.customization.temperature && `[${item.customization.temperature}] `}
                            {item.customization.size && `${item.customization.size}, `}
                            {item.customization.sweetness && `ស្ករ ${item.customization.sweetness}`}
                            {item.customization.milk !== 'whole' && `, ទឹកដោះគោ ${item.customization.milk}`}
                          </div>
                        )}
                      </div>
                      <div className="w-10 text-center font-bold text-neutral-800">
                        x{item.quantity}
                      </div>
                      <div className="w-16 text-right font-bold text-neutral-900">
                        ${item.itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="py-3 border-b-2 border-dashed border-neutral-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>សរុបរង (Subtotal):</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>បញ្ចុះតម្លៃ (Discount):</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}

              {/* Delivery Fee specifically labelled with paid by customer */}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-neutral-800 font-medium">
                  <div className="flex flex-col">
                    <span>ថ្លៃដឹកជញ្ជូន (Delivery Fee):</span>
                    <span className="text-[9px] text-neutral-500 font-sans">*អតិថិជនជាអ្នកចេញ (Customer Paid)</span>
                  </div>
                  <span className="font-bold">${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-bold text-sm">
                <span>សរុបរួម (GRAND TOTAL):</span>
                <span className="text-base font-extrabold text-neutral-950">
                  ${order.total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-neutral-600 font-semibold">
                <span>ជាប្រាក់រៀល (In KHR):</span>
                <span>{khrTotal.toLocaleString()} រៀល</span>
              </div>
            </div>

            {/* Payment & Status Stamp */}
            <div className="py-3 text-center border-b border-dashed border-neutral-300 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>បានទូទាត់រួចរាល់ (PAID VIA {order.paymentMethod.toUpperCase()})</span>
              </div>

              <p className="text-[10px] text-neutral-500 leading-tight">
                ប្រតិបត្តិការទូទាត់ជោគជ័យតាមប្រព័ន្ធឌីជីថលសុវត្ថិភាព
              </p>
            </div>

            {/* Barcode & Footer Appreciation */}
            <div className="pt-4 text-center space-y-2">
              {/* Simulated Barcode */}
              <div className="flex justify-center items-center gap-[2px] h-8 opacity-80">
                {[2, 1, 3, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3].map((w, i) => (
                  <div
                    key={i}
                    className="bg-neutral-900 h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <p className="font-mono text-[9px] text-neutral-500">
                *{order.id.toUpperCase()}*
              </p>

              <div className="pt-1 text-[11px] text-neutral-700 font-sans font-medium">
                សូមអរគុណដែលបានគាំទ្រ AURA Specialty Coffee!
              </div>
              <p className="text-[9px] text-neutral-500 font-sans">
                Thank you for choosing AURA. Have a wonderful day!
              </p>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls (Hidden on print) */}
        <div className="p-4 bg-[#1a120c] border-t border-[#2b1b12] flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#22160f] hover:bg-[#2c1d14] text-[#a8988b] hover:text-[#f4efe9] font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            {language === 'kh' ? 'បិទផ្ទាំង (Close)' : 'Close Window'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-[2] py-2.5 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#d97706]/20 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'kh' ? 'ចុចបោះពុម្ពវិក្កយបត្រ (Print Receipt)' : 'Print POS Receipt'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
