import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Achievement } from '../types';
import { DEMO_ACHIEVEMENTS } from '../data/initialAchievements';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onImportAchievements: (newAchievements: Achievement[]) => void;
  onResetAchievements: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onImportAchievements,
  onResetAchievements,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(achievements, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `educred-certificates-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMessage({
      text: `Успішно експортовано ${achievements.length} сертифікатів та бейджів!`,
      type: 'success',
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
          onImportAchievements(parsed);
          setStatusMessage({
            text: `Успішно імпортовано ${parsed.length} документів!`,
            type: 'success',
          });
        } else {
          setStatusMessage({
            text: 'Некоректний формат файлу. Очікується масив досягнень.',
            type: 'error',
          });
        }
      } catch (err) {
        setStatusMessage({
          text: 'Помилка при читанні JSON файлу.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (window.confirm('Ви дійсно хочете відновити початкові демонстраційні сертифікати?')) {
      onResetAchievements();
      setStatusMessage({
        text: 'Початкові демонстраційні сертифікати відновлено.',
        type: 'success',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Резервне копіювання даних
              </h2>
              <p className="text-xs text-slate-500">
                Збережіть архів своїх сертифікатів або відновіть дані
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

        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Export action */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Завантажити JSON архів</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Зберегти всі {achievements.length} документів у локальний файл на комп'ютер
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Експорт</span>
            </button>
          </div>

          {/* Import action */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Імпортувати з файлу</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Відновити раніше збережений JSON файл сертифікатів
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Імпорт</span>
            </button>
          </div>

          {/* Reset action */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Бажаєте відновити стандартні приклади?
            </span>
            <button
              type="button"
              onClick={handleResetToDemo}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Скинути до зразків</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
