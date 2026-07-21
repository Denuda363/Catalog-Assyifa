import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Activity, Stethoscope, ArrowRight, ShieldCheck, Clock, Truck, Star, Sparkles, HeartPulse } from 'lucide-react';
import { Medicine, Settings } from '../types';

interface HomeViewProps {
  onNavigate: (tab: 'catalog' | 'promo') => void;
  medicines: Medicine[];
  settings?: Settings;
}

export default function HomeView({ onNavigate, medicines, settings }: HomeViewProps) {
  const defaultTheme = settings?.homeTheme || 'default';
  const [activeTheme, setActiveTheme] = useState(defaultTheme);

  useEffect(() => {
    if (!settings?.autoRotateTheme) {
      setActiveTheme(defaultTheme);
      return;
    }

    const themes: Array<'default' | 'ocean' | 'nature' | 'sunset' | 'elegant' | 'playful'> = ['default', 'ocean', 'nature', 'sunset', 'elegant', 'playful'];
    
    const intervalValue = settings.autoRotateInterval || 1;
    const isSeconds = settings.autoRotateUnit === 'seconds';
    const intervalMs = isSeconds ? intervalValue * 1000 : intervalValue * 60 * 1000;
    
    // Check if current active theme is in themes
    if (!themes.includes(activeTheme as any)) {
      setActiveTheme('default');
    }

    const intervalId = setInterval(() => {
      setActiveTheme(prev => {
        const currentIndex = themes.indexOf(prev as any);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [settings?.autoRotateTheme, settings?.autoRotateInterval, settings?.autoRotateUnit, defaultTheme]);

  // Define themes
  const themeStyles = {
    default: {
      bg: "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/20",
      accent1: "bg-white/10",
      accent2: "bg-blue-400/20",
      textHighlight: "text-blue-200",
      btnPrimary: "bg-white text-blue-700 hover:bg-blue-50 shadow-blue-900/20",
      btnSecondary: "bg-blue-500/20 hover:bg-blue-500/40 border-white/20 text-white",
      icon: <Stethoscope size={24} className="text-blue-200 mb-4" />
    },
    ocean: {
      bg: "bg-gradient-to-br from-cyan-600 to-teal-700 shadow-teal-900/20",
      accent1: "bg-white/10",
      accent2: "bg-cyan-400/20",
      textHighlight: "text-cyan-200",
      btnPrimary: "bg-white text-teal-700 hover:bg-teal-50 shadow-teal-900/20",
      btnSecondary: "bg-teal-500/20 hover:bg-teal-500/40 border-white/20 text-white",
      icon: <Activity size={24} className="text-cyan-200 mb-4" />
    },
    nature: {
      bg: "bg-gradient-to-br from-emerald-600 to-green-700 shadow-green-900/20",
      accent1: "bg-white/10",
      accent2: "bg-emerald-400/20",
      textHighlight: "text-emerald-200",
      btnPrimary: "bg-white text-green-700 hover:bg-green-50 shadow-green-900/20",
      btnSecondary: "bg-green-500/20 hover:bg-green-500/40 border-white/20 text-white",
      icon: <Star size={24} className="text-emerald-200 mb-4" />
    },
    sunset: {
      bg: "bg-gradient-to-br from-orange-500 to-rose-600 shadow-rose-900/20",
      accent1: "bg-white/10",
      accent2: "bg-orange-400/20",
      textHighlight: "text-orange-200",
      btnPrimary: "bg-white text-rose-700 hover:bg-rose-50 shadow-rose-900/20",
      btnSecondary: "bg-rose-500/20 hover:bg-rose-500/40 border-white/20 text-white",
      icon: <HeartPulse size={24} className="text-orange-200 mb-4" />
    },
    elegant: {
      bg: "bg-gradient-to-br from-slate-800 to-slate-950 shadow-slate-900/40 border border-slate-700",
      accent1: "bg-white/5",
      accent2: "bg-slate-700/30",
      textHighlight: "text-slate-300",
      btnPrimary: "bg-white text-slate-900 hover:bg-slate-200 shadow-black/20",
      btnSecondary: "bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-white",
      icon: <Sparkles size={24} className="text-slate-300 mb-4" />
    },
    playful: {
      bg: "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-pink-900/20",
      accent1: "bg-white/20",
      accent2: "bg-white/10",
      textHighlight: "text-pink-100",
      btnPrimary: "bg-white text-fuchsia-700 hover:bg-fuchsia-50 shadow-pink-900/20",
      btnSecondary: "bg-white/20 hover:bg-white/30 border-white/30 text-white",
      icon: <Star size={24} className="text-pink-100 mb-4" />
    }
  };

  const currentTheme = themeStyles[activeTheme as keyof typeof themeStyles] || themeStyles.default;

  return (
    <div className="space-y-8 sm:space-y-12 pb-12">
      {/* Hero Section */}
      <section className={`relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] ${currentTheme.bg} p-6 sm:p-12 lg:p-16 shadow-2xl transition-colors duration-700`}>
        <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 ${currentTheme.accent1} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}></div>
        <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 ${currentTheme.accent2} rounded-full blur-2xl pointer-events-none transition-colors duration-700`}></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-12 h-12 rounded-full ${currentTheme.accent1} backdrop-blur-3xl`}
              initial={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0
              }}
              animate={{
                x: Math.random() * 600 - 300,
                y: Math.random() * 600 - 300,
                scale: Math.random() * 1 + 0.5,
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            {currentTheme.icon}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-[1.1] mb-3 sm:mb-6"
          >
            Kesehatan Anda <br className="hidden sm:block" />
            <span className={`${currentTheme.textHighlight} transition-colors duration-700`}>Adalah Prioritas Kami</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-sm sm:text-xl font-medium mb-6 sm:mb-10 max-w-xl leading-relaxed"
          >
            Apotek Assyifa Farma Cideres siap melayani kebutuhan obat dan alat kesehatan Anda dengan cepat, akurat, dan terpercaya.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
              onClick={() => onNavigate('catalog')}
              className={`${currentTheme.btnPrimary} px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold tracking-tight text-sm sm:text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2`}
            >
              <motion.div animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}>
                <Pill size={20} className="sm:w-[22px] sm:h-[22px]" />
              </motion.div>
              Cari Obat
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ y: { repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.2 } }}
              onClick={() => onNavigate('promo')}
              className={`${currentTheme.btnSecondary} backdrop-blur-md border px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold tracking-tight text-sm sm:text-lg transition-all active:scale-95 flex items-center justify-center gap-2 group`}
            >
              Lihat Promo 
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight size={18} className="sm:w-[20px] sm:h-[20px]" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats / Features Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Produk Asli", desc: "100% dari distributor resmi", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { icon: <Clock className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Respon Cepat", desc: "Langsung diproses", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { icon: <Stethoscope className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Konsultasi", desc: "Apoteker profesional", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
          { icon: <Truck className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Siap Kirim", desc: "Pengiriman aman", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" }
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 sm:gap-4"
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${feat.bg} ${feat.color} rounded-xl sm:rounded-2xl flex items-center justify-center`}>
              {feat.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base tracking-tight">{feat.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Popular Categories Placeholder */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-3xl font-display font-bold tracking-tight text-slate-800 dark:text-slate-100">Jelajahi Kategori</h2>
          <button 
            onClick={() => onNavigate('catalog')}
            className="text-blue-600 dark:text-blue-400 font-semibold tracking-tight text-xs sm:text-sm flex items-center gap-1 hover:underline"
          >
            Lihat Semua <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { name: "Obat Bebas", icon: <Pill className="w-5 h-5 sm:w-6 sm:h-6" />, count: medicines.filter(m => m.category === 'Bebas').length || 'Banyak' },
            { name: "Obat Keras", icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6" />, count: medicines.filter(m => m.category === 'Keras').length || 'Banyak' },
            { name: "Alat Kesehatan", icon: <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />, count: medicines.filter(m => m.category === 'Alat Kesehatan').length || 'Banyak' },
            { name: "Vitamin & Suplemen", icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, count: medicines.filter(m => m.category === 'Vitamin').length || 'Banyak' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate('catalog')}
              className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer group hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col items-center text-center gap-2 sm:gap-3"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-slate-400 rounded-full flex items-center justify-center transition-colors">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-display font-bold tracking-tight text-slate-800 dark:text-slate-100 text-sm sm:text-base">{cat.name}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 sm:mt-1">{cat.count} Produk</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
