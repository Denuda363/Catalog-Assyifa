import React, { useState } from 'react';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Search, 
  FileSpreadsheet, 
  Key, 
  RefreshCw, 
  ShoppingCart, 
  Sliders, 
  PhoneCall, 
  Image, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

export const AdminUserGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'panduan' | 'troubleshooting'>('panduan');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'guide-import': true,
    'trouble-import': true,
    'trouble-update': true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allIds = [
      'guide-import', 'guide-meds', 'guide-promos', 'guide-orders', 'guide-branding', 'guide-security',
      'trouble-import', 'trouble-update', 'trouble-wa', 'trouble-pin', 'trouble-sync', 'trouble-image', 'trouble-restore'
    ];
    const nextState: Record<string, boolean> = {};
    allIds.forEach(id => nextState[id] = true);
    setExpandedSections(nextState);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden font-sans">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/20">
              <BookOpen size={12} />
              <span>DOKUMENTASI SISTEM & BUKU PETUNJUK RESMI</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Panduan Penggunaan Lengkap & Penanganan Kendala (Troubleshooting)
            </h3>
            <p className="text-xs text-blue-200/80 max-w-2xl leading-relaxed">
              Panduan operasional harian apotek, aturan cerdas import data obat, pengelolaan harga/stok, serta langkah-langkah solusi ketika terjadi kendala pada sistem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('panduan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'panduan'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-blue-200'
              }`}
            >
              <BookOpen size={14} />
              <span>Buku Panduan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('troubleshooting')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'troubleshooting'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-white/10 hover:bg-white/15 text-rose-200'
              }`}
            >
              <AlertTriangle size={14} />
              <span>Langkah Jika Ada Masalah</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Fast Controls */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-blue-300" />
            <input
              type="text"
              placeholder="Cari kata kunci (cth: impor, harga, pin, whatsapp)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder-blue-300/60 outline-none focus:bg-white/20 focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] self-end sm:self-center">
            <button 
              type="button" 
              onClick={expandAll}
              className="text-blue-200 hover:text-white underline cursor-pointer"
            >
              Buka Semua
            </button>
            <span className="text-white/30">•</span>
            <button 
              type="button" 
              onClick={collapseAll}
              className="text-blue-200 hover:text-white underline cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>
        </div>
      </div>

      {/* Guide Content Body */}
      <div className="p-5 sm:p-6 space-y-4">

        {/* TAB 1: PANDUAN PENGGUNAAN LENGKAP */}
        {activeTab === 'panduan' && (
          <div className="space-y-4">
            
            {/* Guide Section 1: Aturan Pintar Impor Data Excel */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('guide-import')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      1. Aturan Cerdas & Mekanisme Impor Data Obat (Excel)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Bagaimana sistem membedakan data baru, update harga/stok otomatis, dan pencegahan duplikasi.
                    </p>
                  </div>
                </div>
                {expandedSections['guide-import'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['guide-import'] && (
                <div className="p-5 bg-white space-y-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1.5">
                    <div className="font-extrabold text-emerald-800 text-xs flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-600" /> Aturan Eksekusi Impor Otomatis:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                      <li>
                        <strong>Jika Nama Obat BELUM ADA di sistem:</strong> Sistem akan langsung membuat data obat baru dan memasukkannya ke dalam katalog secara otomatis.
                      </li>
                      <li>
                        <strong>Jika Nama Obat SUDAH ADA di sistem & ada kolom yang diubah:</strong> (misalnya perubahan <em>Harga Medis, Harga MB, Harga Promo, Status Stok, Kategori, atau Kandungan</em>), sistem akan <strong>memperbarui (update) data obat tersebut di sistem</strong> sesuai isi Excel yang baru tanpa mengubah ID obat dan foto yang sudah tersimpan.
                      </li>
                      <li>
                        <strong>Jika Nama Obat SUDAH ADA & tidak ada perubahan kolom:</strong> Sistem akan <strong>melewatkan (skip)</strong> baris tersebut agar tidak terjadi data ganda (duplikat).
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                      Langkah Melakukan Impor Data Excel:
                    </h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                      <li>Buka tab <strong>Kelola Obat</strong> di panel Admin Room Control.</li>
                      <li>Klik tombol <strong>"Unduh Template Excel"</strong> untuk mendapatkan format kolom resmi Apotek Assyifa.</li>
                      <li>Buka berkas di Microsoft Excel, Google Sheets, atau WPS Office. Masukkan data obat Anda atau ubah harga pada baris obat yang sudah ada.</li>
                      <li>Simpan berkas dalam format <code>.xlsx</code>.</li>
                      <li>Klik <strong>"Pilih Berkas & Impor Massal"</strong> lalu pilih berkas yang telah Anda edit.</li>
                      <li>Jendela <strong>Pratinjau Impor</strong> akan muncul, menampilkan rekapitulasi data: berapa data baru yang akan ditambah, berapa data yang diperbarui perubahannya, dan berapa yang dilewati karena sama persis.</li>
                      <li>Klik <strong>"Konfirmasi & Eksekusi Impor"</strong> untuk menyimpan hasil ke database awan secara permanen.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Guide Section 2: Manajemen Multi-Harga & Satuan Obat */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('guide-meds')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      2. Pengelolaan Multi-Harga, Multi-Satuan & Stok Obat
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cara mengatur Harga Medis, Harga MB, Harga Khusus, serta konversi satuan (Strip, Box, dll).
                    </p>
                  </div>
                </div>
                {expandedSections['guide-meds'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['guide-meds'] && (
                <div className="p-5 bg-white space-y-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <p>
                    Apotek Assyifa Farma mendukung fleksibilitas penetapan harga untuk berbagai tingkatan konsumen dan konversi satuan kemasan:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <strong className="text-slate-800 block mb-1">Harga Medis (Harga Utama Katalog):</strong>
                      <span className="text-[11px] text-slate-500">
                        Harga standar yang tampil di katalog untuk umum dan menjadi dasar perhitungan keranjang belanja pelanggan.
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <strong className="text-slate-800 block mb-1">Harga MB, Khusus & HK OTC:</strong>
                      <span className="text-[11px] text-slate-500">
                        Harga acuan untuk kategori rekanan, member khusus, atau tender yang tersimpan aman di database admin.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <strong className="text-slate-800 block">Pengaturan Multi-Satuan (Konversi Kemasan):</strong>
                    <p className="text-slate-500 text-[11px]">
                      Anda bisa menambahkan satuan tambahan seperti <strong>Strip</strong> (pengali 10) atau <strong>Box</strong> (pengali 100). Saat pelanggan memilih satuan tersebut di katalog, harga akan dikalikan otomatis dengan pengali yang ditentukan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Guide Section 3: Kelola Promo & Bundling */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('guide-promos')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      3. Program Promosi, Diskon Persentase & Paket Bundling Hemat
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Membuat promo berjangka waktu otomatis, banner visual, dan paket bundling beberapa obat.
                    </p>
                  </div>
                </div>
                {expandedSections['guide-promos'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['guide-promos'] && (
                <div className="p-5 bg-white space-y-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <p>
                    Tab <strong>Kelola Promo</strong> memungkinkan admin membuat penawaran harga menarik:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                    <li><strong>Promo Diskon Tunggal:</strong> Kaitkan promo dengan 1 obat tertentu, tentukan diskon persen (misal 15%) atau harga promo khusus. Sistem otomatis menghitung harga coret.</li>
                    <li><strong>Paket Bundling:</strong> Gabungkan 2 atau lebih obat dalam satu paket hemat dengan satu harga bundling.</li>
                    <li><strong>Tanggal Mulai & Berakhir:</strong> Tentukan <em>Valid From</em> dan <em>Valid Until</em>. Promo akan aktif dan mati secara otomatis sesuai waktu setempat tanpa perlu admin menghapus manual.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Guide Section 4: Riwayat Order & Transaksi WhatsApp */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('guide-orders')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      4. Penerimaan Pesanan Pelanggan & Riwayat Order WhatsApp
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cara memantau pesanan masuk, pencarian data pembeli, dan pembersihan otomatis riwayat lama.
                    </p>
                  </div>
                </div>
                {expandedSections['guide-orders'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['guide-orders'] && (
                <div className="p-5 bg-white space-y-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <p>
                    Setiap kali pelanggan melakukan checkout di website apotek:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Pesan terstruktur dikirimkan langsung ke nomor WhatsApp resmi apotek.</li>
                    <li>Data order (nama, nomor telepon, alamat, rincian barang, total rupiah) otomatis tersimpan di tab <strong>Riwayat Order</strong> admin.</li>
                    <li>Admin dapat mencari pelanggan via kolom pencarian berdasarkan nama, ID, atau nomor HP.</li>
                    <li>Fitur <strong>Hapus Otomatis Riwayat Order</strong> dapat diatur pada tab Aturan & PIN (opsi: 1 minggu, 2 minggu, 1 bulan, atau simpan selamanya) untuk menghemat ruang penyimpanan.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Guide Section 5: Branding, Logo & Tema */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('guide-branding')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Image size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      5. Kustomisasi Branding, Logo Resmi, Alamat & Tema Beranda
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Mengatur tampilan visual aplikasi agar sesuai dengan identitas resmi Apotek Assyifa Farma.
                    </p>
                  </div>
                </div>
                {expandedSections['guide-branding'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['guide-branding'] && (
                <div className="p-5 bg-white space-y-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                    <li><strong>Nomor WhatsApp Admin:</strong> Wajib diawali kode negara <code>62</code> tanpa spasi (misal: <code>6281234567890</code>). Nomor ini digunakan untuk link chat order seluruh pengunjung.</li>
                    <li><strong>Alamat Lengkap Apotek:</strong> Ditampilkan di bagian header dan footer aplikasi agar pelanggan mengetahui lokasi fisik apotek di Cideres.</li>
                    <li><strong>Upload Logo Apotek:</strong> Anda dapat mengunggah logo resmi (PNG/JPG) yang akan menggantikan inisial huruf standar.</li>
                    <li><strong>Tema Beranda & Rotasi:</strong> Tersedia pilihan 6 tema warna beranda (Biru Klasik, Samudra, Alam Hijau, Senja, Elegan, Ceria) serta opsi rotasi tema otomatis berkala.</li>
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: TROUBLESHOOTING / LANGKAH JIKA ADA KESALAHAN */}
        {activeTab === 'troubleshooting' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3">
              <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-rose-900 text-xs sm:text-sm">
                  Pusat Solusi Kendala & Pemecahan Masalah (Troubleshooting Guide)
                </h4>
                <p className="text-rose-700 text-xs mt-0.5 leading-relaxed">
                  Jika Anda menemukan kendala teknis saat mengimpor data, memperbarui harga, mengakses akun, atau menyinkronkan data, ikuti langkah-langkah penanganan berikut:
                </p>
              </div>
            </div>

            {/* Error 1: Gagal Import Excel */}
            <div className="border border-rose-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('trouble-import')}
                className="w-full px-5 py-4 bg-rose-50/50 hover:bg-rose-100/50 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Kendala 1: Baris Excel Ditolak / Gagal Validasi Saat Impor
                    </h4>
                    <p className="text-[11px] text-rose-600 font-semibold">
                      Penyebab: Kolom Nama Obat kosong, format harga tidak valid, atau header kolom berubah.
                    </p>
                  </div>
                </div>
                {expandedSections['trouble-import'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['trouble-import'] && (
                <div className="p-5 bg-white space-y-3.5 text-xs text-slate-700 leading-relaxed border-t border-rose-100">
                  <div className="space-y-1">
                    <strong className="text-slate-900 font-bold block">Langkah-Langkah Perbaikan:</strong>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                      <li>Buka tab <strong>Kelola Obat</strong> dan klik <strong>"Unduh Template Excel"</strong> untuk mengambil format kolom yang tepat.</li>
                      <li>Pastikan header baris pertama tidak diubah namanya (harus ada: <code>Nama Obat</code>, <code>Kategori</code>, <code>Harga Medis</code>, dsb).</li>
                      <li>Pastikan kolom <strong>Nama Obat</strong> tidak ada yang kosong atau hanya spasi.</li>
                      <li>Pastikan kolom <strong>Harga Medis</strong> / <strong>Harga</strong> berisi angka murni di atas 0. <em>Jangan mengetikkan huruf "Rp", titik, atau koma secara manual (misal ketik <code>15000</code>, bukan <code>Rp 15.000,-</code>).</em></li>
                      <li>Pastikan menyimpan file dengan format <code>.xlsx</code> (bukan .csv atau .txt).</li>
                      <li>Unggah kembali file tersebut ke sistem.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Error 2: Update Harga Massal */}
            <div className="border border-amber-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('trouble-update')}
                className="w-full px-5 py-4 bg-amber-50/50 hover:bg-amber-100/50 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Kendala 2: Ingin Memperbarui Harga atau Stok Obat yang Sudah Ada via Excel
                    </h4>
                    <p className="text-[11px] text-amber-700 font-semibold">
                      Bagaimana cara agar obat tidak menjadi dobel dan harga lama langsung tergantikan?
                    </p>
                  </div>
                </div>
                {expandedSections['trouble-update'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['trouble-update'] && (
                <div className="p-5 bg-white space-y-3.5 text-xs text-slate-700 leading-relaxed border-t border-amber-100">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="font-bold text-emerald-800 block mb-1">Kabar Baik: Fitur Deteksi Otomatis Telah Aktif!</span>
                    <p className="text-slate-600 text-xs">
                      Sistem Apotek Assyifa kini secara cerdas mendeteksi nama obat. Jika nama obat sama dengan yang ada di sistem, sistem akan memeriksa apakah ada kolom yang berubah (seperti harga atau status stok).
                    </p>
                  </div>

                  <strong className="text-slate-900 font-bold block">Langkah Melakukan Update Massal:</strong>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Buka file Excel Anda. Tuliskan <strong>Nama Obat</strong> yang sama persis dengan yang ada di aplikasi.</li>
                    <li>Ganti nilai pada kolom yang ingin diubah (contoh: ubah <code>Harga Medis</code> dari 10000 menjadi 12500, atau ubah <code>Status Stok</code> dari Kosong menjadi Tersedia).</li>
                    <li>Impor file Excel tersebut ke Room Control.</li>
                    <li>Pada kotak pratinjau, periksa label kuning <strong>"Data Diperbarui"</strong>. Sistem akan menampilkan rincian kolom yang berubah.</li>
                    <li>Klik <strong>Konfirmasi & Eksekusi Impor</strong>. Data di sistem akan langsung diperbarui seketika tanpa membuat duplikat obat baru!</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Error 3: WhatsApp Pesanan Tidak Merespon */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('trouble-wa')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Kendala 3: Pesanan WhatsApp Error / Nomor Dikatakan Tidak Terdaftar
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Penyebab: Format nomor WhatsApp apotek di pengaturan tidak memakai kode negara.
                    </p>
                  </div>
                </div>
                {expandedSections['trouble-wa'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['trouble-wa'] && (
                <div className="p-5 bg-white space-y-3.5 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                  <strong className="text-slate-900 font-bold block">Langkah Solusi:</strong>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Masuk ke Room Control admin ➔ Tab <strong>Aturan & PIN</strong>.</li>
                    <li>Cari bagian <strong>Nomor WhatsApp Admin</strong>.</li>
                    <li>Pastikan Anda menggunakan awalan kode negara <code>62</code> (bukan <code>08...</code> atau <code>+62...</code>). Contoh yang benar: <code>6281234567890</code>.</li>
                    <li>Pastikan tidak ada karakter spasi atau tanda strip di dalam nomor tersebut.</li>
                    <li>Klik tombol <strong>Perbarui Pengaturan</strong> di bawah.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Error 4: Lupa PIN */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('trouble-pin')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Kendala 4: Lupa PIN Masuk ke Admin Room Control
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Bagaimana cara masuk kembali jika salah atau lupa PIN admin?
                    </p>
                  </div>
                </div>
                {expandedSections['trouble-pin'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['trouble-pin'] && (
                <div className="p-5 bg-white space-y-3 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                  <strong className="text-slate-900 font-bold block">Langkah Penanganan:</strong>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>PIN default bawaan apotek adalah: <code className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">12345</code>. Coba masukkan angka ini terlebih dahulu.</li>
                    <li>Jika PIN sudah pernah diubah dan Anda lupa, gunakan <strong>Kunci Super Admin Darurat</strong> apotek: <code className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">151219</code>. PIN ini dapat membuka akses super darurat kapan saja.</li>
                    <li>Setelah berhasil masuk, segera buka tab <strong>Aturan & PIN</strong> dan buat PIN baru yang mudah diingat oleh penanggung jawab apotek.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Error 5: Sinkronisasi Data & Cache PWA */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('trouble-sync')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Kendala 5: Perubahan Data Belum Muncul di Perangkat Lain / HP Pelanggan
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Penyebab: Perangkat pelanggan masih menampilkan data dari cache offline browser.
                    </p>
                  </div>
                </div>
                {expandedSections['trouble-sync'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['trouble-sync'] && (
                <div className="p-5 bg-white space-y-3 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                  <p>
                    Aplikasi ini menggunakan sinkronisasi database awan real-time (Firebase Cloud Firestore). Jika perubahan harga atau stok belum terlihat di HP lain:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Tarik layar ke bawah atau tekan tombol <strong>Refresh / Muat Ulang</strong> di browser.</li>
                    <li>Jika menggunakan aplikasi terpasang di layar utama (PWA), geser tutup aplikasi dari daftar jendela aplikasi (Recent Apps) lalu buka kembali.</li>
                    <li>Sistem Service Worker akan mengunduh versi snapshot database terbaru secara otomatis.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Error 6: Cadangan & Pemulihan (Backup/Restore) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('trouble-restore')}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Database size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Kendala 6: Tidak Sengaja Menghapus Data / Pindah ke Perangkat Baru
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cara memulihkan database secara utuh menggunakan fitur Backup & Restore JSON.
                    </p>
                  </div>
                </div>
                {expandedSections['trouble-restore'] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedSections['trouble-restore'] && (
                <div className="p-5 bg-white space-y-3 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                  <p>
                    Untuk menjaga keamanan data apotek dalam jangka panjang:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>Rutin lakukan pencadangan dengan menekan tombol <strong>"Unduh File Cadangan"</strong> di tab Aturan & PIN (tersimpan file <code>.json</code> berisi semua obat, promo, dan aturan).</li>
                    <li>Jika suatu hari data terhapus, cukup klik <strong>"Unggah & Pulihkan JSON"</strong> dan pilih file cadangan Anda. Seluruh katalog akan kembali pulih 100% dalam 1 detik.</li>
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
