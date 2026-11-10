import React from 'react';
import { Award, Plus, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../types';
import { formatDateUk, getBadgeTierColor } from '../utils/helpers';

interface BadgeWallProps {
  achievements: Achievement[];
  onViewBadge: (badge: Achievement) => void;
  onOpenAddModal: (defaultType?: 'badge') => void;
  isAdmin: boolean;
}

export const BadgeWall: React.FC<BadgeWallProps> = ({
  achievements,
  onViewBadge,
  onOpenAddModal,
  isAdmin,
}) => {
  const badges = achievements.filter((a) => a.type === 'badge');

  const platinumCount = badges.filter((b) => b.badgeTier === 'platinum').length;
  const goldCount = badges.filter((b) => b.badgeTier === 'gold').length;
  const silverCount = badges.filter((b) => b.badgeTier === 'silver').length;

  return (
    <div className="py-8">
      {/* Badge Wall Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 mb-8 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Цифрові Мікро-кваліфікації та Відзнаки</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Стіна Досягнень та Бейджів
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Колекція перевірених цифрових бейджів за хакатони, спеціалізації, технічні виклики та особливі успіхи в навчанні.
            </p>

            {/* Ranks summary */}
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Платина: <strong className="text-white font-mono tabular-nums">{platinumCount}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Золото: <strong className="text-white font-mono tabular-nums">{goldCount}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Срібло: <strong className="text-white font-mono tabular-nums">{silverCount}</strong></span>
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => onOpenAddModal('badge')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Додати новий бейдж</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Поки що немає прикріплених бейджів</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Додай свій перший цифровий бейдж з EPAM, Coursera, HackerRank, Duolingo або іншої платформи.
          </p>
          <button
            type="button"
            onClick={() => onOpenAddModal('badge')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Прикріпити бейдж</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const tierStyle = getBadgeTierColor(badge.badgeTier);

            return (
              <div
                key={badge.id}
                onClick={() => onViewBadge(badge)}
                className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Background ambient lighting */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${tierStyle.bg} blur-2xl opacity-70 pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

                {/* Badge Image / Insignia */}
                <div className="relative mb-4 mt-2">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 bg-slate-100 flex items-center justify-center border border-slate-200/80">
                    {badge.imageUrl ? (
                      <img
                        src={badge.imageUrl}
                        alt={badge.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Award className="w-16 h-16 text-amber-500" />
                    )}
                  </div>

                  {badge.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-md" title="Підтверджений бейдж">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Issuer & Date (Zero-Pill Discipline) */}
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <span className="font-medium text-slate-700">{badge.issuer}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateUk(badge.issueDate)}</span>
                </div>

                {/* Badge Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {badge.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>

                {/* Tier Rank Label */}
                {badge.badgeTier && (
                  <div className={`mt-3 text-xs font-bold uppercase tracking-wider ${tierStyle.text}`}>
                    Ранг: {badge.badgeTier}
                  </div>
                )}

                {/* Skills Preview */}
                {badge.skills && badge.skills.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 w-full text-xs text-slate-500 flex flex-wrap justify-center gap-x-2 gap-y-1">
                    {badge.skills.slice(0, 3).map((s, idx) => (
                      <span key={s} className="text-slate-700">
                        {s}{idx < Math.min(badge.skills.length, 3) - 1 ? ' ·' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Click to inspect prompt */}
                <div className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-700 transition-colors flex items-center gap-1">
                  <span>Переглянути деталі</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
