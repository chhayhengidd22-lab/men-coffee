import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n/translations';
import { TableSection } from '../types';
import { LOUNGE_IMAGE } from '../data/mockData';
import { Calendar, Users, Clock, Compass, ShieldCheck } from 'lucide-react';

interface TableReservationSectionProps {
  onOpenAuth: () => void;
}

export const TableReservationSection: React.FC<TableReservationSectionProps> = ({ onOpenAuth }) => {
  const { reserveTable, language, showToast } = useStore();
  const { user, isAuthenticated } = useAuth();
  const t = translations[language];

  const [date, setDate] = useState<string>('2026-09-24');
  const [timeSlot, setTimeSlot] = useState<string>('14:30');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [section, setSection] = useState<TableSection>('indoor_ac');
  const [phone, setPhone] = useState<string>(user?.phone || '+855 12 345 678');
  const [specialRequest, setSpecialRequest] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reserveTable({
        date,
        timeSlot,
        guestCount,
        section,
        customerPhone: phone,
        specialRequest: specialRequest.trim(),
      });
      if (res.success) {
        setSpecialRequest('');
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reserve-section" className="py-16 sm:py-20 bg-[#140e0a] border-y border-[#2d1e16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Architectural visual and philosophy */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#d97706] block">
              {language === 'kh' ? 'កក់តុពិសាកាហ្វេ' : 'Curated Hospitality'}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fcfaf7] leading-tight">
              {t.reserveTitle}
            </h2>
            <p className="text-sm text-[#bda897] font-light leading-relaxed">
              {t.reserveSubtitle}
            </p>

            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#2d1e16]">
              <img
                src={LOUNGE_IMAGE}
                alt="AURA Specialty Lounge Seating"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-[#fcfaf7] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#d97706]" />
                <span>Reserved seats held for up to 20 minutes past booking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Form */}
          <div className="lg:col-span-7 bg-[#1a120d] border border-[#2d1e16] rounded-2xl p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                    {t.selectDate}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#20150e] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                {/* Time slot */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                    {t.selectTime}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#20150e] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
                    >
                      <option value="08:00">08:00 AM — Morning Brew Session</option>
                      <option value="10:00">10:00 AM — Brunch & Coffee</option>
                      <option value="12:30">12:30 PM — Afternoon Espresso</option>
                      <option value="14:30">02:30 PM — Pour Over Pairing</option>
                      <option value="16:30">04:30 PM — Sunset Chill</option>
                      <option value="18:30">06:30 PM — Evening Lounge</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guest Count & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                    {t.guestNumber}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7461]" />
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#20150e] border border-[#2d1e16] text-[#f4efe9] font-mono focus:outline-none focus:border-[#d97706]"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest (Solo Coffee Work)' : `Guests (${num} Seats)`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                    {t.phonePrompt}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+855 12 345 678"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#20150e] border border-[#2d1e16] text-[#f4efe9] font-mono focus:outline-none focus:border-[#d97706]"
                  />
                </div>
              </div>

              {/* Seating Zone Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-2">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>{t.seatingZone}</span>
                  </div>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'indoor_ac' as TableSection, title: t.zoneIndoor, desc: 'Quiet, AC, fast Wi-Fi' },
                    { id: 'garden_terrace' as TableSection, title: t.zoneGarden, desc: 'Bonsai, water pond, breezy' },
                    { id: 'roastery_bar' as TableSection, title: t.zoneRoasteryBar, desc: 'Front seat to Slayer extraction' },
                    { id: 'vip_lounge' as TableSection, title: t.zoneVip, desc: 'Private suite for business meetings' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSection(z.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        section === z.id
                          ? 'border-[#d97706] bg-[#d97706]/15 text-[#fcfaf7]'
                          : 'border-[#2d1e16] bg-[#20150e] text-[#a8988b] hover:border-[#442c1f]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{z.title}</div>
                      <div className="text-[10px] text-[#8c7461] mt-0.5">{z.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4c5b6] mb-1.5">
                  {t.specialNotes}
                </label>
                <input
                  type="text"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder={language === 'kh' ? 'ឧ. ត្រូវការតុជិតព្រីភ្លើង, ពិភាក្សាការងារស្ងប់ស្ងាត់...' : 'e.g. Quiet corner, laptop power outlet, anniversary...'}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#20150e] border border-[#2d1e16] text-[#f4efe9] focus:outline-none focus:border-[#d97706]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-[#120d0a] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#d97706]/20 disabled:opacity-50"
              >
                {isSubmitting ? t.loading : t.bookTableBtn}
              </button>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
