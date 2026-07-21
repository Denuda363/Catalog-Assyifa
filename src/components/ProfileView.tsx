import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Phone, Save, ShieldCheck, Undo2, Redo2 } from 'lucide-react';
import { CustomerData } from '../types';

export default function ProfileView() {
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    address: '',
    phone: ''
  });

  const [history, setHistory] = useState<CustomerData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('customerData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomer(parsed);
        setHistory([parsed]);
        setHistoryIndex(0);
      } catch (e) {
        // ignore
        setHistory([{ name: '', address: '', phone: '' }]);
        setHistoryIndex(0);
      }
    } else {
      setHistory([{ name: '', address: '', phone: '' }]);
      setHistoryIndex(0);
    }
  }, []);

  const handleUpdate = (field: keyof CustomerData, value: string) => {
    const newData = { ...customer, [field]: value };
    setCustomer(newData);
    
    // update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCustomer(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCustomer(history[nextIndex]);
    }
  };

  const handleSave = () => {
    localStorage.setItem('customerData', JSON.stringify(customer));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto pb-12">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 text-white shrink-0">
            <User size={24} className="sm:w-[32px] sm:h-[32px]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-display font-bold tracking-tight text-white">Profil Pelanggan</h1>
            <p className="text-blue-100 font-medium mt-0.5 sm:mt-1 text-xs sm:text-sm leading-snug">Lengkapi data untuk kemudahan saat pesanan</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                canUndo 
                  ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                canRedo 
                  ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 sm:space-y-6">
        <div>
          <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">Nama Lengkap</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
              <User size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400" />
            </div>
            <input 
              type="text" 
              value={customer.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-medium transition-all"
              placeholder="Contoh: Budi Santoso"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">Nomor WhatsApp</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
              <Phone size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400" />
            </div>
            <input 
              type="tel" 
              value={customer.phone}
              onChange={(e) => handleUpdate('phone', e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-medium transition-all"
              placeholder="Contoh: 08123456789"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">Alamat Lengkap</label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3.5 sm:pl-4 pointer-events-none">
              <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400" />
            </div>
            <textarea 
              value={customer.address}
              onChange={(e) => handleUpdate('address', e.target.value)}
              rows={3}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-medium resize-none transition-all"
              placeholder="Detail alamat pengiriman atau penjemputan..."
            />
          </div>
        </div>

        <div className="pt-2 sm:pt-4">
          <button
            onClick={handleSave}
            className="w-full py-3 sm:py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 text-sm sm:text-base"
          >
            {isSaved ? (
              <>
                <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                Tersimpan
              </>
            ) : (
              <>
                <Save size={18} className="sm:w-5 sm:h-5" />
                Simpan Profil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
