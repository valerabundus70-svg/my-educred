/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Achievement, AchievementType, SortOption, ViewMode } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { AchievementCard } from './components/AchievementCard';
import { BadgeWall } from './components/BadgeWall';
import { TimelineView } from './components/TimelineView';
import { AchievementModal } from './components/AchievementModal';
import { CertificateViewerModal } from './components/CertificateViewerModal';
import { BackupModal } from './components/BackupModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ProjectDownloadModal } from './components/ProjectDownloadModal';
import { Award, Plus, CheckCircle2, ShieldCheck, Eye, Lock } from 'lucide-react';

import {
  fetchAllAchievements,
  saveAllAchievements,
  verifyAdminPasscode,
  STORAGE_KEY,
  PASSCODE_STORAGE_KEY,
} from './utils/apiSync';
import { INITIAL_ACHIEVEMENTS } from './data/initialAchievements';

const OWNER_EMAIL = 'valerabundus70@gmail.com';

export default function App() {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse achievements from localStorage', e);
    }
    return INITIAL_ACHIEVEMENTS;
  });

  // CRITICAL: Visitors MUST start in Guest Mode (isAdmin = false).
  // Only users who explicitly logged in on this browser have isAdmin = true!
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('educred_is_admin') === 'true';
  });

  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || 'admin2024';
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AchievementType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [activeView, setActiveView] = useState<ViewMode>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<AchievementType>('certificate');
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [viewingAchievement, setViewingAchievement] = useState<Achievement | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // 1. Fetch public achievements on mount across local, cloud backend and static storage so ALL visitors see what the owner posted!
  useEffect(() => {
    fetchAllAchievements().then((items) => {
      if (Array.isArray(items)) {
        setAchievements(items);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state to server database, cloud backend and localStorage
  const syncAchievements = async (newItems: Achievement[]) => {
    setAchievements(newItems);
    const result = await saveAllAchievements(newItems, adminPasscode);
    showToast(result.message);
  };

  // Admin login via server/cloud API
  const handleAdminLogin = async (entered: string): Promise<boolean> => {
    const success = await verifyAdminPasscode(entered);
    if (success) {
      setIsAdmin(true);
      setAdminPasscode(entered);
      localStorage.setItem(PASSCODE_STORAGE_KEY, entered);
      localStorage.setItem('educred_is_admin', 'true');
      showToast('Вхід успішний! Права адміністратора активовано.');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('educred_is_admin');
    showToast('Ви перейшли у публічний режим перегляду (як гість).');
  };

  const handleChangePasscode = async (oldPass: string, newPass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPasscode: oldPass, newPasscode: newPass }),
      });
      const data = await res.json();
      if (data && data.success) {
        setAdminPasscode(newPass);
        localStorage.setItem(PASSCODE_STORAGE_KEY, newPass);
        showToast('Пароль адміністратора оновлено!');
        return true;
      }
    } catch (e) {
      if (oldPass === adminPasscode) {
        setAdminPasscode(newPass);
        localStorage.setItem(PASSCODE_STORAGE_KEY, newPass);
        showToast('Пароль адміністратора оновлено (локально)!');
        return true;
      }
    }
    return false;
  };

  // KPIs
  const totalCount = achievements.length;
  const badgeCount = useMemo(() => achievements.filter((a) => a.type === 'badge').length, [achievements]);
  const totalHours = useMemo(
    () => achievements.reduce((acc, curr) => acc + (curr.learningHours || 0), 0),
    [achievements]
  );
  const uniqueSkillsCount = useMemo(() => {
    const allSkills = new Set<string>();
    achievements.forEach((a) => {
      if (Array.isArray(a.skills)) {
        a.skills.forEach((s) => allSkills.add(s.trim().toLowerCase()));
      }
    });
    return allSkills.size;
  }, [achievements]);

  // Filtered & Sorted achievements
  const filteredAchievements = useMemo(() => {
    return achievements
      .filter((item) => {
        if (!item) return false;
        // Type filter
        if (selectedType !== 'all' && item.type !== selectedType) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchIssuer = (item.issuer || '').toLowerCase().includes(q);
          const matchId = item.credentialId ? item.credentialId.toLowerCase().includes(q) : false;
          const matchSkills = Array.isArray(item.skills)
            ? item.skills.some((s) => typeof s === 'string' && s.toLowerCase().includes(q))
            : false;
          const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchIssuer && !matchId && !matchSkills && !matchDesc) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
        const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
        if (sortBy === 'date-desc') {
          return dateB - dateA;
        }
        if (sortBy === 'date-asc') {
          return dateA - dateB;
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '', 'uk');
        }
        if (sortBy === 'hours') {
          return (b.learningHours || 0) - (a.learningHours || 0);
        }
        return 0;
      });
  }, [achievements, selectedType, searchQuery, sortBy]);

  // Handlers
  const handleOpenAddModal = (defaultType: AchievementType = 'certificate') => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    setEditingAchievement(null);
    setModalDefaultType(defaultType);
    setIsAddModalOpen(true);
  };

  const handleEditAchievement = (item: Achievement) => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    setEditingAchievement(item);
    setIsAddModalOpen(true);
  };

  const handleSaveAchievement = (savedItem: Achievement) => {
    const exists = achievements.some((item) => item.id === savedItem.id);
    const updated = exists
      ? achievements.map((item) => (item.id === savedItem.id ? savedItem : item))
      : [savedItem, ...achievements];

    syncAchievements(updated);
  };

  const handleDeleteAchievement = (id: string) => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    const itemToDelete = achievements.find((a) => a.id === id);
    if (!itemToDelete) return;

    if (window.confirm(`Ви дійсно бажаєте видалити "${itemToDelete.title}"?`)) {
      const updated = achievements.filter((a) => a.id !== id);
      syncAchievements(updated);
      if (viewingAchievement?.id === id) {
        setViewingAchievement(null);
      }
      showToast('Досягнення видалено.');
    }
  };

  const handleResetAchievements = () => {
    syncAchievements([]);
    showToast('Реєстр очищено.');
  };

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Banner indicating Admin Status & Visitor Protection */}
      <div className={`px-4 py-2 text-xs border-b flex items-center justify-between gap-4 transition-colors ${
        isAdmin
          ? 'bg-emerald-900 text-emerald-100 border-emerald-800'
          : 'bg-slate-900 text-slate-200 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  <strong>Ви увійшли як адміністратор</strong> ({OWNER_EMAIL}). Усі додані сертифікати автоматично публікуються для всіх відвідувачів.
                </span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Режим гостя (Публічний перегляд):</strong> Ви переглядаєте офіційне портфоліо досягнень.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => handleAdminLogout()}
                  className="hover:underline flex items-center gap-1 text-emerald-200 hover:text-white cursor-pointer font-medium"
                  title="Подивитися, як сайт виглядає для звичайних відвідувачів"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Перейти в режим гостя</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                >
                  Панель пароля
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1 rounded text-[11px] font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Lock className="w-3 h-3" />
                <span>Вхід для власника</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Bar Header */}
      <Header
        onOpenAddModal={() => handleOpenAddModal('certificate')}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenDownloadProjectModal={() => {
          if (!isAdmin) {
            setIsAdminModalOpen(true);
            return;
          }
          setIsDownloadModalOpen(true);
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isAdmin={isAdmin}
        ownerEmail={OWNER_EMAIL}
        activeView={activeView}
        setActiveView={setActiveView}
        totalCount={totalCount}
      />

      {/* Hero Section */}
      <Hero
        totalCount={totalCount}
        badgeCount={badgeCount}
        totalHours={totalHours}
        uniqueSkillsCount={uniqueSkillsCount}
        onOpenAddModal={() => handleOpenAddModal('certificate')}
        onExploreClick={scrollToGallery}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Filter and Mode Bar */}
      <div ref={galleryRef}>
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeView={activeView}
          setActiveView={setActiveView}
          totalFilteredCount={filteredAchievements.length}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'badges' ? (
          <BadgeWall
            achievements={achievements}
            onViewBadge={(b) => setViewingAchievement(b)}
            onOpenAddModal={() => handleOpenAddModal('badge')}
            isAdmin={isAdmin}
          />
        ) : activeView === 'timeline' ? (
          <TimelineView
            achievements={filteredAchievements}
            onView={(a) => setViewingAchievement(a)}
          />
        ) : (
          /* Grid View */
          <div>
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-slate-300 max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isAdmin ? 'Ваше портфоліо готове до наповнення!' : 'Портфоліо поки що не містить опублікованих документів'}
                </h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  {isAdmin
                    ? 'Прикріпіть перший сертифікат або бейдж. Усі додані матеріали будуть одразу доступні кожному за вашим публічним посиланням!'
                    : 'Власник портфоліо ще наповнює цей реєстр. Завітайте пізніше або зв\'яжіться з власником.'}
                </p>
                {isAdmin ? (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal('certificate')}
                      className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Прикріпити перше досягнення</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal('badge')}
                      className="px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Додати бейдж</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setIsAdminModalOpen(true)}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-amber-800" />
                      <span>Увійти як власник, щоб додати сертифікати</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((item) => (
                  <AchievementCard
                    key={item.id}
                    achievement={item}
                    onView={(a) => setViewingAchievement(a)}
                    onEdit={(a) => handleEditAchievement(a)}
                    onDelete={(id) => handleDeleteAchievement(id)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">EduCred</span>
            <span aria-hidden="true">·</span>
            <span>Власник: {OWNER_EMAIL}</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="hover:text-slate-900 transition-colors cursor-pointer font-semibold text-slate-700"
                >
                  Скачати сайт (ZIP / HTML)
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Експорт JSON
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer font-medium text-slate-700"
            >
              {isAdmin ? 'Пароль адміна' : 'Вхід для власника'}
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AchievementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAchievement}
        initialData={editingAchievement}
        defaultType={modalDefaultType}
      />

      <CertificateViewerModal
        achievement={viewingAchievement}
        onClose={() => setViewingAchievement(null)}
        onEdit={(a) => handleEditAchievement(a)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        achievements={achievements}
        onImportAchievements={(newItems) => {
          syncAchievements(newItems);
          showToast(`Імпортовано ${newItems.length} документів!`);
        }}
        onResetAchievements={handleResetAchievements}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onChangePasscode={handleChangePasscode}
        ownerEmail={OWNER_EMAIL}
      />

      <ProjectDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        achievements={achievements}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />
    </div>
  );
}
