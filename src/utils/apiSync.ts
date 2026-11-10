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
 * Fetch achievements directly from the backend server with strict anti-caching.
 * Returns connected: true and the achievements list if the server responded.
 */
export async function fetchServerAchievements(): Promise<{
  connected: boolean;
  achievements: Achievement[] | null;
}> {
  try {
    const res = await fetch(`/api/achievements?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    const data = await parseJsonResponse(res);
    if (data && data.success && Array.isArray(data.achievements)) {
      // Sync to local caches in background so offline mode has freshest data
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.achievements));
      } catch (e) {}
      idbSaveAchievements(data.achievements).catch(() => {});
      return { connected: true, achievements: data.achievements };
    }
  } catch (e) {
    // Server is unreachable (e.g. offline or static Vercel)
  }
  return { connected: false, achievements: null };
}

/**
 * Load achievements:
 * 1. ALWAYS fetches the latest achievements from the server first so all guests see live updates!
 * 2. If the server is offline (or on static Vercel), falls back to IndexedDB/LocalStorage.
 * 3. Fallback to static JSON / INITIAL_ACHIEVEMENTS.
 */
export async function fetchAllAchievements(): Promise<{
  items: Achievement[];
  isServerConnected: boolean;
}> {
  // 1. Prioritize real server backend (Render.com / Node)
  const serverResult = await fetchServerAchievements();
  if (serverResult.connected && serverResult.achievements !== null) {
    return { items: serverResult.achievements, isServerConnected: true };
  }

  // 2. Fallback to IndexedDB (if offline or server unreachable)
  try {
    const idbItems = await idbLoadAchievements();
    if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
      return { items: idbItems, isServerConnected: false };
    }
  } catch (e) {
    console.warn('IDB load error', e);
  }

  // 3. Fallback to current LocalStorage key
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { items: parsed, isServerConnected: false };
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error', e);
  }

  // 4. Try static /data/achievements.json
  try {
    const staticRes = await fetch(`/data/achievements.json?_t=${Date.now()}`, { cache: 'no-store' });
    const staticData = await parseJsonResponse(staticRes);
    if (Array.isArray(staticData) && staticData.length > 0) {
      return { items: staticData, isServerConnected: false };
    }
  } catch (e) {
    // Continue
  }

  return { items: INITIAL_ACHIEVEMENTS, isServerConnected: false };
}

/**
 * Save achievements permanently to server database and LocalStorage
 */
export async function saveAllAchievements(
  items: Achievement[],
  passcode: string
): Promise<{ success: boolean; mode: 'server' | 'local'; message: string }> {
  // 1. Save to LocalStorage and IndexedDB immediately as client-side cache
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
  idbSaveAchievements(items).catch(() => {});

  // 2. Persist to server filesystem so ALL guests across the internet see the updates!
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
        message: '🟢 Опубліковано на сервері! Усі гості бачать цей документ.',
      };
    }
  } catch (e) {
    // Static Vercel
  }

  return {
    success: true,
    mode: 'local',
    message: '⚠️ Збережено локально. (На статичному Vercel гості не бачать нові файли — використовуйте Render.com!)',
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
