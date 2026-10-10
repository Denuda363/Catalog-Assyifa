import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch, 
  query, 
  limit 
} from 'firebase/firestore';
import { Medicine, Promo, Settings, ActionLog, Order } from './types';
import { INITIAL_MEDICINES, INITIAL_PROMOS } from './initialData';

const SETTINGS_ID = "general";

// ==========================================
// FAST LOCAL-FIRST CACHE UTILITIES
// ==========================================
export function getCachedData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Gracefully handle storage quota in private mode or full storage
    console.warn('Storage cache write skipped:', e);
  }
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS (LOCAL-FIRST)
// ==========================================
export function subscribeOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    const orders = snapshot.docs.map(d => d.data() as Order);
    orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setCachedData('assyifa_orders_cache', orders);
    callback(orders);
  });
}

export function subscribeMedicines(callback: (medicines: Medicine[]) => void) {
  return onSnapshot(collection(db, 'medicines'), (snapshot) => {
    const meds = snapshot.docs.map(d => d.data() as Medicine);
    setCachedData('assyifa_medicines_cache', meds);
    callback(meds);
  });
}

export function subscribePromos(callback: (promos: Promo[]) => void) {
  return onSnapshot(collection(db, 'promos'), (snapshot) => {
    const promos = snapshot.docs.map(d => d.data() as Promo);
    setCachedData('assyifa_promos_cache', promos);
    callback(promos);
  });
}

export function subscribeSettings(callback: (settings: Settings) => void) {
  return onSnapshot(doc(db, 'settings', SETTINGS_ID), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as Settings;
      setCachedData('assyifa_settings_cache', data);
      callback(data);
    } else {
      const defaultSettings: Settings = {
        adminPin: '12345',
        whatsappNumber: '6281234567890',
        greetingCatalog: 'Selamat datang di Apotek Assyifa Farma Cideres. Kami menyediakan katalog obat-obatan lengkap dan harga resmi terpercaya, siap melayani kesehatan Anda dengan sepenuh hati.',
        greetingPromo: 'Dapatkan promo produk pilihan dan paket bundling hemat khusus pekan ini di Apotek Assyifa Farma Cideres. Silakan berkonsultasi atau memesan langsung melalui nomor WhatsApp resmi kami.',
        pharmacyAddress: 'Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka'
      };
      callback(defaultSettings);
    }
  });
}

export function subscribeLogs(callback: (logs: ActionLog[]) => void) {
  return onSnapshot(collection(db, 'logs'), (snapshot) => {
    const logs = snapshot.docs.map(d => d.data() as ActionLog);
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(logs);
  });
}

export function removeUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ==========================================
// HIGH SPEED SINGLE DOCUMENT WRITES
// ==========================================
export async function saveMedicine(medicine: Medicine) {
  await setDoc(doc(db, 'medicines', medicine.id), removeUndefined(medicine));
}

export async function deleteMedicine(id: string) {
  await deleteDoc(doc(db, 'medicines', id));
}

export async function savePromo(promo: Promo) {
  await setDoc(doc(db, 'promos', promo.id), removeUndefined(promo));
}

export async function deletePromo(id: string) {
  await deleteDoc(doc(db, 'promos', id));
}

export async function saveSettingsObj(settings: Settings) {
  await setDoc(doc(db, 'settings', SETTINGS_ID), removeUndefined(settings));
}

export async function addLogObj(action: string, details: string) {
  const newLog: ActionLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    details
  };
  await setDoc(doc(db, 'logs', newLog.id), newLog);
}

export async function saveOrder(order: Order) {
  await setDoc(doc(db, 'orders', order.id), removeUndefined(order));
}

export async function updateOrder(orderId: string, updates: Partial<Order>) {
  await setDoc(doc(db, 'orders', orderId), updates, { merge: true });
}

// ==========================================
// ULTRA-FAST BATCH WRITES (PARALLEL COMMIT)
// ==========================================
const BATCH_CHUNK_SIZE = 450;
const PARALLEL_CONCURRENCY = 4;

/**
 * Super fast targeted upsert: writes only new & modified medicines in parallel batches
 * without deleting or wiping identical existing medicines.
 */
export async function upsertMedicinesList(medicines: Medicine[], onProgress?: (pct: number) => void) {
  if (!medicines || medicines.length === 0) return;

  const chunks: Medicine[][] = [];
  for (let i = 0; i < medicines.length; i += BATCH_CHUNK_SIZE) {
    chunks.push(medicines.slice(i, i + BATCH_CHUNK_SIZE));
  }

  let completed = 0;
  for (let i = 0; i < chunks.length; i += PARALLEL_CONCURRENCY) {
    const chunkSlice = chunks.slice(i, i + PARALLEL_CONCURRENCY);
    await Promise.all(
      chunkSlice.map(async (chunk) => {
        const batch = writeBatch(db);
        chunk.forEach(med => {
          batch.set(doc(db, 'medicines', med.id), removeUndefined(med));
        });
        await batch.commit();
        completed++;
        if (onProgress) {
          onProgress(Math.round((completed / chunks.length) * 100));
        }
      })
    );
  }
}

export async function saveMedicinesList(medicines: Medicine[]) {
  await upsertMedicinesList(medicines);
}

/**
 * Super-fast full collection replacement with parallel batch deletes and writes.
 */
export async function replaceMedicinesList(medicines: Medicine[]) {
  // 1. Delete existing docs in parallel batches
  const existing = await getDocs(collection(db, 'medicines'));
  const docs = existing.docs;
  if (docs.length > 0) {
    const deleteBatches: ReturnType<typeof writeBatch>[] = [];
    for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
      const chunk = docs.slice(i, i + BATCH_CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach(docSnap => batch.delete(docSnap.ref));
      deleteBatches.push(batch);
    }
    // Commit delete batches in parallel pools
    for (let i = 0; i < deleteBatches.length; i += PARALLEL_CONCURRENCY) {
      const slice = deleteBatches.slice(i, i + PARALLEL_CONCURRENCY);
      await Promise.all(slice.map(b => b.commit()));
    }
  }

  // 2. Write new medicines in parallel batches
  await upsertMedicinesList(medicines);
}

export async function replacePromosList(promos: Promo[]) {
  // Delete existing in parallel chunks
  const existing = await getDocs(collection(db, 'promos'));
  const docs = existing.docs;
  if (docs.length > 0) {
    const deleteBatches: ReturnType<typeof writeBatch>[] = [];
    for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
      const chunk = docs.slice(i, i + BATCH_CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach(docSnap => batch.delete(docSnap.ref));
      deleteBatches.push(batch);
    }
    for (let i = 0; i < deleteBatches.length; i += PARALLEL_CONCURRENCY) {
      const slice = deleteBatches.slice(i, i + PARALLEL_CONCURRENCY);
      await Promise.all(slice.map(b => b.commit()));
    }
  }

  // Write new promos in chunks
  const chunks: Promo[][] = [];
  for (let i = 0; i < promos.length; i += BATCH_CHUNK_SIZE) {
    chunks.push(promos.slice(i, i + BATCH_CHUNK_SIZE));
  }
  for (let i = 0; i < chunks.length; i += PARALLEL_CONCURRENCY) {
    const slice = chunks.slice(i, i + PARALLEL_CONCURRENCY);
    await Promise.all(
      slice.map(async (chunk) => {
        const batch = writeBatch(db);
        chunk.forEach(p => batch.set(doc(db, 'promos', p.id), removeUndefined(p)));
        await batch.commit();
      })
    );
  }
}

export async function deleteOrders(orderIds: string[]) {
  if (orderIds.length === 0) return;
  const batches: ReturnType<typeof writeBatch>[] = [];
  for (let i = 0; i < orderIds.length; i += BATCH_CHUNK_SIZE) {
    const chunk = orderIds.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(id => batch.delete(doc(db, 'orders', id)));
    batches.push(batch);
  }
  for (let i = 0; i < batches.length; i += PARALLEL_CONCURRENCY) {
    const slice = batches.slice(i, i + PARALLEL_CONCURRENCY);
    await Promise.all(slice.map(b => b.commit()));
  }
}

export async function clearAllOrders() {
  const existing = await getDocs(collection(db, 'orders'));
  const docs = existing.docs;
  if (docs.length === 0) return;
  const batches: ReturnType<typeof writeBatch>[] = [];
  for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
    const chunk = docs.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(docSnap => batch.delete(docSnap.ref));
    batches.push(batch);
  }
  for (let i = 0; i < batches.length; i += PARALLEL_CONCURRENCY) {
    const slice = batches.slice(i, i + PARALLEL_CONCURRENCY);
    await Promise.all(slice.map(b => b.commit()));
  }
}

export async function resetAllDataToDefault() {
  // Run reset operations with parallel speed
  await Promise.all([
    replaceMedicinesList(INITIAL_MEDICINES),
    replacePromosList(INITIAL_PROMOS),
    (async () => {
      const defaultSettings: Settings = {
        adminPin: '12345',
        whatsappNumber: '6281234567890',
        greetingCatalog: 'Selamat datang di Apotek Assyifa Farma Cideres. Kami menyediakan katalog obat-obatan lengkap dan harga resmi terpercaya, siap melayani kesehatan Anda dengan sepenuh hati.',
        greetingPromo: 'Dapatkan promo produk pilihan dan paket bundling hemat khusus pekan ini di Apotek Assyifa Farma Cideres. Silakan berkonsultasi atau memesan langsung melalui nomor WhatsApp resmi kami.',
        pharmacyAddress: 'Jl. Raya Cideres-Kadipaten No. 45, Cideres, Majalengka',
        bgType: 'pattern',
        bgColor: '',
        bgPattern: '',
        bgImageUrl: '',
        pharmacyLogo: ''
      };
      await saveSettingsObj(defaultSettings);
    })(),
    (async () => {
      const logsSnap = await getDocs(collection(db, 'logs'));
      const logDocs = logsSnap.docs;
      for (let i = 0; i < logDocs.length; i += BATCH_CHUNK_SIZE) {
        const chunk = logDocs.slice(i, i + BATCH_CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
    })()
  ]);

  await addLogObj('Reset Data', 'Mengembalikan seluruh data medicine, promo, pengaturan, dan riwayat log ke kondisi bawaan.');
}

/**
 * Super lightweight database initializer: uses limit(1) to avoid downloading entire database!
 */
export async function firebaseInitializeData() {
  try {
    const medsCheck = await getDocs(query(collection(db, 'medicines'), limit(1)));
    if (medsCheck.empty) {
      await replaceMedicinesList(INITIAL_MEDICINES);
    }
    const promosCheck = await getDocs(query(collection(db, 'promos'), limit(1)));
    if (promosCheck.empty) {
      await replacePromosList(INITIAL_PROMOS);
    }
  } catch (err) {
    console.warn('Firebase initialization check skipped or offline:', err);
  }
}
