import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Edit3,
  Save,
  X,
  Terminal,
  Box,
  Shield,
  User,
  Trophy,
  Activity,
  Link as LinkIcon,
  Check,
  Copy,
  FileText,
} from 'lucide-react';
import { CyberPlatformId, CyberPlatformProfile } from '../types';

interface CyberPlatformViewProps {
  platform: CyberPlatformId;
  profile: CyberPlatformProfile;
  isAdmin: boolean;
  ownerName: string;
  onSaveProfile: (updated: CyberPlatformProfile) => Promise<void>;
  onOpenAdminModal: () => void;
}

const PLATFORM_META: Record<
  CyberPlatformId,
  {
    name: string;
    tagline: string;
    urlPlaceholder: string;
    usernamePlaceholder: string;
    rankPlaceholder: string;
    statsPlaceholder: string;
    summaryPlaceholder: string;
    gradient: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    buttonClass: string;
  }
> = {
  tryhackme: {
    name: 'TryHackMe',
    tagline: 'Практична платформа з кібербезпеки, тестування на проникнення та кіберзахисту (Blue / Red Team)',
    urlPlaceholder: 'https://tryhackme.com/p/your-username',
    usernamePlaceholder: 'Наприклад: valerii_bundus',
    rankPlaceholder: 'Наприклад: Top 5% · [0x9][Hacker]',
    statsPlaceholder: 'Наприклад: 45 кімнат · 12 бейджів · Streak 30 днів',
    summaryPlaceholder:
      'Вставте сюди інформацію з вашої сторінки TryHackMe:\n• Пройдені навчальні шляхи (Pre Security, Jr Penetration Tester, SOC Level 1...)\n• Отримані сертифікати та значки\n• Ключові кімнати та навички (Linux, Nmap, Burp Suite, Wireshark...)',
    gradient: 'from-slate-950 via-[#1a0b10] to-slate-900',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/15',
    accentBorder: 'border-rose-500/30',
    buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white',
  },
  hackthebox: {
    name: 'Hack The Box',
    tagline: 'Платформа тренувань із наступальної та оборонної кібербезпеки, проходження машин та CTF-змагань',
    urlPlaceholder: 'https://app.hackthebox.com/profile/123456',
    usernamePlaceholder: 'Наприклад: valerii_htb',
    rankPlaceholder: 'Наприклад: Hacker · Pro Hacker · Script Kiddie',
    statsPlaceholder: 'Наприклад: 18 User Owns · 12 System Owns · 320 балів',
    summaryPlaceholder:
      'Вставте сюди інформацію з вашої сторінки Hack The Box:\n• Пройдені машини та Starting Point\n• Здобуті бали, ранг та позиція у рейтингу\n• Модулі HTB Academy та CTF-досягнення',
    gradient: 'from-slate-950 via-[#0a160c] to-slate-900',
    accentText: 'text-lime-400',
    accentBg: 'bg-lime-500/15',
    accentBorder: 'border-lime-500/30',
    buttonClass: 'bg-lime-400 hover:bg-lime-300 text-slate-950',
  },
};

function normalizeExternalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const CyberPlatformView: React.FC<CyberPlatformViewProps> = ({
  platform,
  profile,
  isAdmin,
  ownerName,
  onSaveProfile,
  onOpenAdminModal,
}) => {
  const meta = PLATFORM_META[platform];
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [profileUrl, setProfileUrl] = useState(profile.profileUrl || '');
  const [username, setUsername] = useState(profile.username || '');
  const [rank, setRank] = useState(profile.rank || '');
  const [stats, setStats] = useState(profile.stats || '');
  const [summary, setSummary] = useState(profile.summary || '');

  useEffect(() => {
    setProfileUrl(profile.profileUrl || '');
    setUsername(profile.username || '');
    setRank(profile.rank || '');
    setStats(profile.stats || '');
    setSummary(profile.summary || '');
    setIsEditing(false);
  }, [platform, profile]);

  const normalizedUrl = normalizeExternalUrl(profile.profileUrl || '');
  const hasContent = Boolean(
    profile.profileUrl?.trim() ||
      profile.username?.trim() ||
      profile.rank?.trim() ||
      profile.stats?.trim() ||
      profile.summary?.trim()
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile({
        platform,
        profileUrl: profileUrl.trim(),
        username: username.trim(),
        rank: rank.trim(),
        stats: stats.trim(),
        summary: summary.trim(),
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!normalizedUrl) return;
    navigator.clipboard.writeText(normalizedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="py-4 space-y-6">
      {/* Platform Header Banner */}
      <div className={`bg-gradient-to-br ${meta.gradient} text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${meta.accentText}`}>
              {platform === 'tryhackme' ? (
                <Terminal className="w-4 h-4" />
              ) : (
                <Box className="w-4 h-4" />
              )}
              <span>Профіль платформи · {ownerName}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {meta.name}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {meta.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {normalizedUrl && (
              <>
                <a
                  href={normalizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-2 ${meta.buttonClass}`}
                >
                  <span>Відкрити профіль {meta.name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Копіювати посилання на профіль"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Скопійовано' : 'Копіювати'}</span>
                </button>
              </>
            )}

            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{hasContent ? 'Редагувати дані' : 'Додати посилання та дані'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Edit Form */}
      {isAdmin && isEditing ? (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Налаштування профілю {meta.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Вставте посилання на ваш профіль та будь-яку інформацію зі сторінки сайту. Після збереження її бачитимуть усі гості.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Посилання на сторінку профілю {meta.name} (URL)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder={meta.urlPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Нікнейм / Імʼя на платформі
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={meta.usernamePlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ранг / Позиція в рейтингу
              </label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder={meta.rankPlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Пройдені кімнати / Машини / Бали
              </label>
              <input
                type="text"
                value={stats}
                onChange={(e) => setStats(e.target.value)}
                placeholder={meta.statsPlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Інформація зі сторінки {meta.name} (досягнення, модулі, опис)
              </label>
              <textarea
                rows={7}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={meta.summaryPlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSaving ? 'Збереження...' : 'Зберегти та опублікувати'}</span>
            </button>
          </div>
        </form>
      ) : !hasContent ? (
        /* Empty State */
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-slate-300 max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            {platform === 'tryhackme' ? (
              <Terminal className="w-7 h-7 text-rose-600" />
            ) : (
              <Box className="w-7 h-7 text-emerald-700" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {isAdmin
              ? `Додайте свій профіль ${meta.name}`
              : `Інформація про профіль ${meta.name} ще не заповнена`}
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            {isAdmin
              ? `Вставте посилання на ваш обліковий запис ${meta.name}, ранг та детальну інформацію зі сторінки сайту, щоб гості могли переглянути ваші практичні навички.`
              : `Власник портфоліо (${ownerName}) ще не додав посилання та статистику з платформи ${meta.name}.`}
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Заповнити вкладку {meta.name}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Filled Profile View */
        <div className="space-y-6">
          {/* Quick Profile Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Профіль / Нікнейм</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {profile.username || ownerName}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Ранг / Статус</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {profile.rank || 'Не вказано'}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Активність та бали</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {profile.stats || 'Не вказано'}
              </div>
            </div>
          </div>

          {/* Link Bar Card */}
          {normalizedUrl && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 mb-0.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Посилання на сторінку {meta.name}</span>
                </div>
                <a
                  href={normalizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-sky-700 hover:underline break-all"
                >
                  {normalizedUrl}
                </a>
              </div>
              <a
                href={normalizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <span>Перейти на сайт</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Detailed Information Block */}
          {profile.summary && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Інформація зі сторінки {meta.name}</span>
              </div>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {profile.summary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
