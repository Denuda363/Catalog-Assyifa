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

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

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
  const [selectedUnit, setSelectedUnit] = useState<string>(med.defaultUnit || med.baseUnit || 'Lembar');

  const selectedUnitObj = useMemo(() => {
    if (selectedUnit === (med.baseUnit || 'Lembar')) return { multiplier: 1 };
    return med.multiUnits?.find(u => u.name === selectedUnit) || { multiplier: 1 };
  }, [selectedUnit, med]);

  const multiplier = selectedUnitObj.multiplier;
  const customPrice = (selectedUnitObj as any).customPriceMedis !== undefined ? (selectedUnitObj as any).customPriceMedis : (selectedUnitObj as any).customPrice;

  const styles = getClassificationStyles(med.category);

  // Calculate pricing based on multiplier or customPrice
  const basePrice = customPrice !== undefined ? customPrice : (med.priceMedis || med.price) * multiplier;
  const hasPromo = !!(med.pricePromo || med.promoPrice);
  const promoPrice = hasPromo 
    ? (customPrice !== undefined ? customPrice : (med.pricePromo || med.promoPrice || 0) * multiplier) 
    : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: idx * 0.02 }}
      id={`medicine-card-${med.id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer shadow-sm"
      onClick={() => setSelectedMedicine(med)}
    >
      {/* Visual Category Header Band / Image Preview */}
      {med.image ? (
        <div className="h-28 sm:h-32 w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden border-b border-slate-100 dark:border-slate-800 shrink-0">
          <img 
            src={med.image} 
            alt={med.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute top-2 left-2 bg-slate-900/80 dark:bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">
            Foto Tersedia
          </div>
        </div>
      ) : (
        <div className="h-20 sm:h-24 w-full bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 p-2 shrink-0 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-colors">
          <Activity size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 group-hover:animate-pulse transition-colors" />
          <span className="text-[9px] font-semibold text-slate-400 tracking-wide mt-1.5 select-none">No Image</span>
        </div>
      )}

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-2">
            {/* Category Label */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wide border ${styles.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styles.dot}`}></span>
              {med.category}
            </span>
          </div>

          {/* Medicine Name */}
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-1.5">
            {med.name}
          </h3>

          {/* Active Ingredient / Composition */}
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mb-1.5">
            {med.activeIngredient || '-'}
          </p>

          {/* Indication Snapshot */}
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal line-clamp-2 leading-snug mb-3">
            {med.indication}
          </p>

          {/* Dynamic Satuan selector badge row if multi satuan is available */}
          {med.multiUnits && med.multiUnits.length > 0 && (() => {
            const defaultU = med.defaultUnit || med.baseUnit || 'Lembar';
            const allUnits = [med.baseUnit || 'Lembar', ...med.multiUnits.map(u => u.name)];
            // Order so default is first
            const orderedUnits = Array.from(new Set([defaultU, ...allUnits]));

            return (
              <div className="mt-2 pb-2 border-t border-slate-100/80 dark:border-slate-800 pt-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Pilih Satuan:</span>
                <div className="flex flex-wrap gap-1.5">
                  {orderedUnits.map((uName) => (
                    <button
                      key={uName}
                      type="button"
                      onClick={() => setSelectedUnit(uName)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedUnit === uName
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {uName}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Card Lower Deck (Price & Action) */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
        <div className="flex flex-col">
          {med.isPromo && promoPrice ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-through font-semibold">
                  {formatRupiah(basePrice)}
                </span>
                <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded select-none">
                  PROMO
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                {formatRupiah(promoPrice)}
              </div>
            </div>
          ) : (
            <div className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
              {formatRupiah(basePrice)}
            </div>
          )}
          {med.multiUnits && med.multiUnits.length > 0 && (
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">per {selectedUnit}</span>
          )}
        </div>

        <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-700 shadow-sm text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer">
          Detail <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

export default function CatalogView({ medicines, settings, selectedMedicine, setSelectedMedicine }: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortOption, setSortOption] = useState('name-asc');
  const [selectedModalUnit, setSelectedModalUnit] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number | 'all'>(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters or limits change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, sortOption, displayLimit]);

  useEffect(() => {
    if (selectedMedicine) {
      setSelectedModalUnit(selectedMedicine.defaultUnit || selectedMedicine.baseUnit || 'Lembar');
    } else {
      setSelectedModalUnit('');
    }
  }, [selectedMedicine]);

  const modalUnitInfo = useMemo(() => {
    if (!selectedMedicine) return { multiplier: 1 };
    if (selectedModalUnit === (selectedMedicine.baseUnit || 'Lembar')) return { multiplier: 1 };
    return selectedMedicine.multiUnits?.find(u => u.name === selectedModalUnit) || { multiplier: 1 };
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

    // Search by Name or Active Ingredient using debounced value
    if (debouncedSearchTerm.trim() !== '') {
      const query = debouncedSearchTerm.toLowerCase();
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
  }, [medicines, debouncedSearchTerm, selectedCategory, sortOption]);

  const totalPages = displayLimit === 'all' ? 1 : Math.ceil(filteredMedicines.length / displayLimit);
  const currentMedicines = displayLimit === 'all'
    ? filteredMedicines
    : filteredMedicines.slice((currentPage - 1) * displayLimit, currentPage * displayLimit);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Semua');
    setSortOption('name-asc');
    setCurrentPage(1);
  };

  const handleWhatsappOrder = (med: Medicine) => {
    const customP = (modalUnitInfo as any).customPriceMedis !== undefined ? (modalUnitInfo as any).customPriceMedis : (modalUnitInfo as any).customPrice;
    let finalPrice = 0;
    
    if (customP !== undefined) {
      finalPrice = customP;
    } else {
      const originalPrice = med.isPromo && med.promoPrice ? med.promoPrice : (med.priceMedis || med.price);
      finalPrice = originalPrice * modalUnitInfo.multiplier;
    }

    const chosenUnit = selectedModalUnit || med.baseUnit || 'Lembar';
    const chosenMultiplierText = modalUnitInfo.multiplier > 1 ? ` (Isi ${modalUnitInfo.multiplier} ${med.baseUnit || 'Lembar'})` : '';

    const text = `Halo Apotek Assyifa Farma Cideres, saya ingin menanyakan/memesan obat berikut:\n\n*Nama Obat:* ${med.name}\n*Kategori:* ${med.category}\n*Satuan Pesanan:* ${chosenUnit}${chosenMultiplierText}\n*Harga:* ${formatRupiah(finalPrice)}\n\nApakah stok masih ada? Terima kasih.`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Customizable Catalog greeting/welcome banner */}
      {settings.greetingCatalog && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 flex items-start sm:items-center gap-4 shadow-lg shadow-slate-900/10 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-10 -mr-10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-xl shrink-0 border border-white/10 relative z-10">
            <CheckCircle size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-sm sm:text-base text-slate-100 font-medium whitespace-pre-wrap leading-relaxed">{settings.greetingCatalog}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Header Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4 sm:space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* Search bar input with custom id */}
          <div className="relative flex-1 group">
            <span className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
              <Search size={22} />
            </span>
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Cari nama obat, kandungan aktif, atau khasiat..."
              className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm sm:text-base transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Quick sorting dropdown with custom id */}
          <div className="w-full md:w-64 relative group">
            <select
              id="catalog-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full py-3.5 sm:py-4 px-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm sm:text-base transition-all font-medium text-slate-700 dark:text-slate-300 cursor-pointer appearance-none shadow-sm"
            >
              <option value="name-asc">Urutkan: Nama (A - Z)</option>
              <option value="name-desc">Urutkan: Nama (Z - A)</option>
              <option value="price-asc">Urutkan: Harga Terendah</option>
              <option value="price-desc">Urutkan: Harga Tertinggi</option>
              <option value="updated-desc">Urutkan: Terakhir Diperbarui</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
              <ChevronRight size={18} className="rotate-90" />
            </span>
          </div>

          {/* Display limit dropdown */}
          <div className="w-full md:w-40 relative group">
            <select
              id="catalog-limit-select"
              value={displayLimit}
              onChange={(e) => {
                const val = e.target.value;
                setDisplayLimit(val === 'all' ? 'all' : parseInt(val));
              }}
              className="w-full py-3.5 sm:py-4 px-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm sm:text-base transition-all font-medium text-slate-700 dark:text-slate-300 cursor-pointer appearance-none shadow-sm"
            >
              <option value={20}>20 produk</option>
              <option value={30}>30 produk</option>
              <option value={40}>40 produk</option>
              <option value={50}>50 produk</option>
              <option value={100}>100 produk</option>
              <option value="all">Semua</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
              <ChevronRight size={18} className="rotate-90" />
            </span>
          </div>
        </div>

        {/* Filter Badges with horizontal scrolling on mobile and wrap on screen md */}
        <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Kategori Obat:</span>
          
          {/* Scrollable categories wrap */}
          <div className="flex overflow-x-auto pb-3 pt-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap gap-2.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-none snap-x select-none scroll-smooth">
            {categories.map((cat, idx) => (
              <button
                id={`cat-filter-btn-${idx}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 snap-start cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Stock Selection removed, keep Reset button if filters active */}
        {(searchTerm || selectedCategory !== 'Semua' || sortOption !== 'name-asc') && (
          <div className="flex justify-end pt-1">
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-extrabold transition-all hover:underline py-1.5 cursor-pointer bg-rose-50 px-3 rounded-full hover:bg-rose-100"
            >
              <RotateCcw size={14} />
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Matches Count Banner */}
      <div className="flex justify-between items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-2">
        <p>Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredMedicines.length}</span> produk terdaftar</p>
        {selectedCategory !== 'Semua' && (
          <p>Kategori: <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">{selectedCategory}</span></p>
        )}
      </div>

      {/* Catalog Grid */}
      {filteredMedicines.length > 0 ? (
        <div className="pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 mb-8 h-auto max-h-[80vh] overflow-y-auto overflow-x-hidden p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {currentMedicines.map((med, idx) => (
              <MedicineCard
                key={med.id}
                med={med}
                idx={idx}
                getClassificationStyles={getClassificationStyles}
                setSelectedMedicine={setSelectedMedicine}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Prev
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first, last, current, and surrounding pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1 text-slate-400 dark:text-slate-500">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">Tidak ada obat yang cocok dengan kueri filter Anda.</p>
          <button
            id="reset-search-btn"
            onClick={resetFilters}
            className="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200/50 dark:border-blue-800/50 cursor-pointer"
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
              className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden border-t sm:border border-slate-200 dark:border-slate-800 z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col relative"
              id="details-modal"
            >
              {/* Mobile Gesture Handle Indicator */}
              <div 
                onClick={() => setSelectedMedicine(null)} 
                className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden shadow-sm shrink-0 cursor-pointer hover:bg-slate-400 transition-colors"
                title="Tarik atau ketuk untuk menutup"
              />

              {/* Modal Header/Banner */}
              <div className="bg-slate-900 p-5 sm:p-6 text-white relative shrink-0">
                <button
                  id="close-details-btn"
                  onClick={() => setSelectedMedicine(null)}
                  className="absolute top-5 right-5 text-white/60 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer backdrop-blur-sm bg-white/5"
                >
                  <X size={20} />
                </button>
                <div className="space-y-1.5 pr-8">
                  {/* Category Pill inside Modal */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${getClassificationStyles(selectedMedicine.category).badge}`}>
                    {selectedMedicine.category}
                  </span>
                  <h3 className="font-extrabold text-xl sm:text-2xl leading-tight tracking-tight mt-1">{selectedMedicine.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Kandungan: <strong className="text-white font-bold">{selectedMedicine.activeIngredient || '-'}</strong>
                  </p>
                </div>
              </div>

              {/* Scrollable Container Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Large product image display inside detail modal */}
                {selectedMedicine.image && (
                  <div className="w-full h-48 sm:h-56 bg-slate-50 dark:bg-slate-950 overflow-hidden relative rounded-xl border border-slate-100 dark:border-slate-800 shrink-0 mb-2">
                    <img src={selectedMedicine.image} alt={selectedMedicine.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-3 right-3 bg-slate-900/70 dark:bg-black/70 text-white backdrop-blur-md text-[10px] px-2.5 py-1 rounded font-bold tracking-wider select-none shadow-sm">
                      Foto Asli
                    </div>
                  </div>
                )}

                {/* Price block */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1 shadow-sm">
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider mb-1.5">Harga ({selectedModalUnit})</span>
                    {(() => {
                      const customP = (modalUnitInfo as any).customPriceMedis !== undefined ? (modalUnitInfo as any).customPriceMedis : (modalUnitInfo as any).customPrice;
                      const hasPromo = selectedMedicine.isPromo && selectedMedicine.promoPrice;
                      if (customP !== undefined) {
                        return (
                          <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                            {formatRupiah(customP)}
                          </span>
                        );
                      }
                      
                      if (hasPromo) {
                        return (
                          <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                              {formatRupiah(selectedMedicine.promoPrice * modalUnitInfo.multiplier)}
                            </span>
                            <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500 line-through font-semibold">
                              {formatRupiah((selectedMedicine.priceMedis || selectedMedicine.price) * modalUnitInfo.multiplier)}
                            </span>
                            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded uppercase ml-auto">Promo Spesial</span>
                          </div>
                        );
                      }
                      
                      return (
                        <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                          {formatRupiah((selectedMedicine.priceMedis || selectedMedicine.price) * modalUnitInfo.multiplier)}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Modal Unit Selector */}
                {selectedMedicine.multiUnits && selectedMedicine.multiUnits.length > 0 && (() => {
                  const defaultU = selectedMedicine.defaultUnit || selectedMedicine.baseUnit || 'Lembar';
                  const baseU = selectedMedicine.baseUnit || 'Lembar';
                  const allUnits = [baseU, ...selectedMedicine.multiUnits.map(u => u.name)];
                  const orderedUnits = Array.from(new Set([defaultU, ...allUnits]));

                  return (
                    <div className="p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col gap-3">
                      <span className="text-xs sm:text-sm font-extrabold text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={16} /> Pilih Satuan Pembelian:
                      </span>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {orderedUnits.map((uName) => {
                          const isBase = uName === baseU;
                          const multiU = selectedMedicine.multiUnits?.find(u => u.name === uName);
                          return (
                            <button
                              key={uName}
                              type="button"
                              onClick={() => setSelectedModalUnit(uName)}
                              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black border transition-all cursor-pointer ${
                                selectedModalUnit === uName
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm'
                              }`}
                            >
                              {isBase ? uName : (
                                <>
                                  1 {uName} <span className="opacity-70 font-semibold ml-1">({multiU?.multiplier} x {baseU})</span>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Indication section */}
                <div className="space-y-2">
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-600 dark:text-blue-400" />
                    Indikasi / Khasiat:
                  </h4>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    {selectedMedicine.indication}
                  </p>
                </div>

                {/* Dose section */}
                <div className="space-y-2">
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                    Dosis & Aturan Pakai:
                  </h4>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    {selectedMedicine.dose || 'Hubungi apoteker kami untuk anjuran pemakaian yang tepat.'}
                  </p>
                </div>

                {/* Notice based on Drugs classification */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex gap-3 shadow-sm">
                  <Clock className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                    <p className="font-extrabold mb-1">Panduan BPOM: {getClassificationStyles(selectedMedicine.category).symbol}</p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{getClassificationStyles(selectedMedicine.category).description}</p>
                  </div>
                </div>
              </div>

              {/* Sticky Footer Triggers (Tappable touch size 44px) */}
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <button
                  id={`whatsapp-order-${selectedMedicine.id}`}
                  onClick={() => handleWhatsappOrder(selectedMedicine)}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 active:scale-[0.98]"
                >
                  <ShoppingBag size={18} />
                  Pesan & Konsultasi Obat
                </button>
                <button
                  id="close-overlay-btn"
                  onClick={() => setSelectedMedicine(null)}
                  className="w-full sm:w-auto py-3.5 px-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer min-h-[48px] active:scale-[0.98] shadow-sm"
                >
                  Tutup Kembali
                </button>
              </div>

              {/* Informative update date footer bar */}
              <div className="bg-slate-50 dark:bg-slate-950 px-5 py-2.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 flex justify-between items-center select-none shrink-0 border-t border-slate-100 dark:border-slate-800 font-medium">
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
