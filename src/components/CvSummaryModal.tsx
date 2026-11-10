import React, { useState } from 'react';
import { X, Copy, Check, FileText, Share2 } from 'lucide-react';
import { Achievement } from '../types';
import { formatDateUk } from '../utils/helpers';

interface CvSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const CvSummaryModal: React.FC<CvSummaryModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!isOpen) return null;

  // Generate plain-text CV block
  const cvText = achievements
    .map((item) => {
      const date = item.issueDate ? ` (${new Date(item.issueDate).getFullYear()})` : '';
      const id = item.credentialId ? ` · ID: ${item.credentialId}` : '';
      const score = item.score ? ` · Результат: ${item.score}` : '';
      const skills = item.skills.length > 0 ? `\n  Ключові навички: ${item.skills.join(', ')}` : '';
      const url = item.credentialUrl ? `\n  Посилання: ${item.credentialUrl}` : '';
      return `• ${item.title} — ${item.issuer}${date}${score}${id}${skills}${url}`;
    })
    .join('\n\n');

  const handleCopyText = () => {
    navigator.clipboard.writeText(cvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Експорт для резюме & Посилання
              </h2>
              <p className="text-xs text-slate-500">
                Готовий блок сертифікатів для резюме, LinkedIn чи супровідного листа
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Share Link Row */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Посилання на портфоліо досягнень:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{linkCopied ? 'Скопійовано!' : 'Копіювати лінк'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Текст для розділу "Сертифікати та освіта" ({achievements.length} пунктів)
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопійовано в буфер!' : 'Копіювати весь текст'}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={12}
              value={cvText}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-none select-all"
            />
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
