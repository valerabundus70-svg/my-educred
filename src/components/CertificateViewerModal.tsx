import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck, Calendar, Clock, Award, FileText, Printer, Edit3, Download, File, Archive } from 'lucide-react';
import { Achievement } from '../types';
import { formatDateUk, TYPE_LABELS, getBadgeTierColor } from '../utils/helpers';

interface CertificateViewerModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  onEdit: (achievement: Achievement) => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  achievement,
  onClose,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);

  if (!achievement) return null;

  const handleCopyId = () => {
    if (achievement.credentialId) {
      navigator.clipboard.writeText(achievement.credentialId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tierStyle = achievement.badgeTier ? getBadgeTierColor(achievement.badgeTier) : null;
  const isImage = achievement.imageUrl && (achievement.fileFormat === 'image' || !achievement.fileFormat);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{achievement.issuer}</span>
            <span aria-hidden="true">·</span>
            <span>{TYPE_LABELS[achievement.type]}</span>
            {achievement.fileFormat && (
              <>
                <span aria-hidden="true">·</span>
                <span className="uppercase font-semibold text-slate-700">{achievement.fileFormat}</span>
              </>
            )}
            {achievement.fileSize && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{achievement.fileSize}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              title="Роздрукувати картку"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(achievement);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              title="Редагувати"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split between visual certificate and detailed metadata */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Visual Preview Left/Center */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-sm relative group flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
                {isImage ? (
                  <img
                    src={achievement.imageUrl}
                    alt={achievement.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[460px] object-contain"
                  />
                ) : achievement.fileFormat === 'pdf' ? (
                  <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-red-50/50 to-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-sm border border-red-200">
                      <FileText className="w-10 h-10" />
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {achievement.fileName || achievement.title}
                    </span>
                    <span className="text-xs text-red-700 font-semibold uppercase tracking-wider mt-1">
                      Офіційний PDF Документ {achievement.fileSize ? `· ${achievement.fileSize}` : ''}
                    </span>
                    {achievement.fileUrl && (
                      <a
                        href={achievement.fileUrl}
                        download={achievement.fileName || `${achievement.title}.pdf`}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Відкрити / Завантажити PDF</span>
                      </a>
                    )}
                  </div>
                ) : achievement.fileFormat === 'doc' ? (
                  <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50/50 to-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm border border-blue-200">
                      <File className="w-10 h-10" />
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {achievement.fileName || achievement.title}
                    </span>
                    <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider mt-1">
                      Документ Word {achievement.fileSize ? `· ${achievement.fileSize}` : ''}
                    </span>
                    {achievement.fileUrl && (
                      <a
                        href={achievement.fileUrl}
                        download={achievement.fileName || `${achievement.title}.docx`}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Завантажити документ</span>
                      </a>
                    )}
                  </div>
                ) : achievement.fileFormat === 'archive' ? (
                  <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-amber-50/50 to-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                      <Archive className="w-10 h-10" />
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {achievement.fileName || achievement.title}
                    </span>
                    <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider mt-1">
                      Архів файлів {achievement.fileSize ? `· ${achievement.fileSize}` : ''}
                    </span>
                    {achievement.fileUrl && (
                      <a
                        href={achievement.fileUrl}
                        download={achievement.fileName || `${achievement.title}.zip`}
                        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Завантажити архів</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    {achievement.type === 'badge' ? (
                      <Award className="w-24 h-24 text-amber-500 mb-3" />
                    ) : (
                      <FileText className="w-24 h-24 text-slate-400 mb-3" />
                    )}
                    <span className="text-sm font-semibold text-slate-700">
                      Офіційний документ {achievement.issuer}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {achievement.fileName || 'Файл документа'}
                    </span>
                  </div>
                )}

                {achievement.isVerified && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Верифіковано</span>
                  </div>
                )}
              </div>

              {/* Action buttons below media */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5 w-full">
                {achievement.fileUrl && (
                  <a
                    href={achievement.fileUrl}
                    download={achievement.fileName || achievement.title}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Завантажити оригінал ({achievement.fileName || achievement.fileFormat?.toUpperCase() || 'файл'})</span>
                  </a>
                )}
                {achievement.credentialUrl && (
                  <a
                    href={achievement.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Перевірити онлайн</span>
                  </a>
                )}
              </div>
            </div>

            {/* Metadata and Specs Right */}
            <div className="md:col-span-5 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {achievement.title}
                </h2>
                <div className="mt-1 text-sm text-slate-600 font-medium">
                  {achievement.issuer}
                </div>
              </div>

              {/* Key attributes grid */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                {/* Date */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Дата видачі:</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatDateUk(achievement.issueDate)}
                  </span>
                </div>

                {/* Expiry */}
                {achievement.expiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Діє до:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateUk(achievement.expiryDate)}
                    </span>
                  </div>
                )}

                {/* Hours */}
                {achievement.learningHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Обсяг навчання:</span>
                    </span>
                    <span className="font-semibold text-slate-800 font-mono tabular-nums">
                      {achievement.learningHours} годин
                    </span>
                  </div>
                )}

                {/* Score */}
                {achievement.score && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Результат / Оцінка:</span>
                    <span className="font-bold text-amber-700">
                      {achievement.score}
                    </span>
                  </div>
                )}

                {/* Badge tier */}
                {achievement.badgeTier && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ранг нагороди:</span>
                    <span className="font-bold uppercase tracking-wider text-slate-800">
                      {achievement.badgeTier}
                    </span>
                  </div>
                )}

                {/* Credential ID */}
                {achievement.credentialId && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-slate-500 mb-1">Ідентифікатор документа (ID):</div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                      <span className="truncate mr-2">{achievement.credentialId}</span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
                        title="Копіювати ID"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {achievement.skills && achievement.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Опановані навички & технології
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {achievement.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {achievement.description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Про програму та результати
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {achievement.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
