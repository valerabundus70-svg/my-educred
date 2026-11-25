import React from 'react';
import {
  Award,
  ShieldCheck,
  Sparkles,
  Clock,
  BookOpen,
  Layers,
  Terminal,
  Box,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import { CyberPlatformId, CyberProfilesMap } from '../types';

interface HeroProps {
  totalCount: number;
  badgeCount: number;
  totalHours: number;
  uniqueSkillsCount: number;
  onOpenAddModal: () => void;
  onExploreClick: () => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  ownerName: string;
  cyberProfiles: CyberProfilesMap;
  onSelectPlatformTab: (platform: CyberPlatformId) => void;
}

function normalizeUrl(raw?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const Hero: React.FC<HeroProps> = ({
  totalCount,
  badgeCount,
  totalHours,
  uniqueSkillsCount,
  onOpenAddModal,
  onExploreClick,
  isAdmin,
  onOpenAdminModal,
  ownerName,
  cyberProfiles,
  onSelectPlatformTab,
}) => {
  const thmUrl = normalizeUrl(cyberProfiles?.tryhackme?.profileUrl);
  const htbUrl = normalizeUrl(cyberProfiles?.hackthebox?.profileUrl);

  return (
    <section className="pt-8 pb-12 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="text-xs font-semibold tracking-wider text-amber-700 uppercase mb-3 flex flex-wrap items-center gap-1.5">
              <span>ХНУВС · Факультет №4 (Кіберполіція)</span>
              <span aria-hidden="true">·</span>
              <span>Спеціальність 125(F5)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Навчальні Досягнення
            </h1>

            <div className="mt-3 flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-800">
              <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{ownerName}</span>
            </div>

            <p className="mt-2.5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
              Курсант Харківського національного університету внутрішніх справ за спеціальністю 125(F5) &quot;Кібербезпека та захист&quot;
            </p>

            {/* Primary Actions */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Прикріпити новий сертифікат</span>
                </button>
              )}
              <button
                type="button"
                onClick={onExploreClick}
                className={`px-5 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  isAdmin
                    ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    : 'text-white bg-slate-900 hover:bg-slate-800 shadow-sm'
                }`}
              >
                Переглянути галерею
              </button>
            </div>

            {/* TryHackMe & Hack The Box Profile Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {thmUrl ? (
                <a
                  href={thmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Профіль TryHackMe</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlatformTab('tryhackme')}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Профіль TryHackMe</span>
                </button>
              )}

              {htbUrl ? (
                <a
                  href={htbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-lime-400 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  <span>Профіль Hack The Box</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlatformTab('hackthebox')}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-lime-400 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Box className="w-4 h-4" />
                  <span>Профіль Hack The Box</span>
                </button>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Автоматичне збереження в браузері</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Підтримка файлів та зображень</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Frame */}
          <div className="lg:col-span-5 relative">
            <div className="h-full min-h-[340px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-slate-800 relative group shadow-lg bg-gradient-to-br from-[#060a17] via-[#0a1128] to-[#040714] flex items-center justify-center p-6">
              <img
                src="/assets/aistudio/image_9a965c60.png"
                alt="Кіберполіція України"
                className="w-48 sm:w-56 h-auto object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating verified badge card on image */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 text-slate-900 shadow-lg flex items-center gap-3">
                <img
                  src="/assets/aistudio/image_66375011.png"
                  alt="Факультет №4 Кіберполіції"
                  className="w-12 h-12 rounded-full object-contain shrink-0 border border-slate-200 shadow-xs bg-slate-900 p-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                    <span className="font-semibold text-slate-900 flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {ownerName}
                    </span>
                    <span className="font-mono text-[11px] shrink-0">{new Date().getFullYear()}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    Харківський національний університет внутрішніх справ
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span>Факультет №4 (Кіберполіція)</span>
                    <span aria-hidden="true">·</span>
                    <span>{totalCount} док.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Metric Strip below split */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Всього документів</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {totalCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Сертифікати та дипломи</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Цифрові бейджі</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {badgeCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Мікро-кваліфікації</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Годин навчання</span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {totalHours.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Академічних годин</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Підтверджені навички</span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {uniqueSkillsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Технологій та дисциплін</div>
          </div>
        </div>
      </div>
    </section>
  );
};
