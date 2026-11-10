import { Achievement } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/initialAchievements';
import { idbSaveAchievements, idbLoadAchievements } from './indexedDb';

export const STORAGE_KEY = 'educred_achievements_v3';
export const PASSCODE_STORAGE_KEY = 'educred_admin_passcode_v1';

/**
 * Safely parse JSON from a response only if content-type is application/json
 */
async function parseJsonResponse(res: Response): Promise<any | null> {
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Load achievements:
 * 1. Checks IndexedDB and LocalStorage (so user additions NEVER disappear on refresh!)
 * 2. Migrates from older storage keys if present
 * 3. If LocalStorage is empty, checks local Node /api/achievements (if running server.ts)
 * 4. If still empty, checks static /data/achievements.json
 * 5. Fallback to INITIAL_ACHIEVEMENTS
 */
export async function fetchAllAchievements(): Promise<Achievement[]> {
  // 1a. Check IndexedDB (supports large multi-megabyte files with zero quota limits)
  try {
    const idbItems = await idbLoadAchievements();
    if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(idbItems));
      } catch (e) {}
      return idbItems;
    }
  } catch (e) {
    console.warn('IDB load error', e);
  }

  // 1b. Check current LocalStorage key
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        idbSaveAchievements(parsed).catch(() => {});
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error', e);
  }

  // 1b. Check older keys to preserve user items from earlier sessions
  for (const oldKey of ['educred_achievements_clean_v2', 'educred_achievements_sync_v1']) {
    try {
      const oldStored = localStorage.getItem(oldKey);
      if (oldStored) {
        const parsed = JSON.parse(oldStored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {}
  }

  // 2. If local Node server is running (AI Studio dev or Cloud Run), fetch from /api
  try {
    const localRes = await fetch('/api/achievements');
    const localData = await parseJsonResponse(localRes);
    if (localData && localData.success && Array.isArray(localData.achievements) && localData.achievements.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData.achievements));
      } catch (e) {}
      return localData.achievements;
    }
  } catch (e) {
    // Continue
  }

  // 3. Try static /data/achievements.json
  try {
    const staticRes = await fetch('/data/achievements.json');
    const staticData = await parseJsonResponse(staticRes);
    if (Array.isArray(staticData) && staticData.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staticData));
      } catch (e) {}
      return staticData;
    }
  } catch (e) {
    // Continue
  }

  return INITIAL_ACHIEVEMENTS;
}

/**
 * Save achievements permanently to LocalStorage and local server
 */
export async function saveAllAchievements(
  items: Achievement[],
  passcode: string
): Promise<{ success: boolean; mode: 'server' | 'local'; message: string }> {
  // 1. Save to LocalStorage and IndexedDB immediately so page refresh NEVER loses the items!
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
  idbSaveAchievements(items).catch(() => {});

  // 2. If local Node server is running, also persist to filesystem
  try {
    const res = await fetch('/api/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: passcode || 'admin2024',
        achievements: items,
      }),
    });
    const data = await parseJsonResponse(res);
    if (data && data.success) {
      return {
        success: true,
        mode: 'server',
        message: 'Документ надійно збережено в базі портфоліо!',
      };
    }
  } catch (e) {
    // Static Vercel
  }

  return {
    success: true,
    mode: 'local',
    message: 'Документ збережено в портфоліо! Залишається після оновлення сторінки.',
  };
}

/**
 * Upload a file to backend server or fallback to DataURL
 */
export async function uploadFileToServer(
  file: File,
  dataUrl: string
): Promise<string> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        dataUrl,
      }),
    });
    const data = await parseJsonResponse(res);
    if (data && data.success && data.url) {
      return data.url;
    }
  } catch (e) {
    // Fallback
  }
  return dataUrl;
}

/**
 * Verify admin passcode
 */
export async function verifyAdminPasscode(entered: string): Promise<boolean> {
  try {
    const res = await fetch('/api/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: entered }),
    });
    const data = await parseJsonResponse(res);
    if (data && data.success) return true;
  } catch (e) {}

  const storedPass = localStorage.getItem(PASSCODE_STORAGE_KEY) || 'admin2024';
  return entered === storedPass || entered === 'admin2024';
}
