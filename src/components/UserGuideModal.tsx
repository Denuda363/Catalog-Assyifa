import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ShoppingCart, 
  PhoneCall, 
  Gift, 
  Download, 
  HelpCircle, 
  CheckCircle2, 
  Pill, 
  FileText, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber
}) => {
  const [activeCategory, setActiveCategory] = useState<'search' | 'order' | 'prescription' | 'promo' | 'pwa' | 'faq'>('search');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'search', title: 'Cari Obat', icon: Search, badge: 'Langkah 1' },
    { id: 'order', title: 'Cara Order & Keranjang', icon: ShoppingCart, badge: 'Langkah 2' },
    { id: 'prescription', title: 'Resep Dokter', icon: FileText, badge: 'Konsultasi' },
    { id: 'promo', title: 'Promo & Diskon', icon: Gift, badge: 'Hemat' },
    { id: 'pwa', title: 'Pasang di HP (PWA)', icon: Download, badge: 'Aplikasi' },
    { id: 'faq', title: 'Tanya Jawab (FAQ)', icon: HelpCircle, badge: 'Bantuan' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HelpCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                  Panduan Penggunaan
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Umum & Pelanggan
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cara mudah mencari obat, konsultasi resep dokter, dan memesan di Apotek Assyifa Farma.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Panduan"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Pills Navigation */}
        <div className="px-4 py-2.5 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'} />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          
          {/* CATEGORY 1: CARI OBAT */}
          {activeCategory === 'search' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40 p-4 rounded-2xl flex items-start gap-3">
                <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                    Cara Cepat Menemukan Obat yang Anda Butuhkan
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Katalog Apotek Assyifa Farma memuat ratusan obat resmi yang dapat Anda telusuri berdasarkan nama dagang, keluhan penyakit, atau kandungan aktifnya.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Gunakan Kolom Pencarian</h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Buka tab <strong>Katalog</strong>, lalu ketik nama obat (misal: <em>Panadol, Amoxicillin</em>) atau zat aktifnya pada kolom pencarian di bagian atas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Filter Berdasarkan Kategori</h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pilih filter kategori seperti <strong>Obat Bebas, Obat Keras, Suplemen/Vitamin, Herbal,</strong> atau kategori lainnya untuk mempersempit daftar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Periksa Status Ketersediaan Stok</h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Setiap obat dilengkapi label status: <span className="text-emerald-600 font-bold">Tersedia</span> untuk stok yang siap diambil/dikirim, atau <span className="text-rose-500 font-bold">Kosong</span> jika sedang menunggu kiriman distributor.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Lihat Dosis & Aturan Minum</h5>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Klik kartu obat untuk melihat keterangan dosis penggunaan harian, indikasi keluhan, dan komposisi obat secara lengkap.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* CATEGORY 2: ORDER & KERANJANG */}
          {activeCategory === 'order' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 p-4 rounded-2xl flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                    Cara Memesan Obat Langsung Terhubung ke WhatsApp Apoteker
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Pesanan Anda dirangkum secara otomatis dan diteruskan langsung ke WhatsApp resmi Apotek Assyifa Farma agar langsung diproses tanpa antre.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Pilih Satuan Kemasan & Jumlah</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Anda bisa memilih satuan beli (misal: <em>Pcs, Tablet, Strip, atau Box</em>) dengan harga yang telah disesuaikan secara otomatis. Klik tombol <strong>+ Keranjang</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Buka Keranjang Belanja</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Klik ikon keranjang belanja di pojok kanan bawah layar Anda. Periksa kembali daftar obat, jumlah, dan total perkiraan biaya pembelian.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Lengkapi Data Pemesan & Pengiriman</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Isi nama lengkap, nomor WhatsApp aktif, alamat pengiriman, dan pilih opsi: <strong>Diambil di Apotek</strong> atau <strong>Dikirim ke Alamat Rumah</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-150 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Kirim Pesanan ke WhatsApp Apoteker</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Klik tombol <strong>Kirim Pesanan ke WhatsApp</strong>. Aplikasi akan membuka WhatsApp Anda dengan pesan pesanan rapi yang siap dikirim langsung ke nomor apotek.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CATEGORY 3: RESEP DOKTER */}
          {activeCategory === 'prescription' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 p-4 rounded-2xl flex items-start gap-3">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                    Layanan Konsultasi & Penebusan Resep Dokter
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Punya resep dokter dari rumah sakit, klinik, atau puskesmas? Anda tidak perlu repot mengetik satu per satu. Cukup foto resep dokter Anda dan kirimkan ke WhatsApp Apotek.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-3">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  Langkah Menebus Resep Dokter:
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li><strong>Foto Resep Secara Jelas:</strong> Pastikan tulisan dokter, nama pasien, tanggal resep, dan tanda tangan dokter terlihat terang dan terbaca.</li>
                  <li><strong>Klik Tombol Konsultasi Resep:</strong> Klik banner nomor WhatsApp di bagian atas website ini atau tombol hijau di bawah.</li>
                  <li><strong>Kirim Foto & Konfirmasi:</strong> Kirimkan foto resep ke apoteker kami. Apoteker kami akan segera memeriksa stok obat, menghitung total biaya, dan menyiapkan etiket pemakaian obat yang benar.</li>
                  <li><strong>Pengambilan / Pengantaran:</strong> Setelah obat selesai diracik atau disiapkan, Anda bisa mengambilnya langsung di apotek atau dikirim ke rumah Anda.</li>
                </ol>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=Halo%20Apotek%20Assyifa%20Farma,%20saya%20ingin%20berkonsultasi%20dan%20menebus%20resep%20dokter.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <PhoneCall size={14} />
                    Konsultasikan Resep Dokter via WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* CATEGORY 4: PROMO & DISKON */}
          {activeCategory === 'promo' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 p-4 rounded-2xl flex items-start gap-3">
                <Gift size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                    Program Promo Spesial & Bundling Hemat
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Dapatkan penawaran harga terbaik untuk obat-obatan rutin, vitamin daya tahan tubuh, dan produk perawatan kesehatan keluarga.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Diskon Langsung Produk Pilihan
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pada tab <strong>Promo</strong>, Anda akan menemukan produk dengan coretan harga diskon spesial. Diskon berlaku otomatis tanpa perlu memasukkan kode kupon.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Paket Bundling Hemat Keluarga
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Paket gabungan beberapa suplemen atau obat esensial dengan harga jauh lebih hemat dibanding membeli satuan. Cocok untuk persediaan obat di rumah.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* CATEGORY 5: INSTALASI PWA */}
          {activeCategory === 'pwa' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 p-4 rounded-2xl flex items-start gap-3">
                <Download size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                    Pasang Aplikasi di Layar Utama HP Anda (Tanpa Beban Memori)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Apotek Assyifa Farma menggunakan teknologi modern PWA (Progressive Web App). Anda dapat menginstalnya seperti aplikasi dari PlayStore/AppStore dengan ukuran sangat ringan dan akses instan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">Android / Chrome</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li>Klik tombol <strong>"Install Aplikasi"</strong> di kanan atas navigasi website.</li>
                    <li>Akan muncul jendela konfirmasi kecil dari Google Chrome.</li>
                    <li>Klik <strong>Install / Pasang</strong>. Ikon apotek akan muncul di beranda HP Anda.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">iPhone / Safari (iOS)</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li>Buka website ini menggunakan browser <strong>Safari</strong>.</li>
                    <li>Ketuk ikon <strong>Bagikan / Share</strong> (kotak panah ke atas di bawah layar).</li>
                    <li>Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).</li>
                    <li>Ketuk <strong>Add / Tambah</strong> di pojok kanan atas. Selesai!</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {/* CATEGORY 6: FAQ */}
          {activeCategory === 'faq' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  Apakah obat di Apotek Assyifa Farma 100% Asli dan Berizin?
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ya, semua produk obat-obatan, multivitamin, dan alat kesehatan kami dipasok langsung dari Pedagang Besar Farmasi (PBF) resmi dan terdaftar di BPOM Republik Indonesia.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  Bagaimana metode pembayaran yang tersedia?
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Kami melayani pembayaran tunai (cash) langsung di apotek, transfer bank antar-bank, serta pembayaran digital via QRIS (GoPay, OVO, ShopeePay, Dana, Mobile Banking).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  Apakah melayani pengantaran pesanan ke rumah (Delivery)?
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ya, kami melayani pengantaran untuk area sekitar Cideres, Kadipaten, dan sekitarnya. Silakan pilih opsi pengiriman saat memasukkan pesanan di keranjang atau konfirmasikan melalui chat WhatsApp.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  Apakah apoteker dapat membantu merekomendasikan obat yang tepat?
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tentu saja! Anda bisa menceritakan keluhan penyakit Anda ke nomor WhatsApp konsultasi kami. Apoteker kami yang berizin resmi akan memberikan rekomendasi obat yang aman dan tepat dosis.
                </p>
              </div>
            </motion.div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Layanan Kesehatan Resmi • Apotek Assyifa Farma Cideres</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PhoneCall size={13} />
              <span>Hubungi Apotek via WA</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
