/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Medicine, Promo, Settings } from '../types';
import { formatRupiah } from '../utils';
import { Tag, Calendar, Gift, ChevronRight, Share2, MessageCircle, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface PromoViewProps {
  promos: Promo[];
  medicines: Medicine[];
  settings: Settings;
  onSelectMedicine: (medicine: Medicine) => void;
}

export default function PromoView({ promos, medicines, settings, onSelectMedicine }: PromoViewProps) {
  const [visibleCount, setVisibleCount] = useState(12);
  
  // Find linked medicine
  const getLinkedMedicine = (medicineId?: string) => {
    if (!medicineId) return null;
    return medicines.find((m) => m.id === medicineId) || null;
  };

  // Find bundled medicines
  const getBundledMedicines = (bundledIds?: string[]) => {
    if (!bundledIds || bundledIds.length === 0) return [];
    return medicines.filter((m) => bundledIds.includes(m.id));
  };

  const handleConsultPromo = (promo: Promo, linkedMed: Medicine | null, isBundlingProduct?: boolean) => {
    let text = `Halo Apotek Assyifa Farma Cideres, saya tertarik dengan informasi:\n\n*Promo:* ${promo.title}\n*Keterangan:* ${promo.description}`;
    if (isBundlingProduct && promo.bundledMedicineIds) {
      const bundledMeds = getBundledMedicines(promo.bundledMedicineIds);
      text += `\n*Paket Bundling meliputi:* ${bundledMeds.map(m => m.name).join(', ')}`;
    } else if (linkedMed) {
      const finalPrice = linkedMed.isPromo && linkedMed.promoPrice ? linkedMed.promoPrice : linkedMed.price;
      text += `\n*Obat Terkait:* ${linkedMed.name} (${formatRupiah(finalPrice)})`;
    }
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const getPromoStatus = (promo: Promo) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(promo.validUntil);
    expDate.setHours(23, 59, 59, 999);

    if (promo.validFrom) {
      const startDate = new Date(promo.validFrom);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) {
        return 'BELUM_MULAI';
      }
    }

    if (today > expDate) {
      return 'EXPIRED';
    }

    return 'ACTIVE';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Promo Header banner */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none"></div>

        <div className="relative max-w-lg space-y-2">
          <span className="bg-white/20 text-white font-bold text-[9px] sm:text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase border border-white/10 inline-flex items-center gap-1.5 animate-pulse">
            <Gift size={11} /> Hubungi Lewat WA Untuk Klaim
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight select-none">HEMAT SETIAP PEKAN!</h2>
          <p className="text-xs sm:text-sm font-medium text-rose-50 leading-relaxed">
            Dapatkan diskon eksklusif dan potongan harga khusus untuk obat-obatan esensial, suplemen imunitas, dan nutrisi keluarga di Apotek Assyifa Farma Cideres.
          </p>
        </div>
      </div>

      {/* Customizable Promo greeting/welcome banner */}
      {settings.greetingPromo && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50/50 dark:from-rose-950/40 dark:to-orange-900/20 border border-rose-100 dark:border-rose-900/50 rounded-xl p-3 sm:p-4 flex items-start gap-3 shadow-xs animate-fadeIn">
          <div className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 p-2 rounded-lg mt-0.5 shrink-0">
            <Gift size={16} />
          </div>
          <div>
            <h4 className="font-extrabold text-rose-900 dark:text-rose-300 text-xs uppercase tracking-wider mb-1">PROMOSI AKTIF APOTEK:</h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">{settings.greetingPromo}</p>
          </div>
        </div>
      )}

      {promos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {promos.slice(0, visibleCount).map((p, idx) => {
              const linkedMed = getLinkedMedicine(p.medicineId);
              const status = getPromoStatus(p);
              const inactive = status !== 'ACTIVE';
              const expired = status === 'EXPIRED';
              const isIncoming = status === 'BELUM_MULAI';
              const bundledMedicinesList = getBundledMedicines(p.bundledMedicineIds);

              return (
                <motion.div
                  key={p.id}
                  id={`promo-card-${p.id}`}
                  initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`bg-white dark:bg-slate-900 rounded-xl border ${
                  inactive ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50' : 'border-rose-100 dark:border-rose-900 hover:border-rose-300 dark:hover:border-rose-700'
                } shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group`}
              >
                {/* Image Showcase */}
                {(p.bannerImageUrl || (!inactive && linkedMed?.image)) && (
                  <div className="h-40 sm:h-44 w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <img 
                      src={p.bannerImageUrl || linkedMed?.image} 
                      alt={p.bannerImageUrl ? "Banner Promo" : linkedMed?.name} 
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${inactive ? 'grayscale opacity-75' : ''}`} 
                      referrerPolicy="no-referrer" 
                    />
                    {!p.bannerImageUrl && (
                      <div className="absolute top-2 left-2 bg-rose-600/95 dark:bg-rose-700/95 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase shadow-xs">
                        PROMO PRODUK
                      </div>
                    )}
                  </div>
                )}

                {/* Promo Badge details */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-1.5 flex-wrap">
                    {p.isBundling ? (
                      <span className={`text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1 uppercase select-none ${
                        inactive ? 'bg-slate-500' : 'bg-indigo-600'
                      }`}>
                        <Gift size={11} /> BUNDLING HEMAT
                      </span>
                    ) : p.discountPercent && !inactive ? (
                      <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 uppercase select-none">
                        <Tag size={11} /> DISKON {p.discountPercent}%
                      </span>
                    ) : (
                      <span className="bg-slate-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg uppercase select-none">
                        PROMO REGULER
                      </span>
                    )}

                    {(() => {
                      if (isIncoming) {
                        return (
                          <span className="text-[11px] font-bold flex flex-col items-end leading-none text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-800/50">
                            <span className="text-[8px] font-extrabold uppercase text-amber-500 tracking-wider mb-0.5">Mulai: {p.validFrom}</span>
                            <span className="text-[8px]">Segera Hadir</span>
                          </span>
                        );
                      } else if (expired) {
                        return (
                          <span className="text-[11px] font-bold flex flex-col items-end leading-none text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[8px] font-extrabold uppercase tracking-wider mb-0.5">S/d: {p.validUntil}</span>
                            <span className="text-[8px]">Sudah Berakhir</span>
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-[11px] font-bold flex flex-col items-end leading-none text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800/50">
                            {p.validFrom && (
                              <span className="text-[8px] font-extrabold uppercase text-emerald-400 tracking-wider mb-0.5">Dari: {p.validFrom}</span>
                            )}
                            <span className="text-[9px] font-black">S/d: {p.validUntil}</span>
                          </span>
                        );
                      }
                    })()}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors uppercase">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal mt-1.5 whitespace-pre-wrap">
                      {p.description}
                    </p>
                  </div>

                  {/* Bundling products details */}
                  {p.isBundling && bundledMedicinesList.length > 0 && (() => {
                    const totalOriginal = bundledMedicinesList.reduce((acc, m) => acc + (m.priceMedis || m.price), 0);
                    const applyBundleDiscount = p.discountPercent 
                      ? totalOriginal * (1 - p.discountPercent / 100) 
                      : bundledMedicinesList.reduce((acc, m) => {
                          return acc + (m.isPromo && (m.pricePromo || m.promoPrice) ? (m.pricePromo || m.promoPrice || 0) : (m.priceMedis || m.price));
                        }, 0);

                    return (
                      <div className="space-y-2 bg-indigo-50/40 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/60 dark:border-indigo-800/30 mt-1">
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase block tracking-wider">Isi Paket Bundling:</span>
                        <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {bundledMedicinesList.map((bundled) => {
                            let itemOriginal = bundled.priceMedis || bundled.price;
                            let itemPromo = bundled.isPromo && (bundled.pricePromo || bundled.promoPrice) 
                               ? (bundled.pricePromo || bundled.promoPrice || itemOriginal) 
                               : itemOriginal;
                            
                            if (p.discountPercent) {
                               itemPromo = itemOriginal * (1 - p.discountPercent / 100);
                            }
                            
                            const hasDiscount = itemPromo < itemOriginal;
                            return (
                              <div 
                                key={bundled.id}
                                onClick={() => onSelectMedicine(bundled)}
                                className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-100/75 dark:border-indigo-800/50 flex items-center justify-between cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-2xs"
                              >
                                <div className="flex items-center gap-2">
                                  {bundled.image ? (
                                    <img src={bundled.image} alt={bundled.name} className="w-8 h-8 object-cover rounded" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-[8px] uppercase">
                                      MED
                                    </div>
                                  )}
                                  <div className="leading-tight">
                                    <p className="font-extrabold text-[10px] sm:text-[11px] text-indigo-950 dark:text-indigo-200 line-clamp-1">{bundled.name}</p>
                                    <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500">{bundled.category}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                  {hasDiscount ? (
                                    <>
                                      <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">{formatRupiah(itemPromo)}</span>
                                      <span className="text-[8px] text-slate-400 dark:text-slate-500 line-through">{formatRupiah(itemOriginal)}</span>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{formatRupiah(itemOriginal)}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
                           <span className="text-[11px] font-black text-indigo-900 dark:text-indigo-300 uppercase">Total Paket</span>
                           <div className="flex flex-col items-end">
                              {applyBundleDiscount < totalOriginal ? (
                                <>
                                  <span className="text-[12px] font-black text-rose-600 dark:text-rose-400">{formatRupiah(applyBundleDiscount)}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 line-through">{formatRupiah(totalOriginal)}</span>
                                </>
                              ) : (
                                <span className="text-[12px] font-black text-indigo-700 dark:text-indigo-400">{formatRupiah(totalOriginal)}</span>
                              )}
                           </div>
                        </div>
                      </div>
                    );
                  })()}

                  {!p.isBundling && linkedMed && (
                    <div 
                      id={`promo-link-med-${p.id}`}
                      onClick={() => onSelectMedicine(linkedMed)}
                      className="p-3 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800/50 flex items-center justify-between cursor-pointer transition-all mt-1"
                    >
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="w-1 h-8 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0"></span>
                        <div>
                          <p className="font-bold text-blue-900 dark:text-blue-200 line-clamp-1">{linkedMed.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {linkedMed.isPromo && (linkedMed.pricePromo || linkedMed.promoPrice) ? (
                              <>
                                <span className="font-extrabold text-rose-600 dark:text-rose-400">{formatRupiah(linkedMed.pricePromo || linkedMed.promoPrice || 0)}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">{formatRupiah(linkedMed.priceMedis || linkedMed.price)}</span>
                              </>
                            ) : (
                              <span className="font-bold text-slate-700 dark:text-slate-300">{formatRupiah(linkedMed.priceMedis || linkedMed.price)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-xs px-2 py-1 rounded border border-blue-100 dark:border-blue-800 flex items-center gap-0.5 whitespace-nowrap scroll-mx-0">
                        Lihat Obat <ChevronRight size={10} />
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom interactive panel */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    Assyifa Farma Cideres
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      id={`promo-chat-${p.id}`}
                      onClick={() => handleConsultPromo(p, p.isBundling ? null : linkedMed, p.isBundling)}
                      className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-98 min-h-[38px]"
                    >
                      <MessageCircle size={13} /> Chat WA
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>

          {visibleCount < promos.length && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 12)}
                className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 px-6 py-2.5 rounded-full font-bold text-sm border border-rose-100 dark:border-rose-900 transition-colors cursor-pointer"
              >
                Muat Lebih Banyak ({promos.length - visibleCount} tersisa)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Gift size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Brosur promosi sedang dikemas oleh pihak Apoteker.</p>
        </div>
      )}
    </div>
  );
}
