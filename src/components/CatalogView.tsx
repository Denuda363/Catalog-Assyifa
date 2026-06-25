/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Medicine, Settings } from '../types';
import { formatRupiah, formatDate } from '../utils';
import { 
  Search, 
  RotateCcw, 
  Tag, 
  FileText, 
  Activity, 
  Clock, 
  ShoppingBag, 
  ChevronRight, 
  X, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogViewProps {
  medicines: Medicine[];
  settings: Settings;
  selectedMedicine: Medicine | null;
  setSelectedMedicine: (medicine: Medicine | null) => void;
}

interface MedicineCardProps {
  key?: any;
  med: Medicine;
  idx: number;
  getClassificationStyles: (category: string) => any;
  setSelectedMedicine: (medicine: any) => void;
}

function MedicineCard({ med, idx, getClassificationStyles, setSelectedMedicine }: MedicineCardProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>(med.baseUnit || 'Lembar');

  // Multiplier for price calculation
  const multiplier = useMemo(() => {
    if (selectedUnit === (med.baseUnit || 'Lembar')) return 1;
    const found = med.multiUnits?.find(u => u.name === selectedUnit);
    return found ? found.multiplier : 1;
  }, [selectedUnit, med]);

  const styles = getClassificationStyles(med.category);

  // Calculate pricing based on multiplier
  const basePrice = (med.priceMedis || med.price) * multiplier;
  const promoPrice = (med.pricePromo || med.promoPrice) ? (med.pricePromo || med.promoPrice || 0) * multiplier : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: idx * 0.02 }}
      id={`medicine-card-${med.id}`}
      className="bg-white rounded-xl border border-slate-205 hover:border-blue-400 hover:shadow-md transition-all duration-305 flex flex-col overflow-hidden group cursor-pointer"
      onClick={() => setSelectedMedicine(med)}
    >
      {/* Visual Category Header Band / Image Preview */}
      {med.image ? (
        <div className="h-28 sm:h-36 w-full bg-slate-50 relative overflow-hidden border-b border-slate-100 shrink-0">
          <img 
            src={med.image} 
            alt={med.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute top-1.5 left-1.5 bg-blue-600/90 text-white text-[7px] sm:text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
            Media Foto
          </div>
        </div>
      ) : (
        <div className="h-16 sm:h-20 w-full bg-gradient-to-b from-blue-50/20 to-slate-50/40 border-b border-slate-100 flex flex-col items-center justify-center text-slate-400 p-1.5 shrink-0">
          <Activity size={14} className="text-blue-300 group-hover:animate-pulse" />
          <span className="text-[8px] uppercase font-extrabold text-slate-400 tracking-wider mt-1 select-none">Katalog Medis</span>
        </div>
      )}

      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1.5">
            {/* Category Label */}
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-wide border uppercase ${styles.badge}`}>
              <span className={`w-1 h-1 rounded-full mr-1 ${styles.dot}`}></span>
              {med.category}
            </span>
          </div>

          {/* Medicine Name */}
          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
            {med.name}
          </h3>

          {/* Active Ingredient / Composition */}
          <p className="text-[9px] sm:text-[10px] text-slate-400 line-clamp-1 font-medium mb-1.5">
            Kandungan: {med.activeIngredient || '-'}
          </p>

          {/* Indication Snapshot */}
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-normal line-clamp-2 leading-snug mb-2">
            {med.indication}
          </p>

          {/* Dynamic Satuan selector badge row if multi satuan is available */}
          {med.multiUnits && med.multiUnits.length > 0 && (
            <div className="mt-1 pb-1.5 border-t border-slate-100 pt-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pilih Satuan:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedUnit(med.baseUnit || 'Lembar')}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black border transition-all cursor-pointer ${
                    selectedUnit === (med.baseUnit || 'Lembar')
                      ? 'bg-blue-600 text-white border-blue-605 border-blue-600 shadow-3xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {med.baseUnit || 'Lembar'}
                </button>
                {med.multiUnits.map((u) => (
                  <button
                    key={u.name}
                    type="button"
                    onClick={() => setSelectedUnit(u.name)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black border transition-all cursor-pointer ${
                      selectedUnit === u.name
                        ? 'bg-blue-600 text-white border-blue-605 border-blue-600 shadow-3xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {u.name} ({u.multiplier}x)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Lower Deck (Price & Action) */}
      <div className="bg-slate-50/70 p-2.5 sm:p-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          {med.isPromo && promoPrice ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] sm:text-[9px] text-slate-400 line-through font-semibold">
                  {formatRupiah(basePrice)}
                </span>
                <span className="bg-orange-105 bg-orange-100 text-orange-700 text-[6.5px] sm:text-[7.5px] font-black px-1 rounded select-none">
                  PROMO
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-rose-600">
                {formatRupiah(promoPrice)}
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-black text-slate-800 focus:outline-hidden">
              {formatRupiah(basePrice)}
            </div>
          )}
          {med.multiUnits && med.multiUnits.length > 0 && (
            <span className="text-[8px] font-bold text-slate-400 block -mt-0.5">per {selectedUnit}</span>
          )}
        </div>

        <span className="text-blue-600 text-[10px] sm:text-xs font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
          Detail <ChevronRight size={12} className="ml-0.5" />
        </span>
      </div>
    </motion.div>
  );
}

export default function CatalogView({ medicines, settings, selectedMedicine, setSelectedMedicine }: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortOption, setSortOption] = useState('name-asc');
  const [selectedModalUnit, setSelectedModalUnit] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(24);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedCategory, sortOption]);

  useEffect(() => {
    if (selectedMedicine) {
      setSelectedModalUnit(selectedMedicine.baseUnit || 'Lembar');
    } else {
      setSelectedModalUnit('');
    }
  }, [selectedMedicine]);

  const modalMultiplier = useMemo(() => {
    if (!selectedMedicine) return 1;
    if (selectedModalUnit === (selectedMedicine.baseUnit || 'Lembar')) return 1;
    const found = selectedMedicine.multiUnits?.find(u => u.name === selectedModalUnit);
    return found ? found.multiplier : 1;
  }, [selectedModalUnit, selectedMedicine]);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(medicines.map((m) => m.category));
    return ['Semua', ...Array.from(list)];
  }, [medicines]);

  // Color matching for Indonesian drug classification standard
  const getClassificationStyles = (category: string) => {
    switch (category) {
      case 'Obat Bebas':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          symbol: 'Hijau (Bebas)',
          description: 'Dapat dibeli tanpa resep dokter'
        };
      case 'Obat Bebas Terbatas':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
          symbol: 'Biru (Bebas Terbatas)',
          description: 'Obat keras berperingatan, beli tanpa resep'
        };
      case 'Obat Keras':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          symbol: 'Merah K (Obat Keras)',
          description: 'WAJIB menggunakan Resep Dokter'
        };
      case 'Herbal & Suplemen':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          symbol: 'Kuning Jingga',
          description: 'Suplemen kesehatan, vitamin, dan jamu'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          symbol: 'Standar Medis',
          description: 'Alat penunjang medis atau perlengkapan anak'
        };
    }
  };

  // Filter & sort logic
  const filteredMedicines = useMemo(() => {
    let result = [...medicines];

    // Search by Name or Active Ingredient
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.activeIngredient.toLowerCase().includes(query) ||
          m.indication.toLowerCase().includes(query)
      );
    }

    // Category Filter
    if (selectedCategory !== 'Semua') {
      result = result.filter((m) => m.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.price;
      const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.price;

      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'name-desc') {
        return b.name.localeCompare(a.name);
      } else if (sortOption === 'price-asc') {
        return priceA - priceB;
      } else if (sortOption === 'price-desc') {
        return priceB - priceA;
      } else if (sortOption === 'updated-desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

    return result;
  }, [medicines, searchTerm, selectedCategory, sortOption]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Semua');
    setSortOption('name-asc');
  };

  const handleWhatsappOrder = (med: Medicine) => {
    const originalPrice = med.isPromo && med.promoPrice ? med.promoPrice : med.price;
    const finalPrice = originalPrice * modalMultiplier;
    const chosenUnit = selectedModalUnit || med.baseUnit || 'Lembar';
    const chosenMultiplierText = modalMultiplier > 1 ? ` (Isi ${modalMultiplier} ${med.baseUnit || 'Lembar'})` : '';

    const text = `Halo Apotek Assyifa Farma Cideres, saya ingin menanyakan/memesan obat berikut:\n\n*Nama Obat:* ${med.name}\n*Kategori:* ${med.category}\n*Satuan Pesanan:* ${chosenUnit}${chosenMultiplierText}\n*Harga:* ${formatRupiah(finalPrice)} (Konversi Otomatis)\n\nApakah stok masih ada? Terima kasih.`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Customizable Catalog greeting/welcome banner */}
      {settings.greetingCatalog && (
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-xl p-4 flex items-start gap-3 shadow-xs animate-fadeIn">
          <div className="bg-blue-100 text-blue-700 p-2 rounded-lg mt-0.5 shrink-0">
            <CheckCircle size={16} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-wrap">{settings.greetingCatalog}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Header Container */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          {/* Search bar input with custom id */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Cari nama obat, kandungan aktif, atau khasiat..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm transition-all text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick sorting dropdown with custom id */}
          <div className="w-full md:w-56">
            <select
              id="catalog-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="name-asc">Urutkan: Nama (A - Z)</option>
              <option value="name-desc">Urutkan: Nama (Z - A)</option>
              <option value="price-asc">Urutkan: Harga Terendah</option>
              <option value="price-desc">Urutkan: Harga Tertinggi</option>
              <option value="updated-desc">Urutkan: Terakhir Diperbarui</option>
            </select>
          </div>
        </div>

        {/* Filter Badges with horizontal scrolling on mobile and wrap on screen md */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block">Kategori Obat:</span>
          
          {/* Scrollable categories wrap */}
          <div className="flex overflow-x-auto pb-1.5 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-none snap-x select-none scroll-smooth">
            {categories.map((cat, idx) => (
              <button
                id={`cat-filter-btn-${idx}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 sm:px-4 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 snap-start cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-205 border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Stock Selection removed, keep Reset button if filters active */}
        {(searchTerm || selectedCategory !== 'Semua' || sortOption !== 'name-asc') && (
          <div className="flex justify-end pt-2">
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-rose-600 hover:text-rose-800 font-extrabold transition-all hover:underline py-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Matches Count Banner */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <p>Menampilkan <span className="font-semibold text-slate-800">{filteredMedicines.length}</span> produk terdaftar</p>
        {selectedCategory !== 'Semua' && (
          <p>Kategori: <span className="font-semibold text-blue-600">{selectedCategory}</span></p>
        )}
      </div>

      {/* Catalog Grid */}
      {filteredMedicines.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredMedicines.slice(0, visibleCount).map((med, idx) => (
              <MedicineCard
                key={med.id}
                med={med}
                idx={idx}
                getClassificationStyles={getClassificationStyles}
                setSelectedMedicine={setSelectedMedicine}
              />
            ))}
          </div>
          
          {visibleCount < filteredMedicines.length && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-2.5 rounded-full font-bold text-sm border border-indigo-100 transition-colors cursor-pointer"
              >
                Muat Lebih Banyak ({filteredMedicines.length - visibleCount} tersisa)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-400 text-sm font-medium animate-pulse">Tidak ada obat yang cocok dengan kueri filter Anda.</p>
          <button
            id="reset-search-btn"
            onClick={resetFilters}
            className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs hover:bg-blue-100 transition-all border border-blue-200/50"
          >
            Bersihkan Hasil
          </button>
        </div>
      )}

      {/* Detail Overlay Sheet - Slide up bottom sheet on mobile, centered modal on desktop */}
      <AnimatePresence>
        {selectedMedicine && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
            {/* Absolute overlay clicking to dismiss */}
            <div className="absolute inset-0 cursor-default" onClick={() => setSelectedMedicine(null)} />
            
            <motion.div
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 1 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl overflow-hidden border-t sm:border border-slate-200 z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col relative"
              id="details-modal"
            >
              {/* Mobile Gesture Handle Indicator */}
              <div 
                onClick={() => setSelectedMedicine(null)} 
                className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden shadow-3xs shrink-0 cursor-pointer hover:bg-slate-400 transition-colors"
                title="Tarik atau ketuk untuk menutup"
              />

              {/* Modal Header/Banner */}
              <div className="bg-slate-900 p-4 sm:p-5 text-white relative shrink-0">
                <button
                  id="close-details-btn"
                  onClick={() => setSelectedMedicine(null)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="space-y-1 pr-6">
                  {/* Category Pill inside Modal */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${getClassificationStyles(selectedMedicine.category).badge}`}>
                    {selectedMedicine.category}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight uppercase tracking-tight mt-1">{selectedMedicine.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kandungan Aktif: <strong className="text-white font-medium">{selectedMedicine.activeIngredient || '-'}</strong>
                  </p>
                </div>
              </div>

              {/* Scrollable Container Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Large product image display inside detail modal */}
                {selectedMedicine.image && (
                  <div className="w-full h-40 sm:h-44 bg-slate-100 overflow-hidden relative rounded-lg border border-slate-150 shrink-0 mb-3">
                    <img src={selectedMedicine.image} alt={selectedMedicine.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-2 right-2 bg-slate-900/60 text-white backdrop-blur-xs text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider select-none">
                      Foto Produk Asli
                    </div>
                  </div>
                )}

                {/* Price block */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-205 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Harga Obat ({selectedModalUnit})</span>
                    {selectedMedicine.isPromo && selectedMedicine.promoPrice ? (
                      <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-rose-600">
                          {formatRupiah(selectedMedicine.promoPrice * modalMultiplier)}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-medium">
                          {formatRupiah((selectedMedicine.priceMedis || selectedMedicine.price) * modalMultiplier)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-black text-slate-800 mt-0.5 block">
                        {formatRupiah((selectedMedicine.priceMedis || selectedMedicine.price) * modalMultiplier)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Unit Selector */}
                {selectedMedicine.multiUnits && selectedMedicine.multiUnits.length > 0 && (
                  <div className="p-3.5 bg-indigo-50/30 rounded-xl border border-indigo-100 flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={12} /> Pilih Satuan Pembelian (Konversi Otomatis):
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedModalUnit(selectedMedicine.baseUnit || 'Lembar')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                          selectedModalUnit === (selectedMedicine.baseUnit || 'Lembar')
                            ? 'bg-blue-600 text-white border-blue-600 shadow-3xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {selectedMedicine.baseUnit || 'Lembar'} (Harga Dasar)
                      </button>
                      {selectedMedicine.multiUnits.map((u) => (
                        <button
                          key={u.name}
                          type="button"
                          onClick={() => setSelectedModalUnit(u.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                            selectedModalUnit === u.name
                              ? 'bg-blue-600 text-white border-blue-600 shadow-3xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          1 {u.name} ({u.multiplier} x {selectedMedicine.baseUnit || 'Lembar'})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indication section */}
                <div className="space-y-1">
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} className="text-blue-600" />
                    Indikasi / Khasiat:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100/60">
                    {selectedMedicine.indication}
                  </p>
                </div>

                {/* Dose section */}
                <div className="space-y-1">
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText size={12} className="text-blue-600" />
                    Dosis & Aturan Pakai:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100/60">
                    {selectedMedicine.dose || 'Hubungi apoteker kami untuk anjuran pemakaian yang tepat.'}
                  </p>
                </div>

                {/* Notice based on Drugs classification */}
                <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100 flex gap-2.5">
                  <Clock className="text-blue-600 shrink-0 mt-0.5" size={14} />
                  <div className="text-[11px] text-blue-900 leading-relaxed">
                    <p className="font-extrabold mb-0.5">Panduan BPOM: {getClassificationStyles(selectedMedicine.category).symbol}</p>
                    <p className="text-slate-500 font-medium">{getClassificationStyles(selectedMedicine.category).description}</p>
                  </div>
                </div>
              </div>

              {/* Sticky Footer Triggers (Tappable touch size 44px) */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  id={`whatsapp-order-${selectedMedicine.id}`}
                  onClick={() => handleWhatsappOrder(selectedMedicine)}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98"
                >
                  <ShoppingBag size={15} />
                  Pesan & Konsultasi Obat
                </button>
                <button
                  id="close-overlay-btn"
                  onClick={() => setSelectedMedicine(null)}
                  className="w-full sm:w-auto py-3 px-5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-550 hover:bg-slate-50 transition-all cursor-pointer min-h-[44px] active:scale-98"
                >
                  Tutup Kembali
                </button>
              </div>

              {/* Informative update date footer bar */}
              <div className="bg-slate-100 px-4 py-2 text-[9px] text-slate-400 flex justify-between items-center select-none shrink-0 border-t border-slate-150">
                <span>Pelayanan • Assyifa Farma Cideng</span>
                <span>Update: {formatDate(selectedMedicine.updatedAt)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
