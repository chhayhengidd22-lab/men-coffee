import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { ProductCustomizeModal } from './ProductCustomizeModal';
import { ProductDetailModal } from './ProductDetailModal';
import { Search, Heart, SlidersHorizontal, Sparkles, Info, Eye } from 'lucide-react';

export const MenuSection: React.FC = () => {
  const { products, favorites, toggleFavorite, language } = useStore();
  const t = translations[language];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'signature', label: t.categorySignature },
    { id: 'pour_over', label: t.categoryPourOver },
    { id: 'espresso', label: t.categoryEspresso },
    { id: 'cold_brew', label: t.categoryColdBrew },
    { id: 'bakery', label: language === 'kh' ? '🥐 នំប៉័ង & នំដុត' : '🥐 Bakery & Pastry' },
    { id: 'burger', label: language === 'kh' ? '🍔 ប៊ឺហ្គឺរ & សាំងវិច' : '🍔 Burgers & Sandwiches' },
    { id: 'beans', label: t.categoryBeans },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.nameKh.toLowerCase().includes(query) ||
      (p.origin && p.origin.toLowerCase().includes(query)) ||
      (p.tastingNotes && p.tastingNotes.some((note) => note.toLowerCase().includes(query)));
    return matchesCat && matchesSearch;
  });

  return (
    <section id="menu-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Editorial Header */}
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#d97706] mb-2 block">
          {language === 'kh' ? 'កាតាឡុកកាហ្វេ & នំដុត' : 'Artisanal Roastery Catalog'}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fcfaf7] tracking-tight mb-3">
          {t.menuTitle}
        </h2>
        <p className="text-sm sm:text-base text-[#bda897] font-light leading-relaxed">
          {t.menuSubtitle}
        </p>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-4 border-b border-[#2d1e16]">
        
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#d97706] text-[#120d0a] font-semibold shadow-sm'
                  : 'bg-[#1a120d] text-[#b8a796] hover:text-[#f4efe9] border border-[#2d1e16]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[#1a120d] border border-[#2d1e16] text-[#f4efe9] placeholder-[#7d6856] focus:outline-none focus:border-[#d97706]"
          />
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#2d1e16] rounded-xl">
          <p className="text-sm text-[#8c7461]">
            {language === 'kh' ? 'រកមិនឃើញមុខទំនិញដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ' : 'No coffee offerings match your criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isFav = favorites.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="group relative bg-[#17100b] border border-[#2a1b13] rounded-xl overflow-hidden flex flex-col hover:border-[#442c1f] transition-all duration-300"
              >
                {/* Visual Image container with Click to Detail */}
                <div 
                  onClick={() => setSelectedProductForDetail(prod)}
                  className="relative aspect-[4/3] w-full bg-[#120d0a] overflow-hidden cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-semibold text-white backdrop-blur-[2px]">
                    <Eye className="w-4 h-4 text-[#d97706]" />
                    <span>{language === 'kh' ? 'មើលលម្អិត' : 'View Details'}</span>
                  </div>
                  
                  {/* Subtle favorite bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prod.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-[#120d0a]/70 hover:bg-[#120d0a] text-[#f4efe9] transition-colors cursor-pointer z-10"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isFav ? 'fill-[#ef4444] text-[#ef4444]' : 'text-[#c4b5a5]'
                      }`}
                    />
                  </button>

                  {/* Stock Availability Badge (Direct User Requirement) */}
                  <div className="absolute top-3 left-3 z-10">
                    {!prod.inStock || prod.stockCount <= 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-950/90 border border-red-500/50 text-red-200 text-[10px] font-bold shadow-md backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {language === 'kh' ? 'អស់ស្តុក' : 'Out of Stock'}
                      </span>
                    ) : prod.stockCount <= 5 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950/90 border border-amber-500/50 text-amber-200 text-[10px] font-bold shadow-md backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {language === 'kh' ? `សល់តែ ${prod.stockCount}!` : `Only ${prod.stockCount} left!`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#160f0b]/90 border border-[#3d2719] text-[#e0d3c5] text-[10px] font-mono shadow-sm backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {language === 'kh' ? `ស្តុក៖ ${prod.stockCount}` : `Stock: ${prod.stockCount}`}
                      </span>
                    )}
                  </div>

                  {/* Single subtle text tag if popular */}
                  {prod.isPopular && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#120d0a]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-[#d97706] tracking-wide z-10">
                      <Sparkles className="w-3 h-3 text-[#d97706]" />
                      <span>{language === 'kh' ? 'ពេញនិយមប្រចាំហាង' : "Barista's Choice"}</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Clean unboxed metadata with dot separators */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8c7461] mb-1.5">
                      <span className="uppercase font-medium tracking-wider">
                        {prod.roastLevel ? `${prod.roastLevel} Roast` : prod.category.replace('_', ' ')}
                      </span>
                      {prod.origin && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{prod.origin.split(',')[0]}</span>
                        </>
                      )}
                    </div>

                    <h3 
                      onClick={() => setSelectedProductForDetail(prod)}
                      className="font-display text-base font-bold text-[#fcfaf7] group-hover:text-[#d97706] transition-colors line-clamp-1 mb-1.5 cursor-pointer"
                    >
                      {language === 'kh' ? prod.nameKh : prod.name}
                    </h3>

                    <p className="text-xs text-[#a39081] line-clamp-2 leading-relaxed font-light mb-3">
                      {language === 'kh' ? prod.descriptionKh : prod.description}
                    </p>

                    {/* Tasting notes as unboxed typographic text */}
                    {prod.tastingNotes && prod.tastingNotes.length > 0 && (
                      <div className="text-[11px] text-[#b8a796] mb-3 flex items-center gap-1.5 flex-wrap">
                        {prod.tastingNotes.map((note, idx) => (
                          <span key={note}>
                            {note}
                            {idx < prod.tastingNotes!.length - 1 && (
                              <span aria-hidden="true" className="ml-1.5 text-[#553c2b]">/</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Action buttons */}
                  <div className="pt-3 border-t border-[#241710] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[#8c7461] block leading-none">{t.price}</span>
                      <span className="font-mono text-base font-bold text-[#fcfaf7] tabular-nums">
                        ${prod.basePrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedProductForDetail(prod)}
                        className="p-2 rounded-lg bg-[#20150e] hover:bg-[#2b1c13] text-[#c4b5a5] hover:text-[#f4efe9] border border-[#38261b] transition-colors cursor-pointer"
                        title={language === 'kh' ? 'មើលព័ត៌មានលម្អិត' : 'View Full Details'}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedProductForModal(prod)}
                        disabled={!prod.inStock}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      >
                        {prod.inStock ? t.addToCart : t.outOfStock}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          isOpen={!!selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenCustomize={(prod) => {
            setSelectedProductForDetail(null);
            setSelectedProductForModal(prod);
          }}
        />
      )}

      {/* Customization Modal */}
      {selectedProductForModal && (
        <ProductCustomizeModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </section>
  );
};

