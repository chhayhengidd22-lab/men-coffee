import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import {
  X,
  ArrowLeft,
  Coffee,
  Flame,
  Droplets,
  Award,
  Sparkles,
  Plus,
  Minus,
  Check,
  ShieldAlert,
  Sliders,
  Star,
  MapPin,
  Clock,
  Heart,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomize: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenCustomize,
}) => {
  const { language, addToCart, favorites, toggleFavorite, showToast } = useStore();
  const t = translations[language];

  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const isFav = favorites.includes(product.id);
  const displayName = language === 'kh' ? product.nameKh || product.name : product.name;
  const displayDesc = language === 'kh' ? product.descriptionKh || product.description : product.description;

  const handleQuickAdd = () => {
    addToCart(
      product,
      {
        size: 'regular',
        temperature: 'iced',
        sweetness: '100%',
        milk: 'whole',
        extraShots: 0,
        syrups: [],
        note: '',
      },
      quantity
    );
    showToast(
      language === 'kh'
        ? `បានបញ្ចូល ${quantity}x ${displayName} ទៅក្នុងកន្ត្រក!`
        : `Added ${quantity}x ${displayName} to cart!`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#17100b] border border-[#38261b] rounded-3xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto sm:my-8 max-h-[94vh] flex flex-col">
        
        {/* Top Floating Action Bar */}
        <div className="relative w-full h-64 sm:h-72 bg-[#20150e] overflow-hidden shrink-0">
          <img
            src={product.image}
            alt={displayName}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17100b] via-[#17100b]/40 to-black/60" />

          {/* Top buttons */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[#f4efe9] hover:bg-black/90 border border-white/10 transition-colors cursor-pointer text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4 text-[#d97706]" />
              <span>{t.back}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(product.id)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-[#f4efe9] hover:bg-black/90 border border-white/10 transition-colors cursor-pointer"
                title="Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-[#f4efe9] hover:bg-black/90 border border-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Badges on image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d97706] text-[#120d0a]">
                  {product.category.replace('_', ' ')}
                </span>
                {product.isPopular && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {language === 'kh' ? 'ពេញនិយម' : 'Best Seller'}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    product.inStock
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {product.inStock
                    ? language === 'kh'
                      ? `មានក្នុងស្តុក (${product.stockCount})`
                      : `In Stock (${product.stockCount})`
                    : language === 'kh'
                    ? 'អស់ពីស្តុក'
                    : 'Out of Stock'}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-md">
                {displayName}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#f59e0b] drop-shadow-md">
                ${product.basePrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* Story & Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[#fcfaf7] text-sm uppercase tracking-wider flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#d97706]" />
              {language === 'kh' ? 'អំពីកាហ្វេពិសេសនេះ' : 'Cupping Profile & Story'}
            </h3>
            <p className="text-[#c7b299] leading-relaxed">
              {displayDesc}
            </p>
          </div>

          {/* Connoisseur Origin & Craft Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#1f150f] border border-[#2d1e16] rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#8c7461] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#d97706]" />
                {language === 'kh' ? 'ប្រភពដើម' : 'Terroir & Origin'}
              </div>
              <div className="font-semibold text-[#fcfaf7] truncate">
                {product.origin || 'Mondulkiri, Cambodia'}
              </div>
            </div>

            <div className="p-3 bg-[#1f150f] border border-[#2d1e16] rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#8c7461] flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#38bdf8]" />
                {language === 'kh' ? 'កម្រិតកម្ពស់' : 'Elevation (MASL)'}
              </div>
              <div className="font-semibold text-[#fcfaf7] truncate">
                {product.altitude || '1,100m - 1,450m'}
              </div>
            </div>

            <div className="p-3 bg-[#1f150f] border border-[#2d1e16] rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#8c7461] flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                {language === 'kh' ? 'កម្រិតលីង' : 'Roast Profile'}
              </div>
              <div className="font-semibold text-[#fcfaf7] truncate">
                {product.roastLevel || 'Micro-Batch Medium'}
              </div>
            </div>

            <div className="p-3 bg-[#1f150f] border border-[#2d1e16] rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#8c7461] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {language === 'kh' ? 'ជាតិកាហ្វេអ៊ីន' : 'Caffeine Content'}
              </div>
              <div className="font-semibold text-[#fcfaf7] truncate">
                {product.caffeineMg !== undefined ? `${product.caffeineMg} mg` : '150 mg Est.'}
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          {product.tastingNotes && product.tastingNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-[#fcfaf7] text-xs uppercase tracking-wider text-[#a8988b]">
                {language === 'kh' ? 'កំណត់ចំណាំក្លិន និងរសជាតិ (Tasting Notes)' : 'Sensory & Tasting Notes'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-[#2a1b12] border border-[#442c1d] text-[#fcd34d] font-medium text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brewing Method & Extraction */}
          {product.brewingMethod && (
            <div className="p-3.5 bg-[#20150e] border border-[#2d1e16] rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#d97706] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#fcfaf7] text-xs uppercase tracking-wider">
                  {language === 'kh' ? 'វិធីសាស្ត្រឆុង និងការចម្រាញ់' : 'Extraction & Brewing Method'}
                </div>
                <div className="text-xs text-[#c7b299] mt-0.5">
                  {product.brewingMethod}
                </div>
              </div>
            </div>
          )}

          {/* Ingredients & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="p-3 bg-[#1a110a] border border-[#2d1e16] rounded-xl space-y-1.5">
                <div className="font-bold text-[#e5d5c5] text-xs uppercase">
                  {language === 'kh' ? 'គ្រឿងផ្សំពិសេស' : 'Primary Ingredients'}
                </div>
                <ul className="space-y-1 text-xs text-[#a8988b]">
                  {product.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-[#1a110a] border border-[#2d1e16] rounded-xl space-y-1.5">
              <div className="font-bold text-[#e5d5c5] text-xs uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                {language === 'kh' ? 'អាលែកហ្ស៊ី & អាហារូបត្ថម្ភ' : 'Allergens & Dietary Info'}
              </div>
              <div className="text-xs text-[#a8988b]">
                {product.allergens && product.allergens.length > 0 ? (
                  <span>Contains: {product.allergens.join(', ')}</span>
                ) : (
                  <span>Gluten-free & suitable for vegan substitutions upon request.</span>
                )}
                {product.calories && (
                  <div className="mt-1 text-[#8c7461]">
                    Approx. {product.calories} kcal per standard serve
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1f150f] border border-[#2d1e16]">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white text-sm">
                {product.rating || 4.95} / 5.0
              </span>
              <span className="text-[#8c7461] text-xs">
                ({product.reviewsCount || 118} {language === 'kh' ? 'ការវាយតម្លៃ' : 'verified reviews'})
              </span>
            </div>
            <div className="text-[11px] font-medium text-[#d97706]">
              {language === 'kh' ? 'គុណភាពកម្រិតខ្ពស់' : 'Specialty Certified'}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#2d1e16] bg-[#140e09] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs text-[#8c7461] font-semibold uppercase">
              {language === 'kh' ? 'ចំនួន' : 'Qty'}
            </span>
            <div className="flex items-center border border-[#38261b] rounded-xl bg-[#1f150f] overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || product.stockCount <= 0}
                className="px-3 py-2 text-[#a8988b] hover:text-white hover:bg-[#2a1d15] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 font-mono font-bold text-sm text-[#fcfaf7]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                disabled={quantity >= product.stockCount || product.stockCount <= 0}
                className="px-3 py-2 text-[#a8988b] hover:text-white hover:bg-[#2a1d15] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenCustomize(product);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#d97706]/40 bg-[#25170f] hover:bg-[#341f14] text-[#d97706] hover:text-[#fcd34d] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'kh' ? 'កែសម្រួលរសជាតិ' : 'Customize Taste'}</span>
            </button>

            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>
                {language === 'kh' ? 'កុម្ម៉ង់ឥឡូវ' : 'Add to Order'} • ${(product.basePrice * quantity).toFixed(2)}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
