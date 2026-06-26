/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Medicine, Promo, Settings } from './types';
import CatalogView from './components/CatalogView';
import PromoView from './components/PromoView';
import RoomControl from './components/RoomControl';
import { 
  subscribeMedicines, 
  subscribePromos, 
  subscribeSettings,
  firebaseInitializeData
} from './firebaseUtils';
import { 
  Heart, 
  MapPin, 
  Clock, 
  BookOpen, 
  Gift, 
  Settings2, 
  Activity, 
  PhoneCall, 
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'promo' | 'control'>('catalog');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [settings, setSettings] = useState<Settings>({ adminPin: '12345', whatsappNumber: '6281234567890' });
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize and load data on component mount
  useEffect(() => {
    firebaseInitializeData();
    const unsub1 = subscribeMedicines(setMedicines);
    const unsub2 = subscribePromos(setPromos);
    const unsub3 = subscribeSettings(setSettings);
    
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const refreshData = () => {
    // For compatibility with RoomControl callbacks, although no longer strictly needed due to onSnapshot
  };

  // Dynamic filter out of expired promos and price adjustments for clients
  const { clientPromos, clientMedicines } = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activePromos = promos.filter((p) => {
      // Parse validUntil
      const expDate = new Date(p.validUntil);
      expDate.setHours(23, 59, 59, 999);

      // check if it has expired
      if (today > expDate) {
        return false;
      }

      // Check if it has started
      if (p.validFrom) {
        const startDate = new Date(p.validFrom);
        startDate.setHours(0, 0, 0, 0);
        if (today < startDate) {
          return false; // Hide until it starts
        }
      }

      return true;
    });

    const activeNonBundlePromos = activePromos.filter((p) => !p.isBundling && p.medicineId);

    // Create a Map for O(1) lookup to improve performance with large datasets
    const promoMap = new Map();
    activeNonBundlePromos.forEach((p) => {
      if (p.medicineId) {
        promoMap.set(p.medicineId, p);
      }
    });

    const processedMedicines = medicines.map((m) => {
      // Find an active promo associated with this specific medicine O(1)
      const promoForMed = promoMap.get(m.id);
      if (promoForMed) {
        // Compute calculated promoPrice based on discount percent
        const discount = promoForMed.discountPercent || 0;
        const originalPrice = m.priceMedis || m.price;
        const computedPromoPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : undefined;
        return {
          ...m,
          isPromo: true,
          promoPrice: m.pricePromo || computedPromoPrice || m.promoPrice
        };
      } else {
        // No active promo exists -> reverts to normal!
        return {
          ...m,
          isPromo: false,
          promoPrice: undefined
        };
      }
    });

    return {
      clientPromos: activePromos,
      clientMedicines: processedMedicines
    };
  }, [promos, medicines]);

  const handleSelectFromPromo = (med: Medicine) => {
    setSelectedMedicine(med);
    setActiveTab('catalog');
    
    // Quick auto-scroll to search container for high usability
    setTimeout(() => {
      document.getElementById('catalog-search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const bgStyle = React.useMemo(() => {
    const type = settings.bgType || 'default';
    const color = settings.bgColor || '#f8fafc'; // Default slate-50 hex equivalent
    
    if (type === 'solid') {
      return color.startsWith('bg-') ? {} : { backgroundColor: color };
    }
    if (type === 'pattern') {
      const pattern = settings.bgPattern || 'dots';
      if (pattern === 'dots') {
        return {
          backgroundColor: color,
          backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        };
      }
      if (pattern === 'grid') {
        return {
          backgroundColor: color,
          backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        };
      }
      if (pattern === 'stripes') {
        return {
          backgroundColor: color,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.05), rgba(148, 163, 184, 0.05) 10px, transparent 10px, transparent 20px)',
        };
      }
      if (pattern === 'crosses') {
        return {
          backgroundColor: color,
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 10%, transparent 11%), radial-gradient(circle, rgba(148, 163, 184, 0.15) 10%, transparent 11%)',
          backgroundPosition: '0 0, 8px 8px',
          backgroundSize: '16px 16px',
        };
      }
    }
    if (type === 'image' && settings.bgImageUrl) {
      return {
        backgroundImage: `url(${settings.bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {}; // Default
  }, [settings.bgType, settings.bgColor, settings.bgPattern, settings.bgImageUrl]);

  return (
    <div 
      className={`min-h-screen font-sans antialiased text-slate-700 dark:text-slate-200 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 ${
        (!settings.bgType || settings.bgType === 'default') ? 'bg-slate-50 dark:bg-slate-950' : (settings.bgType === 'solid' && settings.bgColor?.startsWith('bg-') ? settings.bgColor : '')
      }`}
      style={bgStyle}
    >
      
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white/90 text-xs py-2 px-6 shrink-0 shadow-xs border-b border-slate-800 dark:border-slate-900 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center text-[10px] md:text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-blue-400" />
              {settings.pharmacyAddress || 'Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka'}
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Clock size={12} className="text-blue-400" />
              Buka Setiap Hari: 07:00 - 22:00 WIB
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded border border-white/5 font-semibold text-[10px]">
            <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
            Melayani Dengan Sepenuh Hati
          </div>
        </div>
      </div>

      {/* Hero Brand Section */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 sm:py-6 px-4 sm:px-6 shrink-0 shadow-sm transition-colors z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-row justify-between items-center gap-3 sm:gap-6">
            <div className="flex flex-row items-center gap-2.5 sm:gap-4 text-left">
            {/* Visual medical icon/avatar */}
            {settings.pharmacyLogo ? (
              <img 
                src={settings.pharmacyLogo} 
                alt="Logo Apotek" 
                className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800 shrink-0" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shrink-0 shadow-lg shadow-blue-600/30 border-2 border-white dark:border-slate-800 relative overflow-hidden">
                <span className="relative z-10">A</span>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full blur-sm"></div>
                <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full blur-sm"></div>
              </div>
            )}
            <div className="space-y-0.5 flex flex-col justify-center">
              <h1 className="font-black text-xl sm:text-3xl md:text-4xl tracking-tight flex flex-col sm:flex-row items-start sm:items-baseline justify-center sm:justify-start sm:gap-2 leading-none uppercase">
                <span className="font-medium tracking-widest text-slate-400 dark:text-slate-500 text-[8px] sm:text-sm md:text-base mb-0.5 sm:mb-0">APOTEK</span>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-transparent bg-clip-text drop-shadow-sm pb-0.5 sm:pb-1">
                  ASSYIFA FARMA
                </span>
              </h1>
              <div className="flex items-center justify-start gap-2">
                <span className="w-4 h-0.5 bg-blue-500 rounded-full hidden sm:block"></span>
                <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase truncate max-w-[200px] sm:max-w-none">
                  Cideres <span className="text-blue-500 mx-1">•</span> <span className="hidden sm:inline">Professional Health Services</span><span className="sm:hidden">Health Services</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
              title="Toggle Tema"
            >
              {isDarkMode ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
            </button>

            {/* Quick WA Info callout */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-1.5 sm:p-3 rounded-lg sm:rounded-xl shadow-2xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                 onClick={() => window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank')}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <PhoneCall size={14} />
              </div>
              <div className="text-left text-xs hidden sm:block">
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">Layanan Konsultasi Resep</p>
                <div className="font-bold text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors block">
                  +{settings.whatsappNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-28 sm:pb-8">
        
        {/* TAB CONTROLS */}
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:relative sm:bottom-0 sm:left-auto sm:right-auto sm:flex sm:justify-center w-auto sm:w-full px-0">
          <div className="flex w-full sm:w-auto p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40 relative max-w-sm mx-auto sm:max-w-none">
            
            {/* Catalog tab button */}
            <button
              id="tab-btn-catalog"
              onClick={() => {
                setActiveTab('catalog');
                setSelectedMedicine(null);
              }}
              className={`relative flex-1 sm:flex-none px-3 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer z-10 ${
                activeTab === 'catalog'
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {activeTab === 'catalog' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <BookOpen size={16} className="shrink-0" />
              <span className="tracking-wide">Katalog</span>
            </button>

            {/* Promo tab button */}
            <button
              id="tab-btn-promo"
              onClick={() => {
                setActiveTab('promo');
                setSelectedMedicine(null);
              }}
              className={`relative flex-1 sm:flex-none px-3 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer z-10 ${
                activeTab === 'promo'
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {activeTab === 'promo' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl shadow-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative shrink-0 flex items-center justify-center">
                <Gift size={16} />
                {clientPromos.length > 0 && activeTab !== 'promo' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                )}
              </div>
              <span className="tracking-wide">Promo</span>
            </button>

            {/* Control tab button */}
            <button
              id="tab-btn-control"
              onClick={() => {
                setActiveTab('control');
                setSelectedMedicine(null);
              }}
              className={`relative flex-1 sm:flex-none px-3 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer z-10 ${
                activeTab === 'control'
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {activeTab === 'control' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-xl shadow-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Settings2 size={16} className="shrink-0" />
              <span className="tracking-wide">Admin</span>
            </button>
          </div>
        </div>

        {/* Tab View Switchboard with Custom Transition wrappers */}
        <div className="focus:outline-hidden">
          {activeTab === 'catalog' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <CatalogView 
                medicines={clientMedicines} 
                settings={settings} 
                selectedMedicine={selectedMedicine}
                setSelectedMedicine={setSelectedMedicine}
              />
            </motion.div>
          )}

          {activeTab === 'promo' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <PromoView 
                promos={clientPromos} 
                medicines={clientMedicines} 
                settings={settings}
                onSelectMedicine={handleSelectFromPromo}
              />
            </motion.div>
          )}

          {activeTab === 'control' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <RoomControl 
                medicines={medicines} 
                promos={promos} 
                settings={settings} 
                onDataChange={refreshData}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Beautiful human-labeled informative Footer */}
      <footer className="bg-slate-800 text-slate-450 py-10 px-6 border-t border-slate-700 mt-20 text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-300">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <Activity size={18} className="text-blue-400" />
              Apotek Assyifa Farma Cideres
            </div>
            <p className="leading-relaxed font-light text-slate-300">
              Menyediakan obat-obatan generik berkualitas, paten mulia, kosmetik bersertifikat BPOM, dan suplemen harian lengkap untuk warga Cideres dan sekitarnya demi pelayanan maksimal.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-white font-bold text-sm">Tautan Informasi Klasifikasi</div>
            <p className="leading-relaxed font-light text-slate-400">
              Sistem klasifikasi warna lingkaran obat (Hijau, Biru, Merah K, Suplemen Kuning) dipancangkan mengikuti panduan resmi Badan Pengawas Obat dan Makanan (BPOM) Republik Indonesia demi swamedikasi aman.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-sm">Kontak Pelayanan Resmi</div>
            <p className="leading-relaxed font-light">{settings.pharmacyAddress || 'Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka, Jawa Barat.'}</p>
            <p>WhatsApp: <span className="text-blue-400 font-semibold font-mono">+{settings.whatsappNumber}</span></p>
            <div className="inline-flex items-center gap-1 text-[10px] bg-slate-900 px-3 py-1 rounded border border-slate-700/80 mt-2 text-blue-400">
              <ShieldCheck size={11} className="shrink-0" /> Terkoneksi Room Control Terproteksi
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-10 border-t border-slate-705/30 border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-semibold select-none">
          <span>© {new Date().getFullYear()} Apotek Assyifa Farma Cideres. All Rights Reserved.</span>
          <span className="text-slate-400">Pelayanan Cepat • Akurat • Amanah</span>
        </div>
      </footer>
    </div>
  );
}
