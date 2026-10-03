import React from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { HERO_IMAGE } from '../data/mockData';
import { ArrowRight, Coffee, Award, Clock } from 'lucide-react';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onReserveTable: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMenu, onReserveTable }) => {
  const { language, storeSettings } = useStore();
  const t = translations[language];

  const heroBg = storeSettings.heroBackground || HERO_IMAGE;
  const heroTagline = language === 'kh'
    ? (storeSettings.taglineKh || t.heroDescription)
    : (storeSettings.tagline || t.heroDescription);

  return (
    <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center overflow-hidden border-b border-[#2d1e16]">
      {/* Cinematic Background with contrast scrim as per frontend-design */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt={storeSettings.shopName || "Specialty Roastery"}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Measured scrim to guarantee WCAG 4.5:1 contrast across all frames */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#120d0a] via-[#120d0a]/85 to-[#120d0a]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-2xl">
          
          {/* Subtle clean metadata kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d97706] tracking-widest uppercase mb-4">
            <Award className="w-4 h-4 text-[#d97706]" />
            <span>SCA 88+ Specialty Grade</span>
            <span aria-hidden="true" className="text-[#553c2b]">·</span>
            <span>Micro-Batch Roasting</span>
          </div>

          {/* Headline with balanced wrapping */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fcfaf7] leading-[1.15] tracking-tight mb-6 [text-wrap:balance]">
            {t.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-[#d4c5b6] font-light leading-relaxed mb-8 max-w-xl">
            {heroTagline}
          </p>

          {/* Primary and secondary CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              onClick={onExploreMenu}
              className="group flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#120d0a] bg-[#d97706] hover:bg-[#f59e0b] rounded-lg transition-all duration-200 cursor-pointer shadow-lg shadow-[#d97706]/20"
            >
              <Coffee className="w-4 h-4" />
              <span>{t.heroOrderNow}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onReserveTable}
              className="px-6 py-3.5 text-sm font-semibold text-[#fcfaf7] bg-[#1f150f]/80 hover:bg-[#2e1e17] border border-[#442c1f] rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
            >
              {t.heroReserve}
            </button>
          </div>

          {/* Quiet Trust Adjacency Proof Points */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#3a271b]/60 text-xs text-[#b8a796]">
            <div>
              <div className="font-display text-xl font-bold text-[#fcfaf7] font-mono tabular-nums">
                100%
              </div>
              <div className="mt-0.5 text-[11px] text-[#8c7461]">
                {language === 'kh' ? 'កាហ្វេអារ៉ាប៊ីកាសុទ្ធ' : 'Specialty Arabica'}
              </div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-[#fcfaf7] font-mono tabular-nums">
                125 PPM
              </div>
              <div className="mt-0.5 text-[11px] text-[#8c7461]">
                {language === 'kh' ? 'ទឹករ៉ែចម្រោះពិសេស' : 'Balanced Water'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 font-display text-xl font-bold text-[#fcfaf7] font-mono tabular-nums">
                <Clock className="w-4 h-4 text-[#d97706]" />
                <span>5-7m</span>
              </div>
              <div className="mt-0.5 text-[11px] text-[#8c7461]">
                {language === 'kh' ? 'រយៈពេលឆុងស្រស់' : 'Fresh Extraction'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
