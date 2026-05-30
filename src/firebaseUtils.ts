import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { Medicine, Promo, Settings, ActionLog } from './types';
import { INITIAL_MEDICINES, INITIAL_PROMOS } from './initialData';

const SETTINGS_ID = "general";

export function subscribeMedicines(callback: (medicines: Medicine[]) => void) {
  return onSnapshot(collection(db, 'medicines'), (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as Medicine));
  });
}

export function subscribePromos(callback: (promos: Promo[]) => void) {
  return onSnapshot(collection(db, 'promos'), (snapshot) => {
    callback(snapshot.docs.map(d => d.data() as Promo));
  });
}

export function subscribeSettings(callback: (settings: Settings) => void) {
  return onSnapshot(doc(db, 'settings', SETTINGS_ID), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Settings);
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
  const newObj = { ...obj } as any;
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj as T;
}

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
    id: `log-${Date.now()}`,
    action,
    timestamp: new Date().toISOString(),
    details
  };
  await setDoc(doc(db, 'logs', newLog.id), newLog);
}

// Full array save functions since the original code expects to save whole lists (e.g. from Excel)
export async function saveMedicinesList(medicines: Medicine[]) {
    const batch = writeBatch(db);
    medicines.forEach(med => {
        batch.set(doc(db, 'medicines', med.id), removeUndefined(med));
    });
    await batch.commit();
}

// Warning: For simplicity, replacing the entire collection here is done by deleting all then adding.
// A more complete implementation might diff, but for 'reset' and 'import', deleting all is needed.
export async function replaceMedicinesList(medicines: Medicine[]) {
    // Delete existing
    const existing = await getDocs(collection(db, 'medicines'));
    const batch = writeBatch(db);
    existing.forEach(docSnap => batch.delete(docSnap.ref));
    
    // Chunk writes if array is > 500 (Firestore limit), though typically we won't hit it right now
    // Actually, simple sequential chunks
    for(let i=0; i < medicines.length; i+=490) {
        const chunk = medicines.slice(i, i+490);
        const subBatch = writeBatch(db);
        chunk.forEach(med => subBatch.set(doc(db, 'medicines', med.id), removeUndefined(med)));
        await subBatch.commit();
    }
}

export async function replacePromosList(promos: Promo[]) {
    const existing = await getDocs(collection(db, 'promos'));
    const batch = writeBatch(db);
    existing.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();

    for(let i=0; i < promos.length; i+=490) {
        const chunk = promos.slice(i, i+490);
        const subBatch = writeBatch(db);
        chunk.forEach(promo => subBatch.set(doc(db, 'promos', promo.id), removeUndefined(promo)));
        await subBatch.commit();
    }
}

export async function firebaseInitializeData() {
    // initialize if empty
    const meds = await getDocs(collection(db, 'medicines'));
    if (meds.empty) {
        replaceMedicinesList(INITIAL_MEDICINES);
    }
    const promos = await getDocs(collection(db, 'promos'));
    if (promos.empty) {
        replacePromosList(INITIAL_PROMOS);
    }
    // Don't overwrite settings if they exist
}
