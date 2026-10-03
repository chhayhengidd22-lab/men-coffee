import React from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { Coffee, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onOpenApiDocs: () => void;
  onNavigate: (view: 'home' | 'menu' | 'reserve' | 'locations') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApiDocs, onNavigate }) => {
  const { language, storeSettings } = useStore();
  const t = translations[language];

  const displayName = language === 'kh' ? storeSettings.shopNameKh || storeSettings.shopName : storeSettings.shopName;
  const displayTagline = language === 'kh' ? storeSettings.taglineKh || storeSettings.tagline : storeSettings.tagline;

  return (
    <footer className="bg-[#0e0a07] border-t border-[#241710] text-[#a8988b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Craft */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-[#fcfaf7]">
              {storeSettings.logo ? (
                <img
                  src={storeSettings.logo}
                  alt="Logo"
                  className="w-7 h-7 object-contain rounded-lg bg-[#1a120d] p-0.5 border border-[#38261b]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Coffee className="w-5 h-5 text-[#d97706]" />
              )}
              <span className="font-display text-lg font-bold tracking-wider line-clamp-1">{displayName}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#8c7461]">
              {displayTagline || (language === 'kh'
                ? 'ហាងកាហ្វេឯកទេសស្តង់ដារអន្តរជាតិ ផ្តោតលើការឆុងស្រស់ និងគ្រាប់កាហ្វេគុណភាពខ្ពស់បំផុត SCA 88+។'
                : 'Specialty coffee roastery dedicated to micro-batch single origins, ethical sourcing, and uncompromising extraction science.')}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#fcfaf7] uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#d97706] transition-colors cursor-pointer"
                >
                  {language === 'kh' ? 'ទំព័រដើម' : 'Story & Origin'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-[#d97706] transition-colors cursor-pointer"
                >
                  {t.navMenu}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reserve')}
                  className="hover:text-[#d97706] transition-colors cursor-pointer"
                >
                  {t.navReserve}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('locations')}
                  className="hover:text-[#d97706] transition-colors cursor-pointer"
                >
                  {t.navLocations}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenApiDocs}
                  className="hover:text-[#d97706] transition-colors cursor-pointer font-mono text-[11px]"
                >
                  Laravel 11 REST API Docs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Service */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#fcfaf7] uppercase tracking-wider mb-3">
              Roastery Hours
            </h4>
            <div className="text-xs space-y-1.5 text-[#8c7461]">
              <p>Mon – Fri: 06:30 AM – 09:30 PM</p>
              <p>Sat – Sun: 07:00 AM – 10:00 PM</p>
              <p className="text-[11px] text-[#d97706] pt-1">
                Cupping sessions every Saturday 10:00 AM
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Phnom Penh Flagship */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#fcfaf7] uppercase tracking-wider mb-3">
              Flagship Roastery
            </h4>
            <div className="text-xs space-y-2 text-[#8c7461]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <span>#45 Street 302, BKK1, Phnom Penh, Cambodia</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Phone className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>+855 23 999 888</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Mail className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>concierge@auracafe.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#1a120d] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6b5545] gap-4">
          <p>© 2026 AURA Specialty Coffee & Roastery. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Laravel 11.x REST API + React SPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
