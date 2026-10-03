import React, { useState } from 'react';
import { Product, DrinkSize, DrinkTemp, SweetnessLevel, MilkOption, ProductCustomization } from '../types';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { X, Plus, Minus, Check, ArrowLeft } from 'lucide-react';

interface ProductCustomizeModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({ product, onClose }) => {
  const { addToCart, language } = useStore();
  const t = translations[language];

  if (!product) return null;

  const isDrink = product.category !== 'bakery' && product.category !== 'beans';

  const [size, setSize] = useState<DrinkSize>('regular');
  const [temperature, setTemperature] = useState<DrinkTemp>('iced');
  const [sweetness, setSweetness] = useState<SweetnessLevel>('50%');
  const [milk, setMilk] = useState<MilkOption>('oat');
  const [extraShots, setExtraShots] = useState<number>(0);
  const [selectedSyrups, setSelectedSyrups] = useState<string[]>([]);
  const [specialNote, setSpecialNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Price math
  let unitPrice = product.basePrice;
  if (isDrink) {
    if (size === 'large') unitPrice += 0.80;
    if (size === 'small') unitPrice -= 0.30;
    if (milk === 'oat' || milk === 'almond' || milk === 'coconut') unitPrice += 0.60;
    if (milk === 'soy') unitPrice += 0.50;
    unitPrice += extraShots * 0.80;
  }
  const totalPayable = Number((unitPrice * quantity).toFixed(2));

  const toggleSyrup = (s: string) => {
    setSelectedSyrups((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleConfirm = () => {
    const customization: ProductCustomization = {
      size,
      temperature,
      sweetness,
      milk,
      extraShots,
      syrups: selectedSyrups,
      note: specialNote.trim(),
    };

    addToCart(product, customization, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#17100b] border border-[#38261b] rounded-xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto sm:my-8 max-h-[96vh] flex flex-col">
        
        {/* Header with image preview */}
        <div className="relative h-48 sm:h-56 w-full bg-[#20150e]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17100b] via-[#17100b]/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17100b]/85 hover:bg-[#17100b] text-[#f4efe9] hover:text-[#d97706] border border-[#38261b]/60 transition-colors cursor-pointer text-xs font-semibold backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-[#d97706]" />
            <span>{t.back}</span>
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#17100b]/80 hover:bg-[#17100b] text-[#c4b5a5] hover:text-[#f4efe9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#d97706] uppercase tracking-wider">
                {product.origin || 'Specialty Coffee'}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#fcfaf7]">
                {language === 'kh' ? product.nameKh : product.name}
              </h3>
            </div>

            {/* Live stock indicator for customer */}
            <div className="px-2.5 py-1 rounded-lg bg-[#140e0a]/90 border border-[#3d2719] backdrop-blur-sm text-right shrink-0">
              <span className="text-[9px] uppercase font-mono text-[#8c7461] block leading-tight">
                {language === 'kh' ? 'ស្តុកនៅសល់' : 'In Stock'}
              </span>
              <span className={`text-xs font-mono font-bold ${product.stockCount <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {product.stockCount} {language === 'kh' ? 'កែវ/នំ' : 'units'}
              </span>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <p className="text-xs sm:text-sm text-[#bcaaa4] font-light leading-relaxed">
            {language === 'kh' ? product.descriptionKh : product.description}
          </p>

          {isDrink && (
            <>
              {/* Cup Size */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2.5">
                  {t.selectSize}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'regular', 'large'] as DrinkSize[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${
                        size === s
                          ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                          : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                      }`}
                    >
                      <div className="capitalize">{s}</div>
                      <div className="text-[10px] text-[#8c7461] mt-0.5">
                        {s === 'small' ? '8 oz (-$0.30)' : s === 'regular' ? '12 oz' : '16 oz (+$0.80)'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2.5">
                  {t.selectTemp}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'iced' as DrinkTemp, label: language === 'kh' ? 'ទឹកកក (Iced)' : 'Iced' },
                    { id: 'hot' as DrinkTemp, label: language === 'kh' ? 'ក្តៅ (Hot 65°)' : 'Hot (65°C)' },
                    { id: 'blended' as DrinkTemp, label: language === 'kh' ? 'ក្រឡុក (Frappé)' : 'Frappé' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTemperature(item.id)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${
                        temperature === item.id
                          ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                          : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2.5">
                  {t.selectSweetness}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['0%', '25%', '50%', '75%', '100%'] as SweetnessLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSweetness(lvl)}
                      className={`py-2 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                        sweetness === lvl
                          ? 'border-[#d97706] bg-[#d97706]/20 text-[#fcfaf7]'
                          : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Option */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2.5">
                  {t.selectMilk}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'whole' as MilkOption, name: t.milkWhole, extra: '' },
                    { id: 'oat' as MilkOption, name: t.milkOat, extra: '+$0.60' },
                    { id: 'almond' as MilkOption, name: t.milkAlmond, extra: '+$0.60' },
                    { id: 'coconut' as MilkOption, name: t.milkCoconut, extra: '+$0.60' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMilk(m.id)}
                      className={`p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                        milk === m.id
                          ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                          : 'border-[#2d1e16] bg-[#1f150f] text-[#a8988b] hover:border-[#442c1f]'
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      {milk === m.id && <Check className="w-4 h-4 text-[#d97706] shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Espresso Shots */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2d1e16] bg-[#1f150f]">
                <div>
                  <div className="text-xs font-semibold text-[#f4efe9]">
                    {language === 'kh' ? 'បន្ថែមសាច់កាហ្វេ (Extra Shot)' : 'Additional Espresso Shots'}
                  </div>
                  <div className="text-[11px] text-[#8c7461]">+$0.80 per double ristretto shot</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExtraShots(Math.max(0, extraShots - 1))}
                    disabled={extraShots === 0}
                    className="w-7 h-7 rounded bg-[#2a1d15] disabled:opacity-30 text-[#f4efe9] flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-bold w-4 text-center">{extraShots}</span>
                  <button
                    type="button"
                    onClick={() => setExtraShots(Math.min(3, extraShots + 1))}
                    disabled={extraShots >= 3}
                    className="w-7 h-7 rounded bg-[#2a1d15] disabled:opacity-30 text-[#f4efe9] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Barista Special Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
              {t.specialInstructions}
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder={language === 'kh' ? 'ឧ. កុំដាក់កែវជ័រ, ដាក់ទឹកកកតិច...' : 'e.g. Less ice, use ceramic mug...'}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
            />
          </div>
        </div>

        {/* Footer with quantity stepper and Add to Cart button */}
        <div className="p-4 sm:p-6 border-t border-[#2d1e16] bg-[#140e0a] flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={quantity <= 1 || product.stockCount <= 0}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] flex items-center justify-center cursor-pointer hover:border-[#442c1f] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono text-base font-bold text-[#fcfaf7] w-5 sm:w-6 text-center">{quantity}</span>
            <button
              type="button"
              disabled={quantity >= product.stockCount || product.stockCount <= 0}
              onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
              className="w-8 h-8 rounded-lg bg-[#1f150f] border border-[#2d1e16] text-[#f4efe9] flex items-center justify-center cursor-pointer hover:border-[#442c1f] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-3 rounded-lg bg-[#1f150f] hover:bg-[#2a1d15] border border-[#2d1e16] text-xs font-medium text-[#b8a796] hover:text-[#f4efe9] transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>

          {product.stockCount <= 0 || !product.inStock ? (
            <button
              type="button"
              disabled
              className="flex-1 py-3 px-4 rounded-lg bg-neutral-800 text-neutral-400 font-semibold text-xs cursor-not-allowed text-center uppercase tracking-wider"
            >
              {language === 'kh' ? 'អស់ពីស្តុកហើយ (Out of Stock)' : 'Out of Stock'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-sm transition-colors cursor-pointer flex items-center justify-between shadow-md"
            >
              <span>{t.addToCart}</span>
              <span className="font-mono font-bold">${totalPayable.toFixed(2)}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
