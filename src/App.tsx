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
  ShieldCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'promo' | 'control'>('catalog');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [settings, setSettings] = useState<Settings>({ adminPin: '12345', whatsappNumber: '6281234567890' });
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

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
      className={`min-h-screen font-sans antialiased text-slate-700 selection:bg-blue-105 selection:bg-blue-100 selection:text-blue-900 ${
        (!settings.bgType || settings.bgType === 'default') ? 'bg-slate-50' : (settings.bgType === 'solid' && settings.bgColor?.startsWith('bg-') ? settings.bgColor : '')
      }`}
      style={bgStyle}
    >
      
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 text-white/90 text-xs py-2 px-6 shrink-0 shadow-xs border-b border-slate-800">
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
      <header className="bg-white border-b border-slate-200 py-4 sm:py-6 px-4 sm:px-6 shrink-0 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-3.5 text-center sm:text-left">
            {/* Visual medical icon/avatar */}
            {settings.pharmacyLogo ? (
              <img 
                src={settings.pharmacyLogo} 
                alt="Logo Apotek" 
                className="w-12 h-12 rounded-xl object-contain border border-slate-100 bg-slate-50 p-0.5 shrink-0 shadow-xs" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-11 h-11 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm shadow-blue-600/10">
                A
              </div>
            )}
            <div className="space-y-0.5">
              <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight text-slate-800 flex items-center justify-center sm:justify-start gap-1 uppercase">
                APOTEK <span className="text-blue-600">ASSYIFA FARMA</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-600 font-bold tracking-wide">
                Cideres • Professional Health Services
              </p>
            </div>
          </div>

          {/* Quick WA Info callout */}
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto gap-3 bg-blue-50/50 border border-blue-100 p-2.5 sm:p-3 rounded-xl shadow-2xs">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <PhoneCall size={14} />
            </div>
            <div className="text-left text-xs">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">Layanan Konsultasi Resep</p>
              <a 
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-slate-800 hover:text-blue-700 hover:underline transition-all block sm:inline"
              >
                +{settings.whatsappNumber}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* TAB CONTROLS */}
        <div className="flex justify-center w-full px-1 sm:px-0">
          <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto rounded-xl sm:rounded-2xl p-1 bg-white border border-slate-200/80 shadow-xs max-w-lg sm:max-w-none">
            
            {/* Catalog tab button */}
            <button
              id="tab-btn-catalog"
              onClick={() => {
                setActiveTab('catalog');
                setSelectedMedicine(null);
              }}
              className={`px-2 sm:px-6 py-3 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen size={14} className="shrink-0" />
              <span className="tracking-wide">KATALOG OBAT</span>
            </button>

            {/* Promo tab button */}
            <button
              id="tab-btn-promo"
              onClick={() => {
                setActiveTab('promo');
                setSelectedMedicine(null);
              }}
              className={`px-2 sm:px-6 py-3 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer relative ${
                activeTab === 'promo'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Gift size={14} />
                {clientPromos.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                )}
              </div>
              <span className="tracking-wide">DAFTAR PROMO</span>
            </button>

            {/* Control tab button */}
            <button
              id="tab-btn-control"
              onClick={() => {
                setActiveTab('control');
                setSelectedMedicine(null);
              }}
              className={`px-2 sm:px-6 py-3 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                activeTab === 'control'
                  ? 'bg-slate-800 text-white shadow-xs shadow-slate-700/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings2 size={14} className="shrink-0" />
              <span className="tracking-wide">ROOM CONTROL</span>
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
