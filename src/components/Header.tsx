import React from 'react';
import { Award, Plus, Download, Lock, ShieldCheck } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenDownloadProjectModal: () => void;
  onOpenAdminModal: () => void;
  isAdmin: boolean;
  ownerEmail: string;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenDownloadProjectModal,
  onOpenAdminModal,
  isAdmin,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          <img
            src="/assets/aistudio/image_66375011.png"
            alt="Факультет №4 Кіберполіції"
            className="w-9 h-9 rounded-full object-contain shadow-xs border border-slate-200 bg-slate-900"
          />
          <span>EduCred</span>
        </a>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveView('grid')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'grid'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-amber-500 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Галерея досягнень
          </button>
          <button
            type="button"
            onClick={() => setActiveView('badges')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'badges'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-amber-500 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Стіна бейджів
          </button>
          <button
            type="button"
            onClick={() => setActiveView('timeline')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'timeline'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-amber-500 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Хронологія
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenDownloadProjectModal}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Скачати сайт</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action (with Admin status toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Панель власника сайту"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Адмін</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Додати досягнення</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Вхід для власника</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
