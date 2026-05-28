/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medicine, Promo } from './types';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-001',
    name: 'Paracetamol 500 mg',
    category: 'Obat Bebas',
    activeIngredient: 'Paracetamol 500 mg',
    price: 8500,
    stockStatus: 'Tersedia',
    indication: 'Meredakan demam, sakit kepala, nyeri gigi, dan nyeri ringan sampai sedang.',
    dose: 'Dewasa: 1-2 kaplet, 3-4 kali sehari. Anak 6-12 tahun: 1/2-1 kaplet, 3-4 kali sehari.',
    updatedAt: '2026-05-28T11:00:00Z',
    isPromo: true,
    promoPrice: 7000
  },
  {
    id: 'med-002',
    name: 'Amoxicillin Trihydrate 500 mg',
    category: 'Obat Keras',
    activeIngredient: 'Amoxicillin 500 mg (Antibiotik)',
    price: 15000,
    stockStatus: 'Tersedia',
    indication: 'Mengobati infeksi saluran napas, infeksi kulit, infeksi saluran kemih (harus dengan resep dokter).',
    dose: 'Dewasa: 1 kaplet setiap 8 jam. Harus dihabiskan untuk mencegah resistensi bakteri.',
    updatedAt: '2026-05-28T11:00:00Z',
    isPromo: false
  },
  {
    id: 'med-003',
    name: 'Ibuprofen 400 mg',
    category: 'Obat Bebas Terbatas',
    activeIngredient: 'Ibuprofen 400 mg',
    price: 12000,
    stockStatus: 'Tersedia',
    indication: 'Meredakan nyeri haid, sakit gigi, migrain, nyeri otot, dan menurunkan demam.',
    dose: 'Dewasa: 1 tablet, 3-4 kali sehari sesudah makan.',
    updatedAt: '2026-05-28T11:00:00Z',
    isPromo: false
  },
  {
    id: 'med-004',
    name: 'Decolgen Tablet',
    category: 'Obat Bebas Terbatas',
    activeIngredient: 'Paracetamol 400 mg, Phenylpropanolamine HCl 12.5 mg, Chlorpheniramine Maleate 1 mg',
    price: 9000,
    stockStatus: 'Tersedia',
    indication: 'Meringankan gejala flu seperti demam, sakit kepala, hidung tersumbat, dan bersin-bersin.',
    dose: 'Dewasa: 1 tablet, 3-4 kali sehari. Anak-anak: 1/2 tablet, 3-4 kali sehari.',
    updatedAt: '2026-05-27T10:00:00Z',
    isPromo: true,
    promoPrice: 7500
  },
  {
    id: 'med-005',
    name: 'Promag Tablet Kunyah',
    category: 'Obat Bebas',
    activeIngredient: 'Hydrotalcite 200 mg, Magnesium Hydroxide 150 mg, Simethicone 50 mg',
    price: 9500,
    stockStatus: 'Tersedia',
    indication: 'Meringankan gejala sakit maag, asam lambung tinggi, kembung, dan perih di ulu hati.',
    dose: 'Dewasa: 1-2 tablet, dikunyah saat gejala timbul atau 1 jam sebelum makan.',
    updatedAt: '2026-05-28T09:00:00Z',
    isPromo: false
  },
  {
    id: 'med-006',
    name: 'Diapet Kapsul (Isi 4)',
    category: 'Herbal & Suplemen',
    activeIngredient: 'Ekstrak Daun Jambu Biji, Kunyit, Kulit Buah Delima, Kayu Secang',
    price: 6500,
    stockStatus: 'Tersedia',
    indication: 'Mengurangi frekuensi buang air besar (menceret), memadatkan tinja yang encer akibat diare.',
    dose: 'Dewasa: 2 kapsul sekaligus saat pertama diare. Bila berlanjut, minum 2 kapsul tiap 4 jam.',
    updatedAt: '2026-05-25T08:00:00Z',
    isPromo: false
  },
  {
    id: 'med-007',
    name: 'Sangobion Kapsul',
    category: 'Herbal & Suplemen',
    activeIngredient: 'Ferrous Gluconate, Manganese Sulfate, Copper Sulfate, Vitamin C, Folic Acid, Vitamin B12',
    price: 22000,
    stockStatus: 'Tersedia',
    indication: 'Suplemen penambah darah untuk mencegah anemia pasca melahirkan, operasi, atau masa menstruasi.',
    dose: '1 kapsul sehari setelah makan atau sesuai petunjuk dokter.',
    updatedAt: '2026-05-28T05:00:00Z',
    isPromo: true,
    promoPrice: 19500
  },
  {
    id: 'med-008',
    name: 'Asam Mefenamat 500 mg',
    category: 'Obat Keras',
    activeIngredient: 'Asam Mefenamat 500 mg',
    price: 11000,
    stockStatus: 'Tersedia',
    indication: 'Meredakan nyeri intensitas ringan sampai sedang, nyeri sakit gigi parah, nyeri setelah operasi.',
    dose: 'Dewasa: diawali 1 tablet, dilanjutkan 1/2-1 tablet tiap 6 jam sesudah makan.',
    updatedAt: '2026-05-28T01:00:00Z',
    isPromo: false
  },
  {
    id: 'med-009',
    name: 'Betadine Antiseptic Solution 15ml',
    category: 'Obat Bebas Terbatas',
    activeIngredient: 'Povidone-Iodine 10%',
    price: 18500,
    stockStatus: 'Tersedia',
    indication: 'Cairan antiseptik luar untuk mencegah infeksi pada luka bakar kecil, tergores, atau teriris.',
    dose: 'Dioleskan langsung pada luka beberapa kali sehari menggunakan kapas steril.',
    updatedAt: '2026-05-24T12:00:00Z',
    isPromo: false
  },
  {
    id: 'med-010',
    name: 'Insto Regular 7.5 ml',
    category: 'Obat Bebas Terbatas',
    activeIngredient: 'Tetrahydrozoline HCl 0.05%, Benzalkonium Chloride 0.01%',
    price: 16500,
    stockStatus: 'Kosong',
    indication: 'Mengatasi kemerahan dan rasa perih pada mata yang disebabkan oleh iritasi mata ringan (debu, asap, angin).',
    dose: 'Teteskan 2-3 tetes pada setiap mata, 3-4 kali sehari atau sesuai kebutuhan.',
    updatedAt: '2026-05-28T11:00:00Z',
    isPromo: false
  },
  {
    id: 'med-011',
    name: 'CDR (Calcium D Redoxon) Orange (Isi 10)',
    category: 'Herbal & Suplemen',
    activeIngredient: 'Kalsium 250 mg, Vitamin C 1000 mg, Vitamin D 300 IU, Vitamin B6 15 mg',
    price: 49000,
    stockStatus: 'Tersedia',
    indication: 'Suplemen kalsium dan vitamin C untuk menunjang kesehatan tulang, gigi korosif, dan meningkatkan imun tubuh.',
    dose: 'Dilarutkan dalam segelas air (200-250 ml), cukup 1 tablet effervescent sehari.',
    updatedAt: '2026-05-28T11:15:00Z',
    isPromo: true,
    promoPrice: 44000
  },
  {
    id: 'med-012',
    name: 'Termorex Sirup Demam Anak 60ml',
    category: 'Obat Bebas',
    activeIngredient: 'Paracetamol 120 mg per 5 ml',
    price: 17000,
    stockStatus: 'Tersedia',
    indication: 'Menurunkan demam anak-anak setelah imunisasi, pusing, sakit kepala ringan, atau nyeri tumbuh gigi.',
    dose: 'Anak 1-2 th: 1 sendok takar (5 ml), 3 th: 1.5 sendok takar, 6 th: 2 sendok takar. 3-4 kali sehari.',
    updatedAt: '2026-05-28T10:30:00Z',
    isPromo: false
  }
];

export const INITIAL_PROMOS: Promo[] = [
  {
    id: 'promo-001',
    title: 'Gebyar Sehat Paracetamol',
    description: 'Paracetamol 500mg kaplet demam & nyeri turun harga spesial menyambut pekan sehat Assyifa Farma Cideres. Dapatkan harga super hemat Rp 7.000 saja per strip.',
    medicineId: 'med-001',
    discountPercent: 17,
    validUntil: '2026-06-15'
  },
  {
    id: 'promo-002',
    title: 'Diskon Spesial CDR Vit-C',
    description: 'Jaga imunitas keluarga dengan CDR Effervescent Orange isi 10 tablet. Tubuh bugar penuh kalsium dan vitamin C dengan diskon hemat khusus pekan ini!',
    medicineId: 'med-011',
    discountPercent: 10,
    validUntil: '2026-06-05'
  },
  {
    id: 'promo-003',
    title: 'Paket Hemat Bebas Flu & Batuk',
    description: 'Dapatkan Decolgen Tablet seharga Rp 7.500 saja. Sangat dianjurkan untuk mengatasi gejala demam bersin hidung mampat secara cepat.',
    medicineId: 'med-004',
    discountPercent: 16,
    validUntil: '2026-06-10'
  }
];
