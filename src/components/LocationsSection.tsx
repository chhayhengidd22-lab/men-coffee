import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { translations } from '../i18n/translations';
import { StoreLocation } from '../types';
import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';

export const LocationsSection: React.FC = () => {
  const { locations, language } = useStore();
  const t = translations[language];

  const [activeLoc, setActiveLoc] = useState<StoreLocation>(locations[0]);

  return (
    <section id="locations-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#d97706] mb-2 block">
          {language === 'kh' ? 'បណ្តាញសាខាហាង' : 'Architectural Spaces'}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fcfaf7] tracking-tight mb-3">
          {t.locationsTitle}
        </h2>
        <p className="text-sm sm:text-base text-[#bda897] font-light leading-relaxed">
          {t.locationsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Locations List */}
        <div className="lg:col-span-5 space-y-3">
          {locations.map((loc) => {
            const isSelected = activeLoc.id === loc.id;

            return (
              <div
                key={loc.id}
                onClick={() => setActiveLoc(loc)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1f150f] border-[#d97706] shadow-lg shadow-[#d97706]/5'
                    : 'bg-[#17100b] border-[#2a1b13] hover:border-[#38261b]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display text-base font-bold text-[#fcfaf7]">
                    {language === 'kh' ? loc.nameKh : loc.name}
                  </h3>
                  {loc.isFlagship && (
                    <span className="text-[10px] font-semibold text-[#d97706] bg-[#d97706]/10 px-2 py-0.5 rounded">
                      Flagship
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#a8988b] leading-relaxed mb-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#d97706] shrink-0 mt-0.5" />
                  <span>{language === 'kh' ? loc.addressKh : loc.address}</span>
                </p>

                <div className="flex items-center gap-4 text-[11px] text-[#8c7461] pt-2 border-t border-[#2d1e16]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#d97706]" />
                    <span>{loc.hours}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-[#d97706]" />
                    <span>{loc.phone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Simulated Google Map / Location Viewer */}
        <div className="lg:col-span-7 bg-[#17100b] border border-[#2d1e16] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Map display container */}
          <div className="relative h-80 sm:h-96 w-full bg-[#120d0a] overflow-hidden flex items-center justify-center">
            
            {/* Architectural stylized vector map background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#120d0a] via-transparent to-[#1f150f]" />

            {/* Grid street lines simulated */}
            <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-10">
              <div className="h-px bg-white w-full" />
              <div className="h-0.5 bg-[#d97706] w-full rotate-2" />
              <div className="h-px bg-white w-full -rotate-1" />
              <div className="h-px bg-white w-full" />
            </div>

            {/* Pinpoint Indicator */}
            <div className="relative z-10 flex flex-col items-center animate-bounce">
              <div className="px-3 py-1 rounded-full bg-[#120d0a] border border-[#d97706] text-[#fcfaf7] text-xs font-semibold shadow-xl flex items-center gap-1.5 whitespace-nowrap mb-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                <span>{language === 'kh' ? activeLoc.nameKh.split(' ')[0] : activeLoc.name.split(' ')[0]}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#d97706] text-[#120d0a] flex items-center justify-center shadow-lg shadow-[#d97706]/40">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            {/* Map metadata overlay */}
            <div className="absolute bottom-3 left-3 bg-[#120d0a]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#38261b] text-[11px] font-mono text-[#a8988b]">
              LAT: {activeLoc.coordinates.lat} · LNG: {activeLoc.coordinates.lng}
            </div>
          </div>

          {/* Location Action Bar */}
          <div className="p-6 bg-[#1a120d] border-t border-[#2d1e16] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display text-base font-bold text-[#fcfaf7]">
                {language === 'kh' ? activeLoc.nameKh : activeLoc.name}
              </h4>
              <p className="text-xs text-[#8c7461] mt-0.5">
                {language === 'kh' ? activeLoc.addressKh : activeLoc.address}
              </p>
            </div>

            <a
              href={activeLoc.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-md"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.directions}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

    </section>
  );
};
