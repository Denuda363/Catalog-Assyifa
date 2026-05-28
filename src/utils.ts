/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medicine, Promo, ActionLog, Settings } from './types';
import { INITIAL_MEDICINES, INITIAL_PROMOS } from './initialData';

// Format numbers into Indonesian Rupiah currency
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format ISO date strings into local readable formats
export function formatDate(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';
}

// Local Storage Keys
const MEDICINES_KEY = 'assyifa_medicines';
const PROMOS_KEY = 'assyifa_promos';
const SETTINGS_KEY = 'assyifa_settings';
const LOGS_KEY = 'assyifa_logs';

export function initializeData() {
  if (!localStorage.getItem(MEDICINES_KEY)) {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(INITIAL_MEDICINES));
  }
  if (!localStorage.getItem(PROMOS_KEY)) {
    localStorage.setItem(PROMOS_KEY, JSON.stringify(INITIAL_PROMOS));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    const defaultSettings: Settings = {
      adminPin: '12345',
      whatsappNumber: '6281234567890',
      greetingCatalog: 'Selamat datang di Apotek Assyifa Farma Cideres. Kami menyediakan katalog obat-obatan lengkap dan harga resmi terpercaya, siap melayani kesehatan Anda dengan sepenuh hati.',
      greetingPromo: 'Dapatkan promo produk pilihan dan paket bundling hemat khusus pekan ini di Apotek Assyifa Farma Cideres. Silakan berkonsultasi atau memesan langsung melalui nomor WhatsApp resmi kami.',
      pharmacyAddress: 'Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka'
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(LOGS_KEY)) {
    const initialLog: ActionLog[] = [
      {
        id: 'log-001',
        action: 'Sistem Diinisialisasi',
        timestamp: new Date().toISOString(),
        details: 'Katalog harga obat Apotek Assyifa Farma Cideres berhasil dipasang.'
      }
    ];
    localStorage.setItem(LOGS_KEY, JSON.stringify(initialLog));
  }
}

export function getMedicines(): Medicine[] {
  initializeData();
  const data = localStorage.getItem(MEDICINES_KEY);
  return data ? JSON.parse(data) : INITIAL_MEDICINES;
}

export function saveMedicines(medicines: Medicine[]) {
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
}

export function getPromos(): Promo[] {
  initializeData();
  const data = localStorage.getItem(PROMOS_KEY);
  return data ? JSON.parse(data) : INITIAL_PROMOS;
}

export function savePromos(promos: Promo[]) {
  localStorage.setItem(PROMOS_KEY, JSON.stringify(promos));
}

export function getSettings(): Settings {
  initializeData();
  const data = localStorage.getItem(SETTINGS_KEY);
  const parsed = data ? JSON.parse(data) : {};
  const defaultSettings: Settings = {
    adminPin: '12345',
    whatsappNumber: '6281234567890',
    greetingCatalog: 'Selamat datang di Apotek Assyifa Farma Cideres. Kami menyediakan katalog obat-obatan lengkap dan harga resmi terpercaya, siap melayani kesehatan Anda dengan sepenuh hati.',
    greetingPromo: 'Dapatkan promo produk pilihan dan paket bundling hemat khusus pekan ini di Apotek Assyifa Farma Cideres. Silakan berkonsultasi atau memesan langsung melalui nomor WhatsApp resmi kami.',
    pharmacyAddress: 'Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka'
  };
  return { ...defaultSettings, ...parsed };
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getLogs(): ActionLog[] {
  initializeData();
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLogs(logs: ActionLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function addLog(action: string, details: string) {
  const logs = getLogs();
  const newLog: ActionLog = {
    id: `log-${Date.now()}`,
    action,
    timestamp: new Date().toISOString(),
    details
  };
  saveLogs([newLog, ...logs].slice(0, 50)); // Keep last 50 logs
}
