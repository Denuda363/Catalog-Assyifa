import React from 'react';
import { motion } from 'motion/react';
import { Pill, Activity, Stethoscope, ArrowRight, ShieldCheck, Clock, Truck, Star } from 'lucide-react';
import { Medicine } from '../types';

interface HomeViewProps {
  onNavigate: (tab: 'catalog' | 'promo') => void;
  medicines: Medicine[];
}

export default function HomeView({ onNavigate, medicines }: HomeViewProps) {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-12 lg:p-16 shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Melayani 24 Jam
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6"
          >
            Kesehatan Anda <br className="hidden sm:block" />
            <span className="text-blue-200">Adalah Prioritas Kami</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-lg sm:text-xl font-medium mb-10 max-w-xl leading-relaxed"
          >
            Apotek Assyifa Farma Cideres siap melayani kebutuhan obat dan alat kesehatan Anda dengan cepat, akurat, dan terpercaya.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button 
              onClick={() => onNavigate('catalog')}
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-blue-900/20 flex items-center gap-2"
            >
              <Pill size={22} />
              Cari Obat
            </button>
            <button 
              onClick={() => onNavigate('promo')}
              className="bg-blue-500/30 hover:bg-blue-500/50 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center gap-2"
            >
              Lihat Promo <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats / Features Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <ShieldCheck size={28} />, title: "Produk Asli", desc: "100% dari distributor resmi", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { icon: <Clock size={28} />, title: "Respon Cepat", desc: "Langsung diproses", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { icon: <Stethoscope size={28} />, title: "Konsultasi", desc: "Apoteker profesional", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
          { icon: <Truck size={28} />, title: "Siap Kirim", desc: "Pengiriman aman", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4"
          >
            <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center`}>
              {feat.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{feat.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Popular Categories Placeholder */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Jelajahi Kategori</h2>
          <button 
            onClick={() => onNavigate('catalog')}
            className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-1 hover:underline"
          >
            Lihat Semua <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { name: "Obat Bebas", icon: <Pill size={24} />, count: medicines.filter(m => m.category === 'Bebas').length || 'Banyak' },
            { name: "Obat Keras", icon: <Activity size={24} />, count: medicines.filter(m => m.category === 'Keras').length || 'Banyak' },
            { name: "Alat Kesehatan", icon: <Stethoscope size={24} />, count: medicines.filter(m => m.category === 'Alat Kesehatan').length || 'Banyak' },
            { name: "Vitamin & Suplemen", icon: <Star size={24} />, count: medicines.filter(m => m.category === 'Vitamin').length || 'Banyak' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate('catalog')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer group hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col items-center text-center gap-3"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-slate-400 rounded-full flex items-center justify-center transition-colors">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{cat.name}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">{cat.count} Produk</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
