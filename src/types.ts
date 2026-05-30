/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MultiUnit {
  name: string;
  multiplier: number;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  activeIngredient: string;
  price: number; // mapped value of priceMedis for general compatibility
  priceMb?: number; // HARGA MB
  priceMedis?: number; // HARGA MEDIS ( TAMPILKAN DI KATALOG DAN PROMO )
  pricePromo?: number; // HARGA PROMO ( TAMPILKAN DI PROMO )
  priceKhusus?: number; // HARGA KHUSUS
  priceHkOtc?: number; // HARGA HK OTC
  image?: string; // Product Image base64 data URL
  stockStatus?: 'Tersedia' | 'Kosong';
  indication: string;
  dose: string;
  updatedAt: string;
  promoPrice?: number; // mapped value of pricePromo for compatibility
  isPromo: boolean;
  baseUnit?: string; // e.g. Lembar, Tablet
  multiUnits?: MultiUnit[]; // custom units like Box = 10 Lembar
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  medicineId?: string; // Links to a specific medicine if applicable
  discountPercent?: number;
  validFrom?: string; // START DATE
  validUntil: string; // END DATE
  isBundling?: boolean; // True if this promo is a bundle package
  bundledMedicineIds?: string[]; // Array of bundled medicine IDs
}

export interface Settings {
  adminPin: string;
  whatsappNumber: string; // Dynamic WhatsApp number for orders
  greetingCatalog?: string; // Custom opening greeting for catalog page
  greetingPromo?: string; // Custom opening greeting for promo page
  pharmacyLogo?: string; // Pharmacy Logo base64 data URL
  pharmacyAddress?: string; // Dynamic address of the pharmacy
  bgType?: 'default' | 'solid' | 'pattern' | 'image';
  bgColor?: string; // Tailwind class like bg-slate-50, bg-sky-50, etc. Or custom color code
  bgPattern?: string; // pattern type
  bgImageUrl?: string; // base64 data URL of the uploaded background image
}

export interface ActionLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}
