import React from 'react';
import { Search, LayoutGrid, Award, Calendar, ArrowUpDown, X } from 'lucide-react';
import { AchievementType, SortOption, ViewMode } from '../types';
import { TYPE_LABELS } from '../utils/helpers';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedType: AchievementType | 'all';
  setSelectedType: (type: AchievementType | 'all') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  sortBy,
  setSortBy,
  activeView,
  setActiveView,
  totalFilteredCount,
}) => {
  const types: (AchievementType | 'all')[] = ['all', 'certificate', 'badge', 'diploma', 'course', 'award'];

  return (
    <div className="bg-white border-b border-slate-200 py-4 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Search, View Mode Buttons, and Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою, організацією, навичками..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-end">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveView('grid')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Картки та галерея"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Галерея</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('badges')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'badges'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Стіна бейджів"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Бейджі</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('timeline')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'timeline'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Хронологія навчання"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Хронологія</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="date-desc">Найновіші спочатку</option>
                <option value="date-asc">Найстаріші спочатку</option>
                <option value="title">За назвою</option>
                <option value="hours">За годинами</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Type Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 mr-1 text-xs shrink-0">Тип:</span>
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedType === t
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t === 'all' ? 'Всі документи' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Всього: <strong className="text-slate-800 font-semibold">{totalFilteredCount}</strong>
            </span>
            {(searchQuery || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="text-amber-700 hover:text-amber-800 font-medium hover:underline cursor-pointer"
              >
                Скинути
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
