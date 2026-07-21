/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MultiUnit {
  name: string;
  multiplier: number;
  customPrice?: number; // kept for backwards compatibility
  customPriceMedis?: number;
  customPriceMb?: number;
  customPriceKhusus?: number;
  customPriceHkOtc?: number;
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
  defaultUnit?: string; // e.g. the unit that should be shown by default (matches baseUnit or a name in multiUnits)
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
  bundledItems?: { medicineId: string; isFree?: boolean; discountPercent?: number; customPrice?: number }[];
  bannerImageUrl?: string; // base64 data URL for banner image
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
  homeTheme?: 'default' | 'ocean' | 'nature' | 'sunset' | 'elegant' | 'playful';
  autoRotateTheme?: boolean;
  autoRotateInterval?: number;
  autoRotateUnit?: 'minutes' | 'seconds';
}

export interface ActionLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface CartItem {
  id: string; // unique internal id for the cart item (since same med can be added with diff units)
  medicineId: string;
  name: string;
  category: string;
  unit: string;
  multiplier: number;
  price: number; // final calculated price per unit (after promo/custom)
  quantity: number;
}

export interface CustomerData {
  name: string;
  address: string;
  phone: string;
  notes?: string;
  deliveryOption?: 'dikirim' | 'diambil';
}

export interface Order {
  id: string;
  customerData: CustomerData;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: string;
}
