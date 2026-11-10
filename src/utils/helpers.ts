import { AchievementType } from '../types';

export function formatDateUk(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('uk-UA', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export const TYPE_LABELS: Record<AchievementType, string> = {
  certificate: 'Сертифікат',
  badge: 'Бейдж',
  diploma: 'Диплом',
  course: 'Курс',
  award: 'Нагорода',
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function detectFileFormat(filename: string, mime?: string): 'pdf' | 'image' | 'doc' | 'archive' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mime?.startsWith('image/')) {
    return 'image';
  }
  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'pdf';
  }
  if (['doc', 'docx', 'rtf', 'odt', 'txt'].includes(ext)) {
    return 'doc';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }
  return 'other';
}

export function getBadgeTierColor(tier?: string): { ring: string; text: string; bg: string } {
  switch (tier) {
    case 'platinum':
      return {
        ring: 'ring-cyan-400/40 border-cyan-400',
        text: 'text-cyan-700 dark:text-cyan-300',
        bg: 'from-cyan-500/10 to-blue-500/10',
      };
    case 'gold':
      return {
        ring: 'ring-amber-400/40 border-amber-400',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'from-amber-500/10 to-yellow-500/10',
      };
    case 'silver':
      return {
        ring: 'ring-slate-300 border-slate-300',
        text: 'text-slate-600 dark:text-slate-300',
        bg: 'from-slate-400/10 to-zinc-400/10',
      };
    case 'bronze':
    default:
      return {
        ring: 'ring-amber-700/30 border-amber-700/30',
        text: 'text-amber-800 dark:text-amber-600',
        bg: 'from-amber-700/10 to-orange-700/10',
      };
  }
}

/**
 * Optimizes image data URL to ensure fast cross-device sync and compact database storage
 */
export function optimizeImageBase64(dataUrl: string, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim && dataUrl.length < 350000) {
        resolve(dataUrl);
        return;
      }
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const mime = dataUrl.startsWith('data:image/png') && dataUrl.length < 400000 ? 'image/png' : 'image/jpeg';
      const optimized = canvas.toDataURL(mime, quality);
      resolve(optimized);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
