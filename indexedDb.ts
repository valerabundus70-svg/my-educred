import { Achievement, CyberProfilesMap } from '../types';

const DB_NAME = 'educred_local_storage_db';
const STORE_NAME = 'portfolio_achievements';
const DB_KEY = 'educred_items';
const PROFILES_KEY = 'educred_cyber_profiles';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Permanently save achievements and large attached files to IndexedDB
 */
export async function idbSaveAchievements(items: Achievement[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(items, DB_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB write warning:', e);
  }
}

/**
 * Load achievements from IndexedDB
 */
export async function idbLoadAchievements(): Promise<Achievement[] | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(DB_KEY);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const result = req.result;
        if (Array.isArray(result) && result.length > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Save cyber platform profiles (TryHackMe & Hack The Box) to IndexedDB
 */
export async function idbSaveProfiles(profiles: CyberProfilesMap): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(profiles, PROFILES_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB profiles write warning:', e);
  }
}

/**
 * Load cyber platform profiles from IndexedDB
 */
export async function idbLoadProfiles(): Promise<CyberProfilesMap | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(PROFILES_KEY);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const result = req.result;
        if (result && typeof result === 'object') {
          resolve(result as CyberProfilesMap);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}
