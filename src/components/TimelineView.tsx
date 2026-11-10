import React from 'react';
import { Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../types';
import { formatDateUk, TYPE_LABELS } from '../utils/helpers';

interface TimelineViewProps {
  achievements: Achievement[];
  onView: (achievement: Achievement) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ achievements, onView }) => {
  // Sort achievements descending by date
  const sorted = [...achievements].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  // Group by year
  const groupedByYear = sorted.reduce<Record<string, Achievement[]>>((acc, item) => {
    const year = item.issueDate ? new Date(item.issueDate).getFullYear().toString() : 'Невідомо';
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  if (achievements.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 max-w-xl mx-auto">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Хронологія поки що порожня</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Додайте свій перший сертифікат, курс або диплом із зазначенням дати, щоб побачити лінію часу вашого навчання.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Хронологія Розвитку & Освіти</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Твій шлях безперервного навчання
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          Хронологічний реєстр здобутих знань, дипломів, курсів та сертифікатів за роками.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-32 space-y-12">
        {years.map((year) => {
          const yearItems = groupedByYear[year];
          const totalHoursInYear = yearItems.reduce((acc, i) => acc + (i.learningHours || 0), 0);

          return (
            <div key={year} className="relative">
              {/* Year marker on timeline */}
              <div className="absolute -left-[17px] sm:-left-36 top-0 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-md ring-4 ring-white">
                  {year.slice(-2)}
                </div>
                <div className="hidden sm:block text-right w-24">
                  <span className="text-base font-extrabold text-slate-900 font-mono">{year}</span>
                  <div className="text-[11px] text-slate-500">{yearItems.length} здобутків</div>
                </div>
              </div>

              {/* Items for this year */}
              <div className="pl-6 sm:pl-8 space-y-6 pt-2">
                <div className="sm:hidden text-lg font-bold text-slate-900 font-mono mb-2">
                  {year} рік ({yearItems.length} здобутків)
                </div>

                {yearItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onView(item)}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Clean unboxed metadata with separators */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                          <span className="font-semibold text-slate-800">{item.issuer}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDateUk(item.issueDate)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{TYPE_LABELS[item.type]}</span>
                          {item.learningHours && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{item.learningHours} год</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {item.title}
                        </h3>

                        {item.score && (
                          <div className="mt-1 text-xs text-amber-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Результат: {item.score}</span>
                          </div>
                        )}

                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Skills */}
                        {item.skills && item.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600">
                            {item.skills.map((skill, sIdx) => (
                              <span key={skill} className="text-slate-700 font-medium">
                                {skill}{sIdx < item.skills.length - 1 ? ' ·' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail if present */}
                      {item.imageUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 hidden sm:block">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="uppercase font-medium text-slate-600">
                        {item.fileFormat ? item.fileFormat : TYPE_LABELS[item.type]}
                        {item.fileSize ? ` · ${item.fileSize}` : ''}
                      </span>
                      <span className="text-slate-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Детальніше <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
