/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Medicine, Promo, ActionLog, Settings, MultiUnit } from '../types';
import { formatRupiah } from '../utils';
import { 
  saveMedicine, 
  deleteMedicine, 
  savePromo, 
  deletePromo, 
  saveSettingsObj, 
  addLogObj, 
  replaceMedicinesList, 
  replacePromosList, 
  firebaseInitializeData, 
  subscribeLogs,
  resetAllDataToDefault
} from '../firebaseUtils';
import { 
  Lock, 
  ShieldAlert, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Settings2, 
  FileText, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  LogOut, 
  Eye, 
  EyeOff, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Hash,
  MapPin,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface RoomControlProps {
  medicines: Medicine[];
  promos: Promo[];
  settings: Settings;
  onDataChange: () => void;
}

export interface ImportPreviewData {
  type: 'excel' | 'json';
  successItems: any[];
  failedItems: {
    rowIndex: number | string;
    name?: string;
    reason: string;
  }[];
  originalDataLength: number;
  jsonDataToSave?: {
    medicines?: Medicine[];
    promos?: Promo[];
    settings?: Settings;
  };
  excelMedicinesToSave?: Medicine[];
}

// Hidden SUPER USER PIN
const SUPER_USER_PIN = '151219';

export default function RoomControl({ medicines, promos, settings, onDataChange }: RoomControlProps) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<ActionLog[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const unsub = subscribeLogs((logs) => {
        setCurrentLogs(logs);
      });
      return () => unsub();
    }
  }, [isAuthenticated]);
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Control tabs
  const [activeTab, setActiveTab] = useState<'medicines' | 'promos' | 'settings' | 'logs' | 'super'>('medicines');

  // Pagination and Search states
  const [medicinePage, setMedicinePage] = useState(1);
  const [promoPage, setPromoPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Search states
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');

  // Derived filtered medicines
  const filteredMedicines = useMemo(() => {
    if (!medicineSearchTerm.trim()) return medicines;
    const term = medicineSearchTerm.toLowerCase();
    return medicines.filter(med => 
      med.name.toLowerCase().includes(term) ||
      (med.activeIngredient && med.activeIngredient.toLowerCase().includes(term)) ||
      (med.category && med.category.toLowerCase().includes(term))
    );
  }, [medicines, medicineSearchTerm]);

  // Reset page when search term changes
  useEffect(() => {
    setMedicinePage(1);
  }, [medicineSearchTerm]);

  // Form states - Medicines
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    category: 'Obat Bebas',
    activeIngredient: '',
    price: 0,
    priceMb: 0,
    priceMedis: 0,
    pricePromo: 0,
    priceKhusus: 0,
    priceHkOtc: 0,
    image: '',
    indication: '',
    dose: '',
    isPromo: false,
    promoPrice: 0,
    baseUnit: 'Lembar',
    multiUnits: [] as { name: string; multiplier: number }[]
  });

  // Form states - Promos
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [searchBundlingQuery, setSearchBundlingQuery] = useState('');
  const [searchSpecificQuery, setSearchSpecificQuery] = useState('');
  const [promoForm, setPromoForm] = useState({
    title: '',
    description: '',
    medicineId: '',
    discountPercent: 0,
    validFrom: '',
    validUntil: '',
    isBundling: false,
    bundledMedicineIds: [] as string[],
    bundledItems: [] as { medicineId: string; isFree?: boolean; discountPercent?: number; customPrice?: number }[],
    bannerImageUrl: ''
  });

  // Settings form states
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [greetingCatalog, setGreetingCatalog] = useState(settings.greetingCatalog || '');
  const [greetingPromo, setGreetingPromo] = useState(settings.greetingPromo || '');
  const [pharmacyLogo, setPharmacyLogo] = useState(settings.pharmacyLogo || '');
  const [pharmacyAddress, setPharmacyAddress] = useState(settings.pharmacyAddress || '');
  
  const [bgType, setBgType] = useState<'color'|'image'|'pattern'>(settings.bgType as any || 'pattern');
  const [bgColor, setBgColor] = useState(settings.bgColor || '#f8fafc');
  const [bgPattern, setBgPattern] = useState<'dots'|'grid'|'crosses'|'none'>(settings.bgPattern as any || 'none');
  const [bgImageUrl, setBgImageUrl] = useState(settings.bgImageUrl || '');
  
  const [settingsStatus, setSettingsStatus] = useState({ success: false, message: '' });
  const [isResetting, setIsResetting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewData | null>(null);

  // Sync settings prop changes
  useEffect(() => {
    setWhatsappNumber(settings.whatsappNumber);
    setGreetingCatalog(settings.greetingCatalog || '');
    setGreetingPromo(settings.greetingPromo || '');
    setPharmacyLogo(settings.pharmacyLogo || '');
    setPharmacyAddress(settings.pharmacyAddress || '');
    if (settings.bgType) setBgType(settings.bgType as any);
    if (settings.bgColor) setBgColor(settings.bgColor);
    if (settings.bgPattern) setBgPattern(settings.bgPattern as any);
    if (settings.bgImageUrl) setBgImageUrl(settings.bgImageUrl);
  }, [settings]);

  // JSON Import state
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState({ success: false, message: '' });

  // PIN Keypad handlers
  const handleKeypadPress = (val: string) => {
    setLoginError('');
    if (pinInput.length < 10) {
      setPinInput(pinInput + val);
    }
  };

  const clearKeypad = () => {
    setPinInput('');
    setLoginError('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (pinInput === SUPER_USER_PIN) {
      setIsAuthenticated(true);
      setIsSuperUser(true);
      addLogObj('Super User Login', 'Bypass PIN berhasil menggunakan Kredensial Super User.').catch(console.error);
      setPinInput('');
      setLoginError('');
    } else if (pinInput === settings.adminPin) {
      setIsAuthenticated(true);
      setIsSuperUser(false);
      addLogObj('Admin Login', 'Dashboard Room Control berhasil diakses menggunakan PIN standar.').catch(console.error);
      setPinInput('');
      setLoginError('');
    } else {
      setLoginError('PIN yang Anda masukkan salah. Silakan periksa kembali!');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    addLogObj(isSuperUser ? 'Super User Logout' : 'Admin Logout', 'Keluar dari Room Control.').catch(console.error);
    setIsAuthenticated(false);
    setIsSuperUser(false);
    clearKeypad();
    setActiveTab('medicines');
  };

  // Handle Base64 image compression to keep localStorage performance healthy
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 300;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setMedicineForm((prev) => ({ ...prev, image: compressedDataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Medicine Actions
  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineForm.name.trim()) return;

    // Default price to priceMedis (official/core price)
    const officialPrice = Number(medicineForm.priceMedis || medicineForm.price);
    const promoValue = medicineForm.isPromo ? Number(medicineForm.pricePromo) : undefined;

    if (isAddingMedicine) {
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name: medicineForm.name,
        category: medicineForm.category,
        activeIngredient: medicineForm.activeIngredient,
        price: officialPrice,
        priceMb: Number(medicineForm.priceMb) || undefined,
        priceMedis: Number(medicineForm.priceMedis) || officialPrice,
        pricePromo: promoValue,
        priceKhusus: Number(medicineForm.priceKhusus) || undefined,
        priceHkOtc: Number(medicineForm.priceHkOtc) || undefined,
        image: medicineForm.image || undefined,
        indication: medicineForm.indication,
        dose: medicineForm.dose,
        isPromo: medicineForm.isPromo,
        promoPrice: promoValue,
        updatedAt: new Date().toISOString(),
        baseUnit: medicineForm.baseUnit || 'Lembar',
        multiUnits: medicineForm.multiUnits.length > 0 ? medicineForm.multiUnits : undefined
      };

      await saveMedicine(newMed);
      await addLogObj('Tambah Obat', `Menambahkan obat baru dengan multi-harga: ${newMed.name}`);
      setIsAddingMedicine(false);
    } else if (editingMedicine) {
      const newMed: Medicine = {
        ...editingMedicine,
        name: medicineForm.name,
        category: medicineForm.category,
        activeIngredient: medicineForm.activeIngredient,
        price: officialPrice,
        priceMb: Number(medicineForm.priceMb) || undefined,
        priceMedis: Number(medicineForm.priceMedis) || officialPrice,
        pricePromo: promoValue,
        priceKhusus: Number(medicineForm.priceKhusus) || undefined,
        priceHkOtc: Number(medicineForm.priceHkOtc) || undefined,
        image: medicineForm.image || undefined,
        indication: medicineForm.indication,
        dose: medicineForm.dose,
        isPromo: medicineForm.isPromo,
        promoPrice: promoValue,
        updatedAt: new Date().toISOString(),
        baseUnit: medicineForm.baseUnit || 'Lembar',
        multiUnits: medicineForm.multiUnits.length > 0 ? medicineForm.multiUnits : undefined
      };

      await saveMedicine(newMed);
      await addLogObj('Ubah Obat', `Mengubah multi-harga/rincian obat: ${editingMedicine.name}`);
      setEditingMedicine(null);
    }

    // Reset Form
    resetMedicineForm();
  };

  const resetMedicineForm = () => {
    setMedicineForm({
      name: '',
      category: 'Obat Bebas',
      activeIngredient: '',
      price: 0,
      priceMb: 0,
      priceMedis: 0,
      pricePromo: 0,
      priceKhusus: 0,
      priceHkOtc: 0,
      image: '',
      indication: '',
      dose: '',
      isPromo: false,
      promoPrice: 0,
      baseUnit: 'Lembar',
      multiUnits: []
    });
  };

  const handleEditMedicineClick = (med: Medicine) => {
    setEditingMedicine(med);
    setIsAddingMedicine(false);
    setMedicineForm({
      name: med.name,
      category: med.category,
      activeIngredient: med.activeIngredient,
      price: med.price || 0,
      priceMb: med.priceMb || 0,
      priceMedis: med.priceMedis || med.price || 0,
      pricePromo: med.pricePromo || med.promoPrice || 0,
      priceKhusus: med.priceKhusus || 0,
      priceHkOtc: med.priceHkOtc || 0,
      image: med.image || '',
      indication: med.indication,
      dose: med.dose || '',
      isPromo: med.isPromo,
      promoPrice: med.promoPrice || med.pricePromo || 0,
      baseUnit: med.baseUnit || 'Lembar',
      multiUnits: med.multiUnits || []
    });
  };

  const handleDeleteMedicine = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteMedicine(id);
      await addLogObj('Hapus Obat', `Menghapus obat dari sistem: ${name}`);
    }
  };

  // Promo Actions
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.title.trim()) return;

    if (isAddingPromo) {
      const newPromo: Promo = {
        id: `promo-${Date.now()}`,
        title: promoForm.title,
        description: promoForm.description,
        medicineId: promoForm.medicineId || undefined,
        discountPercent: promoForm.discountPercent ? Number(promoForm.discountPercent) : undefined,
        validFrom: promoForm.validFrom || undefined,
        validUntil: promoForm.validUntil,
        isBundling: promoForm.isBundling,
        bundledMedicineIds: promoForm.isBundling ? promoForm.bundledMedicineIds : [],
        bundledItems: promoForm.isBundling ? promoForm.bundledItems : undefined,
        bannerImageUrl: promoForm.bannerImageUrl || undefined
      };

      await savePromo(newPromo);

      // Sync linked medicine's promo condition automatically (if not bundle)
      if (!newPromo.isBundling && newPromo.medicineId) {
        const med = medicines.find(m => m.id === newPromo.medicineId);
        if (med) {
            await saveMedicine({
                ...med,
                isPromo: true,
                promoPrice: Math.round(med.price * (1 - (newPromo.discountPercent || 0) / 100))
            });
        }
      }

      await addLogObj('Tambah Promo', `Menambahkan brosur promo baru: ${newPromo.title}`);
      setIsAddingPromo(false);
    } else if (editingPromo) {
      const updatedPromo: Promo = {
        ...editingPromo,
        title: promoForm.title,
        description: promoForm.description,
        medicineId: promoForm.medicineId || undefined,
        discountPercent: promoForm.discountPercent ? Number(promoForm.discountPercent) : undefined,
        validFrom: promoForm.validFrom || undefined,
        validUntil: promoForm.validUntil,
        isBundling: promoForm.isBundling,
        bundledMedicineIds: promoForm.isBundling ? promoForm.bundledMedicineIds : [],
        bundledItems: promoForm.isBundling ? promoForm.bundledItems : undefined,
        bannerImageUrl: promoForm.bannerImageUrl || undefined
      };

      await savePromo(updatedPromo);
      await addLogObj('Ubah Promo', `Mengubah rincian brosur promo: ${editingPromo.title}`);
      setEditingPromo(null);
    }

    resetPromoForm();
  };

  const resetPromoForm = () => {
    setSearchBundlingQuery('');
    setSearchSpecificQuery('');
    setPromoForm({
      title: '',
      description: '',
      medicineId: '',
      discountPercent: 0,
      validFrom: '',
      validUntil: '',
      isBundling: false,
      bundledMedicineIds: [],
      bundledItems: [],
      bannerImageUrl: ''
    });
  };

  const handleEditPromoClick = (p: Promo) => {
    setEditingPromo(p);
    setIsAddingPromo(false);
    setSearchBundlingQuery('');
    setSearchSpecificQuery('');
    setPromoForm({
      title: p.title,
      description: p.description,
      medicineId: p.medicineId || '',
      discountPercent: p.discountPercent || 0,
      validFrom: p.validFrom || '',
      validUntil: p.validUntil,
      isBundling: !!p.isBundling,
      bundledMedicineIds: p.bundledMedicineIds || [],
      bundledItems: p.bundledItems || [],
      bannerImageUrl: p.bannerImageUrl || ''
    });
  };

  const handleDeletePromo = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus brosur promo "${title}"?`)) {
      const targetPromo = promos.find((p) => p.id === id);
      await deletePromo(id);

      // Re-evaluate linked medicine
      if (targetPromo && targetPromo.medicineId) {
        const med = medicines.find(m => m.id === targetPromo.medicineId);
        if (med) {
          await saveMedicine({
              ...med,
              isPromo: false,
              promoPrice: undefined
          });
        }
      }

      await addLogObj('Hapus Promo', `Menghapus brosur promo: ${title}`);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // limit 2MB
        alert('File logo terlalu besar! Maksimal ukuran berkas adalah 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPharmacyLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPharmacyLogo('');
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { // limit 800KB
        alert('File gambar latar belakang terlalu besar! Maksimal ukuran berkas adalah 800KB untuk memastikan kestabilan penyimpanan database.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBgImage = () => {
    setBgImageUrl('');
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus({ success: false, message: '' });

    if (newPin !== '') {
      if (newPin !== confirmNewPin) {
        setSettingsStatus({ success: false, message: 'Masukan PIN Baru tidak sama dengan Konfirmasi PIN!' });
        return;
      }
      if (newPin.length < 4 || isNaN(Number(newPin))) {
        setSettingsStatus({ success: false, message: 'PIN harus angka minimal 4 digit!' });
        return;
      }
      if (newPin === SUPER_USER_PIN) {
        setSettingsStatus({ success: false, message: 'PIN ini dirujuk untuk hak akses lain. Pilih PIN lain!' });
        return;
      }
    }

    const updatedSettings: Settings = {
      ...settings,
      adminPin: newPin !== '' ? newPin : settings.adminPin,
      whatsappNumber: whatsappNumber || settings.whatsappNumber,
      greetingCatalog: greetingCatalog,
      greetingPromo: greetingPromo,
      pharmacyLogo: pharmacyLogo,
      pharmacyAddress: pharmacyAddress,
      bgType: bgType,
      bgColor: bgColor,
      bgPattern: bgPattern,
      bgImageUrl: bgImageUrl
    };

    await saveSettingsObj(updatedSettings);
    await addLogObj('Ganti Aturan', 'Konfigurasi admin standar dan nomor order WA berhasil diperbarui.');
    setSettingsStatus({ success: true, message: 'Pengaturan berhasil disimpan!' });
    setNewPin('');
    setConfirmNewPin('');
  };

  // Excel Template Downloader
  const handleDownloadExcelTemplate = () => {
    try {
      const headers = [
        'Nama Obat',
        'Kategori',
        'Kandungan Aktif',
        'Satuan Dasar',
        'Status Stok',
        'Harga Medis',
        'Harga MB',
        'Harga Promo',
        'Harga Khusus',
        'Harga HK OTC',
        'Satuan Tambahan 1',
        'Pengali 1',
        'Satuan Tambahan 2',
        'Pengali 2',
        'Indikasi',
        'Dosis',
        'Apakah Promo (Ya/Tidak)'
      ];
      
      const sampleData = [
        {
          'Nama Obat': 'Sanmol Tablet 500mg',
          'Kategori': 'Obat Bebas',
          'Kandungan Aktif': 'Paracetamol 500mg',
          'Satuan Dasar': 'Tablet',
          'Status Stok': 'Tersedia',
          'Harga Medis': 5000,
          'Harga MB': 4800,
          'Harga Promo': 4500,
          'Harga Khusus': 4200,
          'Harga HK OTC': 4000,
          'Satuan Tambahan 1': 'Strip',
          'Pengali 1': 10,
          'Satuan Tambahan 2': 'Box',
          'Pengali 2': 100,
          'Indikasi': 'Meredakan demam dan sakit kepala ringan.',
          'Dosis': 'Dewasa: 1-2 tablet sekali minum, 3-4 kali sehari.',
          'Apakah Promo (Ya/Tidak)': 'Tidak'
        },
        {
          'Nama Obat': 'Amoxisan 500mg Kapsul',
          'Kategori': 'Obat Keras',
          'Kandungan Aktif': 'Amoxicillin 500mg',
          'Satuan Dasar': 'Kapsul',
          'Status Stok': 'Tersedia',
          'Harga Medis': 15000,
          'Harga MB': 14000,
          'Harga Promo': 13000,
          'Harga Khusus': 12500,
          'Harga HK OTC': 12000,
          'Satuan Tambahan 1': 'Strip',
          'Pengali 1': 10,
          'Satuan Tambahan 2': '',
          'Pengali 2': '',
          'Indikasi': 'Infeksi bakteri pada pernapasan, uro-genital, kulit, dll.',
          'Dosis': 'Sesuai petunjuk dokter. Umumnya 1 kapsul setiap 8 jam.',
          'Apakah Promo (Ya/Tidak)': 'Tidak'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Obat');
      
      XLSX.writeFile(wb, 'Template_Impor_Obat_Assyifa.xlsx');
      addLogObj('Unduh Template', 'Berhasil mengunduh template Excel impor obat.').catch(console.error);
    } catch (err: any) {
      alert('Gagal mengunduh template: ' + err.message);
    }
  };

  // Helper utility to parse clean numbers safely
  const parseCleanNumber = (val: any): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const cleanStr = String(val).replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? 0 : num;
  };

  // Excel Excel Uploader & Parser
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          alert('Berkas Excel kosong atau tidak terbaca dengan benar.');
          return;
        }

        const successItems: Medicine[] = [];
        const failedItems: any[] = [];

        jsonData.forEach((row: any, i: number) => {
          const rowIndex = i + 2; // Row 1 is header, index 0 is Row 2
          const name = row['Nama Obat'] || row['name'] || row['Nama'] || '';

          if (!name || !name.toString().trim()) {
            failedItems.push({
              rowIndex,
              name: 'Tidak teridentifikasi',
              reason: 'Kolom Nama Obat kosong (wajib diisi).'
            });
            return;
          }

          const category = row['Kategori'] || row['category'] || 'Obat Bebas';
          const activeIngredient = row['Kandungan Aktif'] || row['activeIngredient'] || '';
          const baseUnit = row['Satuan Dasar'] || row['baseUnit'] || 'Pcs';
          const stockStatusRaw = String(row['Status Stok'] || row['stockStatus'] || 'Tersedia').trim().toLowerCase();
          const stockStatus = stockStatusRaw === 'kosong' ? 'Kosong' : 'Tersedia';
          const priceMedis = parseCleanNumber(row['Harga Medis'] || row['priceMedis'] || row['Harga']);
          const priceMb = parseCleanNumber(row['Harga MB'] || row['priceMb']);
          const pricePromo = parseCleanNumber(row['Harga Promo'] || row['pricePromo']);
          const priceKhusus = parseCleanNumber(row['Harga Khusus'] || row['priceKhusus']);
          const priceHkOtc = parseCleanNumber(row['Harga HK OTC'] || row['priceHkOtc']);

          const originalPrice = priceMedis || priceMb || pricePromo || 0;

          if (originalPrice <= 0) {
            failedItems.push({
              rowIndex,
              name: name.toString().trim(),
              reason: 'Harga utama obat (Harga Medis/Harga Utama) tidak valid atau bernilai Rp 0.'
            });
            return;
          }

          const indication = row['Indikasi'] || row['indication'] || '';
          const dose = row['Dosis'] || row['dose'] || '';

          const rawPromo = String(row['Apakah Promo (Ya/Tidak)'] || row['isPromo'] || 'Tidak').trim().toLowerCase();
          const isPromo = (rawPromo === 'ya' || rawPromo === 'yes' || rawPromo === 'true' || rawPromo === '1');
          const promoPriceVal = isPromo ? (pricePromo || priceMedis) : 0;

          const multiUnits: MultiUnit[] = [];
          
          const u1Name = row['Satuan Tambahan 1'] || row['Unit 1'];
          const u1Mult = parseCleanNumber(row['Pengali 1'] || row['Multiplier 1']);
          if (u1Name && u1Mult > 0) {
            multiUnits.push({ name: u1Name.toString().trim(), multiplier: u1Mult });
          }

          const u2Name = row['Satuan Tambahan 2'] || row['Unit 2'];
          const u2Mult = parseCleanNumber(row['Pengali 2'] || row['Multiplier 2']);
          if (u2Name && u2Mult > 0) {
            multiUnits.push({ name: u2Name.toString().trim(), multiplier: u2Mult });
          }

          const newMed: Medicine = {
            id: 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: name.toString().trim(),
            category: category,
            activeIngredient: activeIngredient,
            price: originalPrice,
            priceMedis: priceMedis || originalPrice,
            priceMb: priceMb || originalPrice,
            pricePromo: pricePromo || promoPriceVal,
            priceKhusus: priceKhusus || originalPrice,
            priceHkOtc: priceHkOtc || originalPrice,
            baseUnit: baseUnit,
            multiUnits: multiUnits.length > 0 ? multiUnits : undefined,
            stockStatus: stockStatus as 'Tersedia' | 'Kosong',
            indication: indication,
            dose: dose,
            isPromo: isPromo,
            promoPrice: isPromo ? promoPriceVal : undefined,
            updatedAt: new Date().toISOString()
          };

          successItems.push(newMed);
        });

        // Current medicines to extend
        const mergedMedicines = [...medicines, ...successItems];

        setImportPreview({
          type: 'excel',
          successItems,
          failedItems,
          originalDataLength: jsonData.length,
          excelMedicinesToSave: mergedMedicines
        });
      } catch (err: any) {
        console.error(err);
        alert('Gagal mengimpor file Excel: ' + err.message);
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; // clean input
  };

  const processJsonImportData = (parsed: any, source: 'file' | 'pasted') => {
    const successItems: any[] = [];
    const failedItems: any[] = [];

    if (!parsed || typeof parsed !== 'object') {
      failedItems.push({
        rowIndex: 'Global',
        name: 'File JSON',
        reason: 'Format data JSON salah. Konten harus berupa objek valid.'
      });
      setImportPreview({
        type: 'json',
        successItems: [],
        failedItems,
        originalDataLength: 1,
        jsonDataToSave: undefined
      });
      return;
    }

    const hasMedicines = 'medicines' in parsed;
    const hasPromos = 'promos' in parsed;
    const hasSettings = 'settings' in parsed;

    if (!hasMedicines) {
      failedItems.push({ rowIndex: 'Skema', name: 'medicines', reason: 'Kunci "medicines" (Katalog Obat) wajib disertakan.' });
    } else if (!Array.isArray(parsed.medicines)) {
      failedItems.push({ rowIndex: 'Skema', name: 'medicines', reason: 'Nilai dari kunci "medicines" harus berjenis daftar (Array).' });
    }

    if (!hasPromos) {
      failedItems.push({ rowIndex: 'Skema', name: 'promos', reason: 'Kunci "promos" (Data Program Promosi) wajib disertakan.' });
    } else if (!Array.isArray(parsed.promos)) {
      failedItems.push({ rowIndex: 'Skema', name: 'promos', reason: 'Nilai dari kunci "promos" harus berjenis daftar (Array).' });
    }

    if (!hasSettings) {
      failedItems.push({ rowIndex: 'Skema', name: 'settings', reason: 'Kunci "settings" (Pengaturan Apotek) wajib disertakan.' });
    } else if (typeof parsed.settings !== 'object') {
      failedItems.push({ rowIndex: 'Skema', name: 'settings', reason: 'Nilai dari "settings" harus berupa Objek.' });
    }

    if (failedItems.length > 0) {
      setImportPreview({
        type: 'json',
        successItems: [],
        failedItems,
        originalDataLength: 1,
        jsonDataToSave: undefined
      });
      return;
    }

    const validMedicines: Medicine[] = [];
    parsed.medicines.forEach((med: any, index: number) => {
      const idxStr = `Obat #${index + 1}`;
      if (!med || typeof med !== 'object') {
        failedItems.push({ rowIndex: idxStr, name: 'Format Salah', reason: 'Format item obat bukan merupakan objek valid.' });
        return;
      }
      if (!med.id) {
        failedItems.push({ rowIndex: idxStr, name: med.name || 'Tanpa Nama', reason: 'Kunci pengenal "id" obat wajib diisi.' });
        return;
      }
      if (!med.name || !med.name.toString().trim()) {
        failedItems.push({ rowIndex: idxStr, name: `ID: ${med.id}`, reason: 'Nama obat ("name") kosong.' });
        return;
      }
      const rawPrice = typeof med.price === 'number' ? med.price : 0;
      if (rawPrice <= 0) {
        failedItems.push({ rowIndex: idxStr, name: med.name, reason: 'Harga dasar obat ("price") harus bertipe angka positif lebih dari Rp 0.' });
        return;
      }

      validMedicines.push({
        id: med.id,
        name: med.name.toString().trim(),
        category: med.category || 'Obat Bebas',
        activeIngredient: med.activeIngredient || '',
        price: rawPrice,
        priceMedis: med.priceMedis || rawPrice,
        priceMb: med.priceMb || rawPrice,
        pricePromo: med.pricePromo || 0,
        priceKhusus: med.priceKhusus || rawPrice,
        priceHkOtc: med.priceHkOtc || rawPrice,
        indication: med.indication || '',
        dose: med.dose || '',
        isPromo: !!med.isPromo,
        promoPrice: med.promoPrice,
        image: med.image,
        stockStatus: med.stockStatus || 'Tersedia',
        baseUnit: med.baseUnit || '',
        multiUnits: med.multiUnits || [],
        updatedAt: med.updatedAt || new Date().toISOString()
      });
      successItems.push({ type: 'Katalog Obat', name: med.name, detail: med.category });
    });

    const validPromos: Promo[] = [];
    parsed.promos.forEach((promo: any, index: number) => {
      const idxStr = `Promo #${index + 1}`;
      if (!promo || typeof promo !== 'object') {
        failedItems.push({ rowIndex: idxStr, name: 'Format Salah', reason: 'Format item promo bukan merupakan objek terstruktur.' });
        return;
      }
      if (!promo.id) {
        failedItems.push({ rowIndex: idxStr, name: promo.title || 'Tanpa Judul', reason: 'Kolom pengenal "id" promo kosong.' });
        return;
      }
      if (!promo.title || !promo.title.toString().trim()) {
        failedItems.push({ rowIndex: idxStr, name: `ID: ${promo.id}`, reason: 'Judul promo ("title") kosong.' });
        return;
      }
      if (!promo.validUntil) {
        failedItems.push({ rowIndex: idxStr, name: promo.title, reason: 'Masa berlaku akhir ("validUntil") wajib dicantumkan.' });
        return;
      }

      validPromos.push({
        id: promo.id,
        title: promo.title.toString().trim(),
        description: promo.description || '',
        medicineId: promo.medicineId,
        discountPercent: promo.discountPercent,
        validFrom: promo.validFrom,
        validUntil: promo.validUntil,
        isBundling: !!promo.isBundling,
        bundledMedicineIds: promo.bundledMedicineIds || []
      });
      successItems.push({ type: 'Promosi', name: promo.title, detail: 'Diskon/Bundling' });
    });

    const validSettings: Settings = {
      adminPin: parsed.settings.adminPin || '12345',
      whatsappNumber: parsed.settings.whatsappNumber || '6281234567890',
      greetingCatalog: parsed.settings.greetingCatalog || '',
      greetingPromo: parsed.settings.greetingPromo || '',
      pharmacyLogo: parsed.settings.pharmacyLogo || '',
      pharmacyAddress: parsed.settings.pharmacyAddress || '',
      bgType: parsed.settings.bgType || 'pattern',
      bgColor: parsed.settings.bgColor || '',
      bgPattern: parsed.settings.bgPattern || '',
      bgImageUrl: parsed.settings.bgImageUrl || ''
    };
    successItems.push({ type: 'Pengaturan', name: 'Profil & Konfigurasi Apotek', detail: 'Settings' });

    setImportPreview({
      type: 'json',
      successItems,
      failedItems,
      originalDataLength: parsed.medicines.length + parsed.promos.length + 1,
      jsonDataToSave: {
        medicines: validMedicines,
        promos: validPromos,
        settings: validSettings
      }
    });
  };

  const confirmAndExecuteImport = async () => {
    if (!importPreview) return;

    try {
      if (importPreview.type === 'excel' && importPreview.excelMedicinesToSave) {
        await replaceMedicinesList(importPreview.excelMedicinesToSave);
        await addLogObj('Impor Excel', `Berhasil mengimpor ${importPreview.successItems.length} data obat baru dari berkas Excel.`);
        alert(`Berhasil mengimpor ${importPreview.successItems.length} data obat dari Excel!`);
        if (onDataChange) onDataChange();
      } else if (importPreview.type === 'json' && importPreview.jsonDataToSave) {
        const { medicines: mList, promos: pList, settings: sObj } = importPreview.jsonDataToSave;
        if (mList) await replaceMedicinesList(mList);
        if (pList) await replacePromosList(pList);
        if (sObj) await saveSettingsObj(sObj);

        setSettingsStatus({
          success: true,
          message: 'Aplikasi Berhasil Berbagi Hubungan! Basis data telah dipulihkan sepenuhnya dari cadangan JSON.'
        });
        setImportStatus({
          success: true,
          message: 'Impor data basis berhasil! Silakan refresh halaman.'
        });
        await addLogObj('Pulihkan JSON', `Restore database XML/JSON selesai (${mList?.length || 0} obat, ${pList?.length || 0} promo).`);
        alert('Pemulihan cadangan data berhasil disinkronisasi!');
        setImportJson('');
        if (onDataChange) onDataChange();
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengeksekusi impor data: ' + err.message);
    } finally {
      setImportPreview(null);
    }
  };

  // JSON Restore Handler from Settings/Aturan Tab
  const handleJsonFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        processJsonImportData(parsed, 'file');
      } catch {
        setSettingsStatus({
          success: false,
          message: 'Gagal mendaur ulang JSON. Periksa format pengetikan cadangan Anda.'
        });
        alert('Format berkas tidak valid atau rusak!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Super User Operations
  const handleExportData = () => {
    const data = {
      medicines: medicines,
      promos: promos,
      settings: settings,
      logs: currentLogs
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `backup_assyifa_farma_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLogObj('Super Ekspor', 'Seluruh data lokal berhasil diekspor menjadi berkas berkunci.').catch(console.error);
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus({ success: false, message: '' });

    try {
      const parsed = JSON.parse(importJson);
      processJsonImportData(parsed, 'pasted');
    } catch {
      setImportStatus({ success: false, message: 'Gagal mendaur ulang JSON. Periksa keaslian format berkas!' });
    }
  };

  const handleSistemReset = async () => {
    if (confirm('PERINGATAN! Anda akan mengembalikan semua data ke pengaturan awal pabrik. Tindakan ini akan menghapus semua obat/promo baru, kustomisasi tampilan, logo, serta seluruh berkas riwayat log. Lanjutkan?')) {
      try {
        setIsResetting(true);
        await resetAllDataToDefault();
        alert('Sistem berhasil di-reset sepenuhnya!');
      } catch (err) {
        console.error(err);
        alert('Gagal melakukan reset sistem. Silakan coba lagi.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleFullReset = async () => {
    if (confirm('PERINGATAN KERAS! Anda akan menghapus seluruh data kustomisasi, katalog obat, program promosi, logo, gaya warna latar, serta log aktivitas sistem untuk mengembalikannya ke pengaturan awal bawaan pabrik.\n\nTindakan ini bersifat permanen dan tidak dapat dibatalkan. Lanjutkan?')) {
      try {
        setIsResetting(true);
        await resetAllDataToDefault();
        alert('Seluruh data berhasil disetel ulang ke kondisi awal bawaan pabrik!');
      } catch (err) {
        console.error(err);
        alert('Gagal mereset data. Silakan coba lagi.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const renderPagination = (currentPage: number, totalItems: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 bg-white p-3 sm:px-4 sm:py-3 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-500 text-center">
          Halaman {currentPage} dari {totalPages} ({totalItems} total)
        </span>
        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
          >
            Sebelumnya
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {!isAuthenticated ? (
        /* Pin security Pad */
        <div className="p-6 md:p-10 max-w-md mx-auto text-center space-y-6 animate-fadeIn">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-150 border-blue-100">
            <Lock size={32} />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-extrabold text-xl text-slate-800 tracking-tight">KUNCI ROOM CONTROL</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Masukkan PIN Admin untuk mengatur harga eceran obat, status ketersediaan, dan promosi berkala.
            </p>
          </div>

          {/* Locked indicators */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="pin-visual-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="○ ○ ○ ○ ○"
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) {
                    setPinInput(val);
                    setLoginError('');
                  }
                }}
                className="w-full text-center tracking-widest font-black text-2xl py-3 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-105 outline-none rounded-xl bg-slate-50 text-slate-800"
              />
              <button
                id="toggle-pin-visibility"
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 bg-rose-50 py-2 border border-rose-100/30 rounded-lg flex items-center justify-center gap-1.5 font-bold">
                <AlertCircle size={14} />
                {loginError}
              </p>
            )}

            {/* Simulated Grid Keypad with IDs */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  id={`keypad-btn-${digit}`}
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg rounded-xl transition-all cursor-pointer select-none active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                id="keypad-btn-clear"
                type="button"
                onClick={clearKeypad}
                className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer select-none"
              >
                CLEAR
              </button>
              <button
                id="keypad-btn-0"
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg rounded-xl transition-all cursor-pointer select-none"
              >
                0
              </button>
              <button
                id="keypad-btn-ok"
                type="submit"
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer select-none active:scale-95 shadow-sm shadow-blue-600/10"
              >
                OK
              </button>
            </div>
            
          </form>
        </div>
      ) : (
        /* Authenticated Admin Dashboard and Controls */
        <div className="flex flex-col">
          {/* Header Dashboard Banner */}
          <div className="bg-slate-900 text-white p-5 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-xl flex items-center justify-center ${
                isSuperUser 
                  ? 'bg-purple-900 border border-purple-600 text-purple-300 animate-pulse' 
                  : 'bg-blue-950 text-blue-400 border border-blue-900'
              }`}>
                {isSuperUser ? <ShieldAlert size={20} /> : <Settings2 size={20} />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base tracking-tight">ASSYIFA CONTROL DASHBOARD</h2>
                  {isSuperUser ? (
                    <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-purple-400 animate-bounce">
                      SUPER USER
                    </span>
                  ) : (
                    <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium font-sans">Apotek Assyifa Farma Cideres • Hak Akses Manajemen Penuh</p>
              </div>
            </div>

            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 hover:text-white px-4 py-2 border border-slate-700 rounded-xl text-xs font-semibold hover:bg-rose-900 transition-all cursor-pointer"
            >
              <LogOut size={14} /> Keluar Sesi
            </button>
          </div>

          {/* TAB Navigation Bar */}
          <div className="bg-slate-50 border-b border-slate-100 flex overflow-x-auto scrollbar-none p-1.5 gap-1">
            <button
              id="admin-tab-medicines"
              onClick={() => { setActiveTab('medicines'); resetMedicineForm(); }}
              className={`px-4 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'medicines' 
                  ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg'
              }`}
            >
              <Database size={14} /> Kelola Obat
            </button>
            <button
              id="admin-tab-promos"
              onClick={() => { setActiveTab('promos'); resetPromoForm(); }}
              className={`px-4 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'promos' 
                  ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg'
              }`}
            >
              <Hash size={14} /> Kelola Promo
            </button>
            <button
              id="admin-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'settings' 
                  ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg shadow-sm' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg'
              }`}
            >
              <Settings2 size={14} /> Aturan & PIN
            </button>
            {isSuperUser && (
              <>
                <button
                  id="admin-tab-logs"
                  onClick={() => setActiveTab('logs')}
                  className={`px-4 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'logs'
                      ? 'border-blue-600 text-blue-700 font-bold bg-white rounded-t-lg shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg'
                  }`}
                >
                  <FileText size={14} /> Audit Log
                </button>
                <button
                  id="admin-tab-super"
                  onClick={() => setActiveTab('super')}
                  className={`px-4 py-3 font-semibold text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'super'
                      ? 'border-purple-600 text-purple-700 font-bold bg-white rounded-t-lg shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg'
                  }`}
                >
                  <ShieldAlert size={14} /> Super System
                </button>
              </>
            )}
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* MANAGE MEDICINES VIEW */}
            {activeTab === 'medicines' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">DATABASE APOTEK ASSYIFA ({medicines.length} Terdaftar)</h3>
                    <p className="text-xs text-slate-400">Tambahkan obat baru atau edit harga katalog obat secara langsung di bawah ini.</p>
                  </div>
                  {!isAddingMedicine && !editingMedicine && (
                    <button
                      id="add-medicine-btn"
                      onClick={() => { setIsAddingMedicine(true); resetMedicineForm(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/10"
                    >
                      <Plus size={14} /> Tambah Obat Baru
                    </button>
                  )}
                </div>

                {/* Excel Import & Template Panel */}
                {!isAddingMedicine && !editingMedicine && (
                  <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4.5 space-y-3 shadow-3xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-emerald-800 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5 font-sans">
                          <Database size={15} className="text-emerald-600 shrink-0" />
                          Unggah Massal Data Obat (Excel Spreadsheet)
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans max-w-2xl">
                          Sistem mendukung integrasi impor data masal. Silakan unduh template Excel resmi kami, isi data obat, dan unggah kembali di bawah ini untuk sinkronisasi otomatis.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="download-excel-template-btn"
                        onClick={handleDownloadExcelTemplate}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-colors shrink-0 shadow-xs active:scale-98"
                      >
                        <Download size={13} />
                        Unduh Template Excel
                      </button>
                    </div>

                    <div className="h-px bg-emerald-100/60 w-full"></div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-100 font-sans">
                      <div className="space-y-0.5 animate-fadeIn">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih File Excel Anda (.xlsx / .xls)</span>
                        <p className="text-[9px] text-emerald-600/80 font-normal">Sistem akan memvalidasi kolom dan mendaftarkan obat baru secara instan.</p>
                      </div>
                      
                      <div className="relative flex-1 md:max-w-xs">
                        <input
                          id="excel-file-picker"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleExcelImport}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-extrabold text-emerald-800 text-xs flex items-center justify-center gap-2 transition-colors">
                          <Upload size={14} className="text-emerald-600" />
                          Pilih Berkas & Impor Massal
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Adding / Editing Modal Form */}
                {(isAddingMedicine || editingMedicine) && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="my-auto w-full max-w-3xl">
                      <form onSubmit={handleSaveMedicine} className="bg-white rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
                          <h4 className="font-extrabold text-sm text-blue-800 uppercase tracking-widest flex items-center gap-2">
                            {isAddingMedicine ? 'Tambah Data Obat Baru' : `Ubah Data: ${editingMedicine?.name}`}
                          </h4>
                          <button
                            id="cancel-med-form"
                            type="button"
                            onClick={() => { setIsAddingMedicine(false); setEditingMedicine(null); }}
                            className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1.5 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Nama Merk Obat:</label>
                        <input
                          id="form-med-name"
                          type="text"
                          required
                          value={medicineForm.name}
                          onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                          placeholder="Contoh: Sanmol Syrup 60ml"
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Category selection */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kategori Obat / Golongan:</label>
                        <select
                          id="form-med-category"
                          value={medicineForm.category}
                          onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Obat Bebas">Obat Bebas</option>
                          <option value="Obat Bebas Terbatas">Obat Bebas Terbatas</option>
                          <option value="Obat Keras">Obat Keras</option>
                          <option value="Herbal & Suplemen">Herbal & Suplemen</option>
                          <option value="Alat Kesehatan">Alat Kesehatan</option>
                          <option value="Ibu & Anak">Ibu & Anak</option>
                        </select>
                      </div>

                      {/* Active Ingredient */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kandungan Aktif & Komposisi:</label>
                        <input
                          id="form-med-ingredient"
                          type="text"
                          value={medicineForm.activeIngredient}
                          onChange={(e) => setMedicineForm({...medicineForm, activeIngredient: e.target.value})}
                          placeholder="Contoh: Paracetamol 120mg / 5ml"
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Multi-Price Grid */}
                      <div className="space-y-1 bg-blue-50/20 p-3 rounded-lg border border-blue-100 md:col-span-2">
                        <span className="text-[11px] font-extrabold text-blue-800 uppercase block tracking-wider mb-2">KLASIFIKASI MULTI-HARGA PRODUK:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {/* Harga Medis */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Harga Medis (Katalog & Promo) *:</label>
                            <input
                              id="form-med-price-medis"
                              type="number"
                              required
                              value={medicineForm.priceMedis || medicineForm.price || ''}
                              onChange={(e) => setMedicineForm({...medicineForm, priceMedis: Number(e.target.value), price: Number(e.target.value)})}
                              placeholder="Contoh: 15000"
                              className="w-full px-2.5 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-[11px] focus:ring-1 focus:ring-blue-500 max-w-full font-medium"
                            />
                          </div>

                          {/* Harga MB */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Harga MB (Mitra Bisnis):</label>
                            <input
                              id="form-med-price-mb"
                              type="number"
                              value={medicineForm.priceMb || ''}
                              onChange={(e) => setMedicineForm({...medicineForm, priceMb: Number(e.target.value)})}
                              placeholder="Contoh: 14000"
                              className="w-full px-2.5 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-[11px] focus:ring-1 focus:ring-blue-500 max-w-full text-slate-700"
                            />
                          </div>

                          {/* Harga Khusus */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Harga Khusus:</label>
                            <input
                              id="form-med-price-khusus"
                              type="number"
                              value={medicineForm.priceKhusus || ''}
                              onChange={(e) => setMedicineForm({...medicineForm, priceKhusus: Number(e.target.value)})}
                              placeholder="Contoh: 13500"
                              className="w-full px-2.5 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-[11px] focus:ring-1 focus:ring-blue-500 max-w-full text-slate-700"
                            />
                          </div>

                          {/* Harga HK OTC */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Harga HK OTC:</label>
                            <input
                              id="form-med-price-hkotc"
                              type="number"
                              value={medicineForm.priceHkOtc || ''}
                              onChange={(e) => setMedicineForm({...medicineForm, priceHkOtc: Number(e.target.value)})}
                              placeholder="Contoh: 14500"
                              className="w-full px-2.5 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-[11px] focus:ring-1 focus:ring-blue-500 max-w-full text-slate-700"
                            />
                          </div>

                          {/* Harga Promo */}
                          {medicineForm.isPromo && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-rose-600 uppercase">Harga Promo (Di Promo Tab):</label>
                              <input
                                id="form-med-price-promo"
                                type="number"
                                required={medicineForm.isPromo}
                                value={medicineForm.pricePromo || medicineForm.promoPrice || ''}
                                onChange={(e) => setMedicineForm({...medicineForm, pricePromo: Number(e.target.value), promoPrice: Number(e.target.value)})}
                                placeholder="Contoh: 12500"
                                className="w-full px-2.5 py-1.5 bg-white text-slate-800 rounded-lg border border-rose-200 outline-none text-[11px] focus:ring-1 focus:ring-rose-500 max-w-full font-semibold text-rose-700 bg-rose-50/30"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Promo Checkbox */}
                      <div className="space-y-2 select-none md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {/* Promo Enable */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase block">Status Promosi Produk:</label>
                          <div className="flex gap-4 pt-1">
                            <label className="text-xs text-slate-600 inline-flex items-center gap-1.5 cursor-pointer font-medium">
                              <input
                                type="checkbox"
                                checked={medicineForm.isPromo}
                                onChange={(e) => setMedicineForm({...medicineForm, isPromo: e.target.checked})}
                                className="rounded border-slate-200 text-blue-655 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              Aktifkan Harga Promo di Tab Promo
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload Input */}
                      <div className="space-y-1 md:col-span-2 bg-white p-3 rounded-xl border border-dashed border-slate-200">
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Unggah Gambar Produk (Tampil di Katalog & Promo):</label>
                        <div className="flex items-center gap-4">
                          {medicineForm.image ? (
                            <div className="relative w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                              <img src={medicineForm.image} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setMedicineForm({ ...medicineForm, image: '' })}
                                className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full p-0.5 cursor-pointer shadow-sm transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-slate-55 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 text-[10px] text-center font-bold px-1 select-none">
                              Tidak Ada Gambar
                            </div>
                          )}
                          <div className="space-y-1 flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="block w-full text-xs text-slate-500
                                file:mr-3 file:py-1.5 file:px-3
                                file:rounded-lg file:border-0
                                file:text-[11px] file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 cursor-pointer"
                            />
                            <p className="text-[9px] text-slate-400">File foto yang diunggah dikompresi otomatis untuk efisiensi transfer data nirkabel.</p>
                          </div>
                        </div>
                      </div>

                      {/* Indication */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Indikasi Utama (Fungsi Obat):</label>
                        <textarea
                          id="form-med-indication"
                          rows={2}
                          value={medicineForm.indication}
                          onChange={(e) => setMedicineForm({...medicineForm, indication: e.target.value})}
                          placeholder="Contoh: Meredakan gejala masuk angin, flue, bersin-bersin dan melonggarkan paru-paru..."
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Dosage */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Dosis Dan Aturan Pakai:</label>
                        <textarea
                          id="form-med-dose"
                          rows={2}
                          value={medicineForm.dose}
                          onChange={(e) => setMedicineForm({...medicineForm, dose: e.target.value})}
                          placeholder="Dewasa: 1 sendok takar 3 kali sehari. Anak-anak: setengah sendok makan..."
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Multi Satuan & Konversi Harga */}
                      <div className="space-y-3 md:col-span-2 bg-indigo-50/20 p-4 rounded-xl border border-indigo-100 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/50 pb-2">
                          <div>
                            <span className="text-[11px] font-extrabold text-indigo-900 uppercase block tracking-wider">Multi Satuan & Konversi Harga Otomatis:</span>
                            <span className="text-[9.5px] text-slate-500 block leading-snug">
                              Tambahkan beberapa satuan alternatif. Harga tiap satuan akan terkonversi otomatis dari harga dasar dikali jumlah multiplier (e.g., 1 Box = 10 Lembar).
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Satuan Utama (Dasar) *:</label>
                            <input
                              type="text"
                              required
                              value={medicineForm.baseUnit || 'Lembar'}
                              onChange={(e) => setMedicineForm({...medicineForm, baseUnit: e.target.value})}
                              placeholder="Misal: Lembar, Strip, Tablet, Botol"
                              className="w-full px-2.5 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-[11px] focus:ring-1 focus:ring-indigo-500 font-bold"
                            />
                            <span className="text-[9px] text-slate-400 block">Unit terkecil/satuan eceran awal.</span>
                          </div>

                          <div className="sm:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Satuan Tambahan (Konversi Otomatis):</label>
                            
                            {/* Satuan list */}
                            {medicineForm.multiUnits && medicineForm.multiUnits.length > 0 ? (
                              <div className="space-y-2">
                                {medicineForm.multiUnits.map((u, oIdx) => (
                                  <div key={oIdx} className="flex flex-col gap-1.5 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-3xs">
                                    <div className="flex items-center gap-2">
                                      <div className="text-[11px] text-slate-600 font-medium">
                                        1
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Nama (e.g. Box)"
                                        value={u.name}
                                        onChange={(e) => {
                                          const updatedUnits = [...medicineForm.multiUnits];
                                          updatedUnits[oIdx].name = e.target.value;
                                          setMedicineForm({...medicineForm, multiUnits: updatedUnits});
                                        }}
                                        className="flex-1 min-w-0 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-800 rounded outline-none text-[10px] focus:ring-1 focus:ring-indigo-500 font-semibold"
                                        required
                                      />
                                      <div className="text-[11px] text-slate-500 font-medium">
                                        =
                                      </div>
                                      <input
                                        type="number"
                                        min={1}
                                        placeholder="Jumlah"
                                        value={u.multiplier || ''}
                                        onChange={(e) => {
                                          const updatedUnits = [...medicineForm.multiUnits];
                                          updatedUnits[oIdx].multiplier = Math.max(1, Number(e.target.value));
                                          setMedicineForm({...medicineForm, multiUnits: updatedUnits});
                                        }}
                                        className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 text-slate-800 rounded outline-none text-[10px] focus:ring-1 focus:ring-indigo-500 text-center font-bold"
                                        required
                                      />
                                      <div className="text-[11px] text-slate-600 font-bold select-none shrink-0">
                                        {medicineForm.baseUnit || 'Lembar'}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedUnits = medicineForm.multiUnits.filter((_, i) => i !== oIdx);
                                          setMedicineForm({...medicineForm, multiUnits: updatedUnits});
                                        }}
                                        className="p-1 text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-colors shrink-0"
                                        title="Hapus Satuan"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                    <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] rounded-md border border-emerald-100 flex justify-between items-center font-medium">
                                      <span>Konversi Harga Medis:</span>
                                      <span className="font-bold">{formatRupiah((medicineForm.priceMedis || medicineForm.price || 0) * (u.multiplier || 1))} / {u.name || 'Satuan'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 bg-white/60 rounded-lg border border-dashed border-indigo-100 text-[10.5px] text-slate-400 font-medium">
                                Belum ada satuan tambahan. Klik "Tambah Satuan" di bawah ini.
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setMedicineForm({
                                  ...medicineForm,
                                  multiUnits: [...(medicineForm.multiUnits || []), { name: '', multiplier: 10 }]
                                });
                              }}
                              className="inline-flex items-center gap-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded border border-indigo-200 shadow-3xs cursor-pointer transition-colors"
                            >
                              + Tambah Satuan Baru
                            </button>
                          </div>
                        </div>
                      </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 text-xs font-semibold shrink-0">
                          <button
                            id="cancel-med-form-btn-2"
                            type="button"
                            onClick={() => { setIsAddingMedicine(false); setEditingMedicine(null); }}
                            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shadow-sm"
                          >
                            Batal
                          </button>
                          <button
                            id="submit-med-form-btn"
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors"
                          >
                            {isAddingMedicine ? 'Tambahkan Ke Katalog' : 'Simpan Perubahan'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Medicine Search Bar */}
                <div className="relative w-full max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    id="medicine-search-input"
                    type="text"
                    placeholder="Cari obat berdasarkan nama, kandungan, atau kategori..."
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all text-slate-800 shadow-sm"
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                  />
                  {medicineSearchTerm && (
                    <button
                      id="clear-medicine-search-btn"
                      onClick={() => setMedicineSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Desktop Version */}
                <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-xs scrollbar-thin scrollbar-thumb-slate-200">
                  <table id="med-admin-table" className="w-full border-collapse text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100 sticky top-0 z-10 shadow-3xs">
                      <tr>
                        <th className="py-3 px-4">Nama Obat</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4 select-none">Multi-Harga Produk</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMedicines.slice((medicinePage - 1) * ITEMS_PER_PAGE, medicinePage * ITEMS_PER_PAGE).map((med) => (
                        <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-slate-800 text-xs">{med.name}</p>
                            {med.activeIngredient && (
                              <p className="text-[10px] text-slate-400 truncate max-w-sm">{med.activeIngredient}</p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                              <span className="bg-slate-100 text-slate-600 px-1 rounded font-medium">Satuan Utama: {med.baseUnit || 'Lembar'}</span>
                              {med.multiUnits && med.multiUnits.map((u, ui) => (
                                <span key={ui} className="bg-indigo-50 text-indigo-700 px-1 rounded font-bold">1 {u.name} = {u.multiplier} {med.baseUnit || 'Lembar'}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[10px]">
                            {med.category}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] max-w-xs font-mono">
                              <div className="flex justify-between items-center bg-blue-50/60 px-1.5 py-0.5 rounded border border-blue-100 text-blue-900">
                                <span className="font-sans font-extrabold text-[8px] uppercase tracking-wider mr-1.5 shrink-0">MEDIS:</span>
                                <span className="font-bold">{formatRupiah(med.priceMedis || med.price)}</span>
                              </div>
                              <div className="flex justify-between items-center bg-amber-50/60 px-1.5 py-0.5 rounded border border-amber-100 text-amber-900">
                                <span className="font-sans font-extrabold text-[8px] uppercase tracking-wider mr-1.5 shrink-0">MB:</span>
                                <span className="font-bold">{med.priceMb ? formatRupiah(med.priceMb) : '-'}</span>
                              </div>
                              <div className="flex justify-between items-center bg-indigo-50/60 px-1.5 py-0.5 rounded border border-indigo-100 text-indigo-900">
                                <span className="font-sans font-extrabold text-[8px] uppercase tracking-wider mr-1.5 shrink-0">KHUSUS:</span>
                                <span className="font-bold">{med.priceKhusus ? formatRupiah(med.priceKhusus) : '-'}</span>
                              </div>
                              <div className="flex justify-between items-center bg-violet-50/60 px-1.5 py-0.5 rounded border border-violet-100 text-violet-900">
                                <span className="font-sans font-extrabold text-[8px] uppercase tracking-wider mr-1.5 shrink-0">HK OTC:</span>
                                <span className="font-bold">{med.priceHkOtc ? formatRupiah(med.priceHkOtc) : '-'}</span>
                              </div>
                              {med.isPromo && (med.pricePromo || med.promoPrice) && (
                                <div className="flex justify-between items-center bg-rose-50 px-2 py-0.5 rounded text-rose-700 col-span-2 border border-rose-100">
                                  <span className="font-sans font-black text-[8px] uppercase tracking-wider mr-1.5 shrink-0">PROMO AKTIF:</span>
                                  <span className="font-extrabold">{formatRupiah(med.pricePromo || med.promoPrice || 0)}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                id={`edit-med-${med.id}`}
                                onClick={() => handleEditMedicineClick(med)}
                                className="p-1 px-2 border border-slate-200 text-blue-600 bg-white hover:bg-slate-50 rounded-md transition-all text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={11} /> Ubah
                              </button>
                              <button
                                id={`delete-med-${med.id}`}
                                onClick={() => handleDeleteMedicine(med.id, med.name)}
                                className="p-1 px-2 border border-slate-200 text-rose-600 bg-white hover:bg-slate-50 rounded-md transition-all text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={11} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Version Cards */}
                <div className="block md:hidden space-y-3.5 max-h-[550px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {filteredMedicines.slice((medicinePage - 1) * ITEMS_PER_PAGE, medicinePage * ITEMS_PER_PAGE).map((med) => (
                    <div key={med.id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{med.name}</h4>
                          {med.activeIngredient && (
                            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{med.activeIngredient}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1 text-[8px] sm:text-[9px]">
                            <span className="bg-slate-100 text-slate-600 px-1 rounded font-medium">Satuan Utama: {med.baseUnit || 'Lembar'}</span>
                            {med.multiUnits && med.multiUnits.map((u, ui) => (
                              <span key={ui} className="bg-indigo-50 text-indigo-700 px-1 rounded font-bold">1 {u.name} = {u.multiplier} {med.baseUnit || 'Lembar'}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          {med.category}
                        </span>
                      </div>

                      {/* Stock Status and Prices */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rincian Multi-Harga:</span>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200/80 text-slate-700">
                              <span className="font-extrabold text-[8px] text-slate-400 uppercase">MEDIS:</span>
                              <span className="font-bold">{formatRupiah(med.priceMedis || med.price)}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200/80 text-slate-700">
                              <span className="font-extrabold text-[8px] text-slate-400 uppercase">MB:</span>
                              <span className="font-bold">{med.priceMb ? formatRupiah(med.priceMb) : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200/80 text-slate-700">
                              <span className="font-extrabold text-[8px] text-slate-400 uppercase">KHUSUS:</span>
                              <span className="font-bold">{med.priceKhusus ? formatRupiah(med.priceKhusus) : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200/80 text-slate-700">
                              <span className="font-extrabold text-[8px] text-slate-400 uppercase">HK OTC:</span>
                              <span className="font-bold">{med.priceHkOtc ? formatRupiah(med.priceHkOtc) : '-'}</span>
                            </div>
                            {med.isPromo && (med.pricePromo || med.promoPrice) && (
                              <div className="flex items-center justify-between bg-rose-50 px-2 py-1.5 rounded col-span-2 border border-rose-100 text-rose-700">
                                <span className="font-black text-[8px] uppercase">PROMO AKTIF:</span>
                                <span className="font-extrabold">{formatRupiah(med.pricePromo || med.promoPrice || 0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons with high-quality tactile targets */}
                      <div className="pt-2 border-t border-slate-100 flex gap-2 w-full">
                        <button
                          id={`edit-med-mob-${med.id}`}
                          onClick={() => handleEditMedicineClick(med)}
                          className="flex-1 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 min-h-[40px] cursor-pointer"
                        >
                          <Edit2 size={12} /> Ubah
                        </button>
                        <button
                          id={`delete-med-mob-${med.id}`}
                          onClick={() => handleDeleteMedicine(med.id, med.name)}
                          className="flex-1 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 min-h-[40px] cursor-pointer"
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(medicinePage, filteredMedicines.length, setMedicinePage)}
              </div>
            )}

            {/* MANAGE PROMOS VIEW */}
            {activeTab === 'promos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">KELOLA BROSUR PROMOSI ({promos.length} Aktif)</h3>
                    <p className="text-xs text-slate-400">Atur pamflet penawaran, voucher, atau brosur kampanye diskon di halaman utama.</p>
                  </div>
                  {!isAddingPromo && !editingPromo && (
                    <button
                      id="add-promo-btn"
                      onClick={() => { setIsAddingPromo(true); resetPromoForm(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/10"
                    >
                      <Plus size={14} /> Atur Promo Baru
                    </button>
                  )}
                </div>

                {/* Promo Form */}
                {(isAddingPromo || editingPromo) && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="my-auto w-full max-w-3xl">
                      <form onSubmit={handleSavePromo} className="bg-white rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
                          <h4 className="font-extrabold text-sm text-blue-800 uppercase tracking-widest flex items-center gap-2">
                            {isAddingPromo ? 'Tambahkan Brosur Promo Baru' : `Ubah Brosur: ${editingPromo?.title}`}
                          </h4>
                          <button
                            id="cancel-promo-form"
                            type="button"
                            onClick={() => { setIsAddingPromo(false); setEditingPromo(null); }}
                            className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1.5 transition-colors cursor-pointer"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Judul Promo / Kampanye:</label>
                        <input
                          id="form-promo-title"
                          type="text"
                          required
                          value={promoForm.title}
                          onChange={(e) => setPromoForm({...promoForm, title: e.target.value})}
                          placeholder="Contoh: Gebyar Kemerdekaan Apotek Assyifa"
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Linked Medicine */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex justify-between">
                          <span>Hubungkan Obat Spesifik (Opsional):</span>
                          {promoForm.medicineId && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setPromoForm({...promoForm, medicineId: ''});
                                setSearchSpecificQuery('');
                              }}
                              className="text-[10px] text-rose-600 hover:underline font-extrabold cursor-pointer"
                            >
                              Batalkan Hubungan
                            </button>
                          )}
                        </label>
                        
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Cari obat untuk dihubungkan..."
                            value={searchSpecificQuery}
                            onChange={(e) => setSearchSpecificQuery(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400"
                          />
                          
                          <div className="max-h-24 overflow-y-auto border border-slate-100 rounded-lg p-1 px-2 bg-white divide-y divide-slate-50">
                            <label className="text-[11px] text-slate-500 flex items-center gap-1.5 py-1.5 cursor-pointer hover:bg-slate-50 select-none">
                              <input
                                type="radio"
                                name="specific_med"
                                checked={!promoForm.medicineId}
                                onChange={() => setPromoForm({...promoForm, medicineId: ''})}
                                className="text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="font-semibold text-slate-600">-- Tidak Terhubung Obat --</span>
                            </label>
                            
                            {(() => {
                              const filtered = medicines.filter(m => {
                                const q = searchSpecificQuery.toLowerCase();
                                return m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
                              });
                              
                              if (filtered.length === 0) {
                                return <p className="text-[10px] text-slate-400 py-2 text-center">Tidak ada obat yang cocok.</p>;
                              }
                              
                              return filtered.map(m => {
                                const isChecked = promoForm.medicineId === m.id;
                                return (
                                  <label 
                                    key={m.id} 
                                    className={`text-xs flex items-start gap-1.5 py-1.5 cursor-pointer ease-in-out transition-all select-none ${
                                      isChecked ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="specific_med"
                                      checked={isChecked}
                                      onChange={() => setPromoForm({...promoForm, medicineId: m.id})}
                                      className="text-blue-600 focus:ring-0 mt-0.5 cursor-pointer"
                                    />
                                    <div className="leading-tight">
                                      <p className="font-bold text-slate-700 text-[11px]">{m.name}</p>
                                      <p className="text-[9px] text-slate-450 text-slate-400 font-medium">{m.category} • {formatRupiah(m.priceMedis || m.price)}</p>
                                    </div>
                                  </label>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Discount Percent */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Persentase Diskon (%, Opsional):</label>
                        <input
                          id="form-promo-discount"
                          type="number"
                          value={promoForm.discountPercent || ''}
                          onChange={(e) => setPromoForm({...promoForm, discountPercent: Number(e.target.value)})}
                          placeholder="Ketik 10 untuk 10%"
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Valid Range dates */}
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Valid Dari Tanggal (Start Date):</label>
                        <input
                          id="form-promo-valid-from"
                          type="date"
                          required
                          value={promoForm.validFrom || ''}
                          onChange={(e) => setPromoForm({...promoForm, validFrom: e.target.value})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Valid Sampai Tanggal (End/Expiry Date):</label>
                        <input
                          id="form-promo-valid-until"
                          type="date"
                          required
                          value={promoForm.validUntil}
                          onChange={(e) => setPromoForm({...promoForm, validUntil: e.target.value})}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Bundling Toggle panel */}
                      <div className="space-y-1 md:col-span-2 bg-indigo-50/20 p-3 rounded-lg border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-indigo-805 text-indigo-800 uppercase block">Fitur Paket Bundling:</label>
                          <label className="text-xs text-slate-650 text-slate-600 inline-flex items-center gap-2 cursor-pointer mt-1 font-semibold select-none">
                            <input
                              type="checkbox"
                              checked={promoForm.isBundling}
                              onChange={(e) => setPromoForm({...promoForm, isBundling: e.target.checked})}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            Jadikan Sebagai Paket Bundling Produk lain
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1">Aktifkan untuk merangkai kombinasi produk khusus dengan diskon atau tawaran paket harga hemat.</p>
                        </div>

                        {promoForm.isBundling && (
                          <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                            <label className="text-[10px] font-bold text-indigo-700 uppercase block mb-1">Sertakan Produk Dalam Paket Bundling:</label>
                            
                            {/* Search Box for Bundled Products */}
                            <div className="mb-2">
                              <input
                                type="text"
                                placeholder="Cari obat berdasarkan nama / kategori..."
                                value={searchBundlingQuery}
                                onChange={(e) => setSearchBundlingQuery(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 text-slate-800 rounded-md border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                              />
                            </div>

                            <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-md p-2 space-y-1.5 divide-y divide-slate-50">
                              {(() => {
                                const filteredMeds = medicines.filter((m) => {
                                  const q = searchBundlingQuery.toLowerCase();
                                  return m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
                                });
                                if (filteredMeds.length === 0) {
                                  return (
                                    <p className="text-[10px] text-slate-400 text-center py-2">Tidak ada obat yang cocok.</p>
                                  );
                                }
                                return filteredMeds.map((m) => {
                                  const isChecked = promoForm.bundledMedicineIds.includes(m.id);
                                  const bundledItem = promoForm.bundledItems.find(item => item.medicineId === m.id) || { medicineId: m.id };

                                  return (
                                    <div key={m.id} className="pt-1.5 pb-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                      <label className="text-xs text-slate-700 flex items-start gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {
                                            if (isChecked) {
                                              setPromoForm({
                                                ...promoForm,
                                                bundledMedicineIds: promoForm.bundledMedicineIds.filter(id => id !== m.id),
                                                bundledItems: promoForm.bundledItems.filter(item => item.medicineId !== m.id)
                                              });
                                            } else {
                                              setPromoForm({
                                                ...promoForm,
                                                bundledMedicineIds: [...promoForm.bundledMedicineIds, m.id],
                                                bundledItems: [...promoForm.bundledItems, { medicineId: m.id }]
                                              });
                                            }
                                          }}
                                          className="rounded text-indigo-600 cursor-pointer border-slate-300 focus:ring-0 mt-0.5"
                                        />
                                        <div className="leading-tight">
                                          <p className="font-semibold text-[11px]">{m.name}</p>
                                          <p className="text-[9px] text-slate-400">{m.category} • Harga Normal: {formatRupiah(m.priceMedis || m.price)}</p>
                                        </div>
                                      </label>
                                      {isChecked && (
                                        <div className="ml-5 mt-1.5 pl-2 border-l-2 border-indigo-100 space-y-2">
                                          <label className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
                                            <input 
                                              type="checkbox" 
                                              checked={bundledItem.isFree || false}
                                              onChange={(e) => {
                                                const newItems = promoForm.bundledItems.map(item => 
                                                  item.medicineId === m.id ? { ...item, isFree: e.target.checked, customPrice: undefined, discountPercent: undefined } : item
                                                );
                                                setPromoForm({...promoForm, bundledItems: newItems});
                                              }}
                                              className="rounded text-indigo-500 cursor-pointer border-slate-300 focus:ring-0 w-3 h-3"
                                            />
                                            Gratis / Free
                                          </label>
                                          {!bundledItem.isFree && (
                                            <div className="flex gap-2 items-center">
                                              <input
                                                type="number"
                                                placeholder="Harga Custom"
                                                value={bundledItem.customPrice || ''}
                                                onChange={(e) => {
                                                  const newItems = promoForm.bundledItems.map(item => 
                                                    item.medicineId === m.id ? { ...item, customPrice: Number(e.target.value) || undefined, discountPercent: undefined } : item
                                                  );
                                                  setPromoForm({...promoForm, bundledItems: newItems});
                                                }}
                                                className="w-24 px-2 py-1 text-[10px] border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                              />
                                              <span className="text-[10px] text-slate-400">Atau</span>
                                              <input
                                                type="number"
                                                placeholder="Diskon %"
                                                value={bundledItem.discountPercent || ''}
                                                onChange={(e) => {
                                                  const newItems = promoForm.bundledItems.map(item => 
                                                    item.medicineId === m.id ? { ...item, discountPercent: Number(e.target.value) || undefined, customPrice: undefined } : item
                                                  );
                                                  setPromoForm({...promoForm, bundledItems: newItems});
                                                }}
                                                className="w-20 px-2 py-1 text-[10px] border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            <span className="text-[9px] text-indigo-500 font-medium block mt-1">Terpilih: {promoForm.bundledMedicineIds.length} Produk dalam paket.</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Keterangan / Kriteria Klaim:</label>
                        <textarea
                          id="form-promo-desc"
                          rows={3}
                          required
                          value={promoForm.description}
                          onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                          placeholder="Tulis ketentuan rinci, diskon berlaku setiap pembelian kaplet..."
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5 p-3 rounded-lg border border-slate-200 bg-slate-50 relative group flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Gambar Banner (Opsional):</label>
                        <input
                          id="promo-banner-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setPromoForm({...promoForm, bannerImageUrl: event.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {promoForm.bannerImageUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden shadow-sm relative">
                            <img src={promoForm.bannerImageUrl} alt="Banner Preview" className="w-full h-32 object-cover" />
                            <button
                              type="button"
                              onClick={() => setPromoForm({...promoForm, bannerImageUrl: ''})}
                              className="absolute top-2 right-2 bg-slate-900/60 text-white rounded-full p-1.5 hover:bg-slate-900/80 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 text-xs font-semibold shrink-0">
                          <button
                            id="cancel-promo-form-btn-2"
                            type="button"
                            onClick={() => { setIsAddingPromo(false); setEditingPromo(null); }}
                            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shadow-sm"
                          >
                            Batal
                          </button>
                          <button
                            id="submit-promo-form-btn"
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors"
                          >
                            {isAddingPromo ? 'Tambahkan Banner' : 'Simpan Brosur'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Promos table */}
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto max-h-[450px] overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-xs scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full border-collapse text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100 sticky top-0 z-10 shadow-3xs">
                      <tr>
                        <th className="py-3 px-4">Judul Promo</th>
                        <th className="py-3 px-4">Deskripsi</th>
                        <th className="py-3 px-4">Masa Berlaku</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {promos.slice((promoPage - 1) * ITEMS_PER_PAGE, promoPage * ITEMS_PER_PAGE).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {p.title}
                            {p.discountPercent && (
                              <span className="ml-2 bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-black">
                                DISKON {p.discountPercent}%
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {p.description}
                          </td>
                          <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                            <div className="flex flex-col text-[10px] leading-tight">
                              {p.validFrom && (
                                <span className="text-slate-400">Dari: <span className="font-semibold text-slate-600">{p.validFrom}</span></span>
                              )}
                              <span className="text-slate-700 font-bold">S/d: <span>{p.validUntil}</span></span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                id={`edit-promo-${p.id}`}
                                onClick={() => handleEditPromoClick(p)}
                                className="p-1 px-2 border border-slate-200 text-blue-600 bg-white hover:bg-slate-50 rounded-md transition-all text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={11} /> Ubah
                              </button>
                              <button
                                id={`delete-promo-${p.id}`}
                                onClick={() => handleDeletePromo(p.id, p.title)}
                                className="p-1 px-2 border border-slate-200 text-rose-600 bg-white hover:bg-rose-50 rounded-md transition-all text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={11} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view cards */}
                <div className="block md:hidden space-y-3.5 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {promos.slice((promoPage - 1) * ITEMS_PER_PAGE, promoPage * ITEMS_PER_PAGE).map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-3xs space-y-2.5">
                      <div className="flex justify-between items-start gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{p.title}</h4>
                        {p.discountPercent && (
                          <span className="bg-rose-100 text-rose-700 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-black border border-rose-200 uppercase select-none shrink-0">
                            DISKON {p.discountPercent}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-normal">{p.description}</p>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masa Berlaku:</span>
                        <div className="flex flex-col text-right text-[10px] leading-tight shrink-0">
                          {p.validFrom && (
                            <span className="text-slate-400 font-medium">Dari: <span className="font-extrabold text-slate-600">{p.validFrom}</span></span>
                          )}
                          <span className="text-slate-700 font-extrabold">S/d: <span className="text-blue-700">{p.validUntil}</span></span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex gap-2 w-full">
                        <button
                          id={`edit-promo-mob-${p.id}`}
                          onClick={() => handleEditPromoClick(p)}
                          className="flex-1 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 min-h-[40px] cursor-pointer"
                        >
                          <Edit2 size={12} /> Ubah
                        </button>
                        <button
                          id={`delete-promo-mob-${p.id}`}
                          onClick={() => handleDeletePromo(p.id, p.title)}
                          className="flex-1 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 min-h-[40px] cursor-pointer"
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(promoPage, promos.length, setPromoPage)}
              </div>
            )}

            {/* SYSTEM SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <div className="max-w-xl space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">PENGATURAN UMUM / PIN</h3>
                  <p className="text-xs text-slate-400">Atur nomor order WhatsApp apotek dan ganti PIN keamanan Room Control di bawah ini.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
                  {settingsStatus.message && (
                    <p className={`p-3 text-xs rounded-xl font-bold flex items-center gap-2 border ${
                      settingsStatus.success 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-250 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {settingsStatus.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                      {settingsStatus.message}
                    </p>
                  )}

                  {/* WhatsApp contact number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Phone size={13} className="text-blue-600" /> Nomor WhatsApp Admin (Gunakan Awalan Kode Negara):
                    </label>
                    <input
                      id="settings-wa-number"
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Contoh: 6281234567890 (jangan pakai + atau spasi)"
                      className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 block">Klien akan langsung diarahkan ke chat nomor WhatsApp ini saat memesan atau mencari obat.</span>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>

                  {/* Pharmacy Address */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin size={13} className="text-blue-600" /> Alamat Lengkap Apotek:
                    </label>
                    <textarea
                      id="settings-pharmacy-address"
                      rows={2}
                      required
                      value={pharmacyAddress}
                      onChange={(e) => setPharmacyAddress(e.target.value)}
                      placeholder="Contoh: Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka"
                      className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 block">Alamat lengkap apotek yang akan ditampilkan di header atas dan footer semua halaman.</span>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>

                  {/* Upload Pharmacy Logo */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-1">Unggah Logo Resmi Apotek (Opsional)</h4>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                      <div className="flex items-center gap-4">
                        {/* Preview */}
                        <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {pharmacyLogo ? (
                            <img 
                              src={pharmacyLogo} 
                              alt="Logo Preview" 
                              className="w-full h-full object-contain" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-2xl font-black text-blue-600 bg-blue-50 w-full h-full flex items-center justify-center">
                              A
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 font-sans">Logo Apotek</p>
                          <p className="text-[10px] text-slate-400 font-sans">Format gambar (JPEG, PNG, WEBP). Maksimal ukuran 2MB.</p>
                          {pharmacyLogo && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="text-[10px] text-rose-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              Reset ke Logo Default (A)
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative border border-dashed border-slate-200 hover:border-blue-400 rounded-lg p-3 text-center cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/20 group">
                        <input
                          id="logo-file-picker"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Upload size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-[10.5px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                            Klik di sini untuk mengganti logo apotek Anda
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>

                  {/* Customizable greetings */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Kustomisasi Kata Sambutan / Banner Pengumuman</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Kata Sambutan Halaman Katalog:</label>
                        <textarea
                          id="settings-greeting-catalog"
                          rows={2}
                          placeholder="Masukkan kata sambutan selamat datang di halaman Katalog..."
                          value={greetingCatalog}
                          onChange={(e) => setGreetingCatalog(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Kata Sambutan Halaman Promo & Bundling:</label>
                        <textarea
                          id="settings-greeting-promo"
                          rows={2}
                          placeholder="Masukkan kata sambutan selamat datang di halaman Promo..."
                          value={greetingPromo}
                          onChange={(e) => setGreetingPromo(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>

                  {/* Kustomisasi Latar Belakang */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Kustomisasi Panel Utama (Latar)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Latar:</label>
                        <select
                          value={bgType}
                          onChange={(e) => setBgType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pattern">Pola Warna / Pattern</option>
                          <option value="color">Warna Solid</option>
                          <option value="image">Gambar / Foto</option>
                        </select>
                      </div>

                      {bgType !== 'image' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Warna Latar Dasar (Hex / Nama):</label>
                          <div className="flex items-center gap-2">
                             <input
                               type="color"
                               value={bgColor}
                               onChange={(e) => setBgColor(e.target.value)}
                               className="h-8 w-10 p-0 border-0 rounded cursor-pointer"
                             />
                             <input
                               type="text"
                               placeholder="#f8fafc"
                               value={bgColor}
                               onChange={(e) => setBgColor(e.target.value)}
                               className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                             />
                          </div>
                        </div>
                      )}

                      {bgType === 'pattern' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Pilih Pola Hiasan:</label>
                          <select
                            value={bgPattern}
                            onChange={(e) => setBgPattern(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="none">Kosong (Hanya Warna)</option>
                            <option value="dots">Titik (Dots)</option>
                            <option value="grid">Garis Kotak (Grid)</option>
                            <option value="crosses">Tanda Silang (Crosses)</option>
                          </select>
                        </div>
                      )}

                      {bgType === 'image' && (
                        <div className="space-y-3 col-span-1 sm:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Tautan URL Gambar:</label>
                              <input
                                type="text"
                                placeholder="https://contoh.com/gambar.jpg"
                                value={bgImageUrl.startsWith('data:') ? '' : bgImageUrl}
                                onChange={(e) => setBgImageUrl(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <p className="text-[9px] text-slate-400 mt-1">Gunakan alamat URL gambar publik, atau unggah langsung menggunakan tombol di sebelah kanan.</p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Atau Unggah Langsung:</label>
                              
                              <div className="flex gap-3 items-center">
                                {/* Preview */}
                                <div className="w-16 h-12 rounded bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                  {bgImageUrl ? (
                                    <img src={bgImageUrl} alt="Background Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-[9px] text-slate-400">Kosong</span>
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="relative border border-dashed border-slate-200 hover:border-blue-400 rounded-lg p-2 text-center cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/20 group">
                                    <input
                                      id="bg-file-picker"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleBgImageUpload}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex items-center justify-center gap-1">
                                      <Upload size={12} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                                        Pilih Berkas Latar Belakang
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-[8px] text-slate-400">
                                    <span>Format gambar bebas. Maks 800KB.</span>
                                    {bgImageUrl && (
                                      <button
                                        type="button"
                                        onClick={handleRemoveBgImage}
                                        className="text-rose-600 hover:underline font-bold cursor-pointer"
                                      >
                                        Hapus gambar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="h-px bg-slate-200/60 my-4"></div>

                  {/* Change standard PIN */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Ganti PIN Room Kontrol</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Kontrol Baru:</label>
                        <input
                          id="settings-new-pin"
                          type="password"
                          placeholder="Masukkan angka PIN baru"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Konfirmasi PIN Baru:</label>
                        <input
                          id="settings-confirm-pin"
                          type="password"
                          placeholder="Ulangi angka PIN baru"
                          value={confirmNewPin}
                          onChange={(e) => setConfirmNewPin(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 outline-none text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      id="save-settings-btn"
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                    >
                      Perbarui Pengaturan
                    </button>
                  </div>
                </form>

                {/* Backup & Restore JSON Section */}
                <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4 mt-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Database size={14} className="text-blue-600" /> Cadangan & Restorasi Data (JSON)
                    </h4>
                    <p className="text-[11px] text-slate-400">Gunakan berkas JSON untuk mengunduh cadangan seluruh data sistem atau memulihkan data yang sebelumnya disimpan ke peramban.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Export/Backup Button */}
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl flex flex-col justify-between shadow-3xs hover:border-blue-200 transition-colors">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1 flex items-center gap-1">
                          <Download size={11} className="text-emerald-500" /> Backup Data
                        </span>
                        <p className="text-[10.5px] text-slate-400 mb-3 leading-snug">Simpan seluruh katalog obat, program promo, dan log aktivitas menjadi berkas cadangan (.json) lokal.</p>
                      </div>
                      <button
                        type="button"
                        id="settings-export-json-btn"
                        onClick={handleExportData}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-98"
                      >
                        <Download size={12} /> Unduh File Cadangan
                      </button>
                    </div>

                    {/* Import/Restore Button */}
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl flex flex-col justify-between shadow-3xs hover:border-indigo-200 transition-colors relative">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1 flex items-center gap-1">
                          <Upload size={11} className="text-indigo-500" /> Restore Data
                        </span>
                        <p className="text-[10.5px] text-slate-400 mb-3 leading-snug">Unggah berkas cadangan JSON yang valid untuk memulihkan seluruh basis data apotek seketika.</p>
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          id="settings-restore-file-picker"
                          onChange={handleJsonFileRestore}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 flex items-center justify-center gap-1 transition-colors active:scale-98">
                          <Upload size={12} /> Unggah & Pulihkan JSON
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Data Section */}
                <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200/50 space-y-4 mt-6">
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <RotateCcw size={14} className="text-rose-600" /> Reset Semua Data Sistem
                    </h4>
                    <p className="text-[11px] text-rose-600/85 leading-relaxed">
                      PERINGATAN: Tindakan ini akan mengembalikan seluruh database (katalog obat, promosi, pengaturan apotek, berkas logo, warna/gambar latar belakang, dan riwayat audit log) kembali ke pengaturan awal bawaan pabrik. Semua perubahan yang pernah Anda buat akan hilang secara permanen.
                    </p>
                  </div>
                  
                  <div className="flex justify-start">
                    <button
                      type="button"
                      id="settings-reset-data-btn"
                      onClick={handleFullReset}
                      disabled={isResetting}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-[11px] rounded-lg border border-rose-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-sm"
                    >
                      {isResetting ? (
                        <>
                          <RotateCcw size={12} className="animate-spin" />
                          Sedang Mereset Data...
                        </>
                      ) : (
                        <>
                          <Trash2 size={12} />
                          Reset Kembali ke Pengaturan Bawaan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT LOGS VIEW */}
            {activeTab === 'logs' && isSuperUser && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">LOG AUDIT AKTIVITAS SISTEM</h3>
                    <p className="text-xs text-slate-400">Catatan riwayat tindakan administrator dan perubahan database terdokumentasi.</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-96 overflow-y-auto space-y-2">
                  {currentLogs.slice((logPage - 1) * ITEMS_PER_PAGE, logPage * ITEMS_PER_PAGE).map((log) => (
                    <div key={log.id} className="p-3 bg-white rounded-lg border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mr-2 tracking-wide">
                          {log.action}
                        </span>
                        <span className="text-xs text-slate-600 leading-tight">{log.details}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')} - {new Date(log.timestamp).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
                {renderPagination(logPage, currentLogs.length, setLogPage)}
              </div>
            )}

            {/* SUPER SYSTEM SETTINGS VIEW */}
            {activeTab === 'super' && isSuperUser && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5 text-indigo-700">
                    <ShieldAlert size={18} /> OPERASI KOSMETIS SUPER USER
                  </h3>
                  <p className="text-xs text-slate-500">Operasi kritis untuk membackup, merestore database, atau melakukan debug biner.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Backup Card */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                      <Download size={14} className="text-indigo-600" /> Ekspor Basis Data (JSON)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Download ekspor cadangan penuh dari seluruh array obat, promosi, dan riwayat aktivitas komputer dalam format JSON mentah.
                    </p>
                    <button
                      id="super-export-btn"
                      onClick={handleExportData}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Unduh Ekspor (.json)
                    </button>
                  </div>

                  {/* Total Reset system */}
                  <div className="bg-rose-50/40 p-4 border border-rose-200/60 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1">
                      <RotateCcw size={14} className="text-rose-600" /> Reset Pabrik (Apotek)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Hapus total seluruh modifikasi lokal Anda di browser ini dan kembalikan ke obat-obatan default dari Assyifa Farma Cideres.
                    </p>
                    <button
                      id="super-reset-btn"
                      onClick={handleSistemReset}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Lakukan Reset Total
                    </button>
                  </div>
                </div>

                {/* Import JSON Section */}
                <form onSubmit={handleImportJson} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Upload size={14} className="text-indigo-600" /> Impor Basis Data Cadangan (Tempel JSON)
                  </h4>
                  <p className="text-[11px] text-slate-400">Tempel berkas teks JSON salinan ekspor Anda di bawah ini untuk merestorasi data seketika.</p>

                  {importStatus.message && (
                    <p className={`p-2.5 text-xs rounded-lg font-semibold flex items-center gap-2 border ${
                      importStatus.success 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {importStatus.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {importStatus.message}
                    </p>
                  )}

                  <textarea
                    id="super-import-json-area"
                    rows={4}
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder='{"medicines": [...], "promos": [...], "settings": {...}}'
                    className="w-full p-2.5 bg-white border border-slate-200 text-xs font-mono text-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      id="super-import-btn"
                      type="submit"
                      disabled={!importJson.trim()}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        importJson.trim() 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Eksekusi Impor Massal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Database className="text-indigo-600 animate-pulse" size={18} />
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight uppercase">
                  Pratinjau Impor Data {importPreview.type === 'excel' ? 'Excel' : 'JSON'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-150 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-emerald-50/50 border border-emerald-250 border-emerald-100/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block leading-none">Total Berhasil Validasi</span>
                    <h4 className="text-lg font-black text-emerald-800 leading-none mt-1.5">
                      {importPreview.successItems.length} <span className="text-[10px] font-medium text-emerald-600">item / baris</span>
                    </h4>
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-250 border-rose-100/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block leading-none">Total Gagal Validasi</span>
                    <h4 className="text-lg font-black text-rose-800 leading-none mt-1.5">
                      {importPreview.failedItems.length} <span className="text-[10px] font-medium text-rose-600">item / baris</span>
                    </h4>
                  </div>
                </div>
              </div>

              {/* Warnings / Failures Section */}
              {importPreview.failedItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block flex items-center gap-1 leading-none">
                    <AlertCircle size={12} className="text-rose-500" /> Detail Kegagalan Validasi ({importPreview.failedItems.length})
                  </span>
                  <div className="bg-rose-50/20 border border-rose-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-rose-100/40">
                    {importPreview.failedItems.map((fail, i) => (
                      <div key={i} className="p-3 flex items-start gap-2.5 text-[11px] align-top">
                        <span className="bg-rose-100 text-rose-700 text-[8.5px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider whitespace-nowrap mt-0.5">
                          Baris / Posisi {fail.rowIndex}
                        </span>
                        <div className="space-y-0.5 text-left">
                          {fail.name && <h5 className="font-extrabold text-slate-700 text-xs">{fail.name}</h5>}
                          <p className="text-rose-700 leading-relaxed font-semibold">{fail.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Successful items list */}
              {importPreview.successItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1 leading-none">
                    <CheckCircle size={12} className="text-emerald-500" /> Pratinjau Item Sukses ({importPreview.successItems.length})
                  </span>
                  <div className="bg-slate-50/50 border border-slate-150 border-slate-200/50 rounded-xl max-h-44 overflow-y-auto divide-y divide-slate-100/80">
                    {importPreview.successItems.map((item, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wide">
                            {item.category || item.type || (importPreview.type === 'excel' ? 'Obat' : 'Data')}
                          </span>
                          <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        {item.price !== undefined && (
                          <span className="font-mono text-[10px] text-slate-500 font-bold">{formatRupiah(item.price)}</span>
                        )}
                        {item.detail && (
                          <span className="text-[9px] text-slate-400 italic">{item.detail}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning guide details */}
              <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-150 border-slate-100 p-2.5 rounded-xl leading-relaxed">
                {importPreview.failedItems.length > 0 ? (
                  <p>
                    <span className="font-bold text-slate-600">Catatan Penting:</span> Beberapa baris atau modul data mengalami kegagalan validasi di atas. Jika Anda melanjutkan impor, sistem <span className="text-emerald-600 font-bold">hanya akan menyimpan {importPreview.successItems.length} item yang sukses</span>, dan melewatkan baris-baris gagal secara otomatis demi stabilitas data aplikasi.
                  </p>
                ) : (
                  <p>
                    <span className="text-emerald-600 font-bold">Validasi Berhasil Sempurna!</span> Seluruh item data ({importPreview.successItems.length}) telah lolos penyaringan standar apotek dan siap diintegrasikan penuh ke memori awan utama.
                  </p>
                )}
              </div>
            </div>

            {/* Footer controls */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="px-3.5 py-1.5 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all cursor-pointer text-[11px] active:scale-98"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={confirmAndExecuteImport}
                disabled={importPreview.successItems.length === 0}
                className={`px-4 py-1.5 font-bold rounded-lg transition-all text-[11px] flex items-center gap-1.5 active:scale-98 shadow-xs ${
                  importPreview.successItems.length > 0 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check size={12} /> Konfirmasi & Impor Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
