import React from 'react';
import { ExternalLink, Eye, Edit3, Trash2, ShieldCheck, Award, FileText, CheckCircle2, Download, File, Archive } from 'lucide-react';
import { Achievement } from '../types';
import { formatDateUk, TYPE_LABELS, getBadgeTierColor } from '../utils/helpers';

interface AchievementCardProps {
  achievement: Achievement;
  onView: (achievement: Achievement) => void;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onView,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const isImage = achievement.imageUrl && (achievement.fileFormat === 'image' || !achievement.fileFormat);

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Media / Visual Container */}
        <div
          onClick={() => onView(achievement)}
          className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 cursor-pointer border-b border-slate-100"
        >
          {isImage ? (
            <img
              src={achievement.imageUrl}
              alt={achievement.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : achievement.fileFormat === 'pdf' ? (
            /* Dedicated PDF Preview Display */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50 to-slate-100 text-slate-700">
              <div className="w-14 h-14 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-2 shadow-xs border border-red-200">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider text-center">
                PDF Документ
              </span>
              <span className="text-[11px] text-slate-500 text-center mt-1 truncate max-w-[200px]">
                {achievement.fileName || achievement.title}
              </span>
              {achievement.fileSize && (
                <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {achievement.fileSize}
                </span>
              )}
            </div>
          ) : achievement.fileFormat === 'doc' ? (
            /* Dedicated Word/Doc Preview Display */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-slate-100 text-slate-700">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-xs border border-blue-200">
                <File className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider text-center">
                Word Документ
              </span>
              <span className="text-[11px] text-slate-500 text-center mt-1 truncate max-w-[200px]">
                {achievement.fileName || achievement.title}
              </span>
            </div>
          ) : achievement.fileFormat === 'archive' ? (
            /* Dedicated Archive Display */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-slate-100 text-slate-700">
              <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 shadow-xs border border-amber-200">
                <Archive className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider text-center">
                Архів (ZIP)
              </span>
              <span className="text-[11px] text-slate-500 text-center mt-1 truncate max-w-[200px]">
                {achievement.fileName || achievement.title}
              </span>
            </div>
          ) : (
            /* Fallback Container with styled typography & icon */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
              {achievement.type === 'badge' ? (
                <Award className="w-12 h-12 text-amber-600/70 mb-2" />
              ) : (
                <FileText className="w-12 h-12 text-slate-400 mb-2" />
              )}
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider text-center">
                {TYPE_LABELS[achievement.type]}
              </span>
              <span className="text-[11px] text-slate-500 text-center mt-1 truncate max-w-full">
                {achievement.issuer}
              </span>
            </div>
          )}

          {/* Type tag as quiet top-right indicator */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-xs font-medium text-slate-800 shadow-xs border border-slate-200/50">
            {TYPE_LABELS[achievement.type]}
          </div>

          {/* Verified indicator if applicable */}
          {achievement.isVerified && (
            <div className="absolute top-3 left-3 bg-emerald-500/90 text-white p-1 rounded backdrop-blur-xs shadow-xs" title="Підтверджений сертифікат">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Quick Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-3 py-1.5 bg-white text-slate-900 text-xs font-medium rounded-md shadow-sm flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Переглянути документ</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Metadata Discipline: Clean unboxed metadata with typographic separators (NO PILLS) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
            <span className="font-medium text-slate-700">{achievement.issuer}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDateUk(achievement.issueDate)}</span>
            {achievement.learningHours ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">{achievement.learningHours} год</span>
              </>
            ) : null}
          </div>

          {/* Title */}
          <h3
            onClick={() => onView(achievement)}
            className="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors cursor-pointer line-clamp-2"
          >
            {achievement.title}
          </h3>

          {/* Score / Grade if present */}
          {achievement.score && (
            <div className="mt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Результат: {achievement.score}</span>
            </div>
          )}

          {/* Description snippet */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {achievement.description}
          </p>

          {/* Skills rendered as quiet text list with dividers */}
          {achievement.skills && achievement.skills.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Навички:</div>
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-2 gap-y-1">
                {achievement.skills.slice(0, 4).map((skill, idx) => (
                  <span key={skill} className="text-slate-700">
                    {skill}{idx < Math.min(achievement.skills.length, 4) - 1 ? ' ·' : ''}
                  </span>
                ))}
                {achievement.skills.length > 4 && (
                  <span className="text-slate-400 text-xs">+{achievement.skills.length - 4} ще</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
        <div className="text-slate-500 text-[11px] flex items-center gap-1.5 truncate max-w-[50%]">
          <span className="font-semibold text-slate-700 uppercase">
            {achievement.fileFormat ? achievement.fileFormat : TYPE_LABELS[achievement.type]}
          </span>
          {achievement.fileSize && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{achievement.fileSize}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {achievement.fileUrl && (
            <a
              href={achievement.fileUrl}
              download={achievement.fileName || `${achievement.title}`}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
              title="Завантажити оригінал файлу"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
          {achievement.credentialUrl && (
            <a
              href={achievement.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
              title="Перевірити онлайн"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => onEdit(achievement)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                title="Редагувати"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(achievement.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                title="Видалити"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
