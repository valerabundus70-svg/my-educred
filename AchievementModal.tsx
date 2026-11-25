import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Check, Award, AlertCircle, File, FileCode, CheckCircle2 } from 'lucide-react';
import { Achievement, AchievementType, BadgeTier } from '../types';
import { TYPE_LABELS, formatBytes, detectFileFormat, optimizeImageBase64 } from '../utils/helpers';
import { PRESET_BADGES } from '../data/initialAchievements';
import { uploadFileToServer } from '../utils/apiSync';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  initialData?: Achievement | null;
  defaultType?: AchievementType;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType = 'certificate',
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AchievementType>(defaultType);
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [score, setScore] = useState('');
  const [learningHours, setLearningHours] = useState<number | ''>('');
  const [badgeTier, setBadgeTier] = useState<BadgeTier>('gold');
  const [skillsInput, setSkillsInput] = useState('');
  const [description, setDescription] = useState('');
  
  // File states (supporting ANY file type)
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileFormat, setFileFormat] = useState<'pdf' | 'image' | 'doc' | 'archive' | 'other'>('image');
  const [imageUrl, setImageUrl] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when opening
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setIssuer(initialData.issuer);
      setIssueDate(initialData.issueDate || '');
      setExpiryDate(initialData.expiryDate || '');
      setCredentialId(initialData.credentialId || '');
      setCredentialUrl(initialData.credentialUrl || '');
      setScore(initialData.score || '');
      setLearningHours(initialData.learningHours ?? '');
      setBadgeTier(initialData.badgeTier || 'gold');
      setSkillsInput(initialData.skills ? initialData.skills.join(', ') : '');
      setDescription(initialData.description || '');
      setFileUrl(initialData.fileUrl || initialData.imageUrl || '');
      setImageUrl(initialData.imageUrl || '');
      setFileName(initialData.fileName || '');
      setFileSize(initialData.fileSize || '');
      setFileFormat((initialData.fileFormat as any) || 'image');
      setIsVerified(initialData.isVerified ?? true);
    } else {
      // Defaults for new achievement
      setTitle('');
      setType(defaultType);
      setIssuer('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setExpiryDate('');
      setCredentialId('');
      setCredentialUrl('');
      setScore('');
      setLearningHours('');
      setBadgeTier('gold');
      setSkillsInput('');
      setDescription('');
      setFileUrl('');
      setImageUrl('');
      setFileName('');
      setFileSize('');
      setFileFormat('image');
      setIsVerified(true);
    }
    setErrorMsg('');
  }, [initialData, defaultType, isOpen]);

  if (!isOpen) return null;

  // Process ANY file type (PDF, Images, DOC, ZIP, etc.)
  const processFile = (file: File) => {
    setErrorMsg('');
    const format = detectFileFormat(file.name, file.type);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    setFileFormat(format);

    // Auto-fill title if empty
    if (!title.trim()) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(cleanName.replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        let resultStr = e.target.result as string;
        if (format === 'image') {
          try {
            resultStr = await optimizeImageBase64(resultStr);
          } catch (optErr) {
            console.warn('Image optimization skipped', optErr);
          }
        }

        // Set preview
        setFileUrl(resultStr);
        if (format === 'image') {
          setImageUrl(resultStr);
        } else {
          setImageUrl('');
        }

        // Upload to server/cloud for persistent public URL accessible to all guests
        try {
          setIsUploading(true);
          const persistentUrl = await uploadFileToServer(file, resultStr);
          if (persistentUrl) {
            setFileUrl(persistentUrl);
            if (format === 'image') {
              setImageUrl(persistentUrl);
            }
          }
        } catch (uploadErr) {
          console.warn('Could not upload to server filesystem, keeping local data URI', uploadErr);
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Вкажіть назву сертифіката чи досягнення.');
      return;
    }
    if (!issuer.trim()) {
      setErrorMsg('Вкажіть організацію або платформу, що видала документ.');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const achievement: Achievement = {
      id: initialData?.id || `ach-${Date.now()}`,
      title: title.trim(),
      type,
      issuer: issuer.trim(),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
      credentialUrl: credentialUrl.trim() || undefined,
      score: score.trim() || undefined,
      learningHours: learningHours === '' ? undefined : Number(learningHours),
      badgeTier: type === 'badge' ? badgeTier : undefined,
      skills,
      description: description.trim(),
      fileUrl: fileUrl.trim() || imageUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      fileName: fileName.trim() || undefined,
      fileSize: fileSize.trim() || undefined,
      fileFormat,
      isVerified,
      featured: initialData?.featured ?? false,
    };

    onSave(achievement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              {type === 'badge' ? <Award className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Редагувати досягнення' : 'Прикріпити новий документ'}
              </h2>
              <p className="text-xs text-slate-500">
                Підтримуються будь-які формати: PDF, Word (DOCX), зображення (PNG/JPG), архіви
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Document Type & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Тип документа *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AchievementType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 cursor-pointer"
              >
                <option value="certificate">Сертифікат</option>
                <option value="badge">Цифровий бейдж</option>
                <option value="diploma">Диплом / Академічна довідка</option>
                <option value="course">Пройдений курс</option>
                <option value="award">Нагорода / Грамота / Відзнака</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Назва досягнення / курсу *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="напр. Основи кібербезпеки, Кіберполіція ХНУВС, Python Developer..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
          </div>

          {/* Issuer & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Організація / Заклад видачі *
              </label>
              <input
                type="text"
                required
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="ХНУВС, Кіберполіція, Prometheus, Coursera, Google..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Дата видачі
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
          </div>

          {/* Universal File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Файл документа (PDF, Word, Фото, Скан або Архів)
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-amber-500 bg-amber-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                Перетягніть будь-який файл сюди або натисніть для вибору
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Приймаються: <strong>PDF</strong>, <strong>DOC / DOCX</strong>, <strong>PNG / JPG</strong>, <strong>ZIP</strong> та інші формати
              </div>
            </div>

            {/* Attached file status banner */}
            {(fileName || fileUrl || imageUrl) ? (
              <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  {fileFormat === 'image' && (imageUrl || fileUrl) ? (
                    <div className="w-12 h-12 rounded overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      <img
                        src={imageUrl || fileUrl}
                        alt="Прев'ю"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                      <File className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-xs min-w-0">
                    <span className="font-semibold text-slate-900 block truncate">
                      {fileName || 'Прикріплений файл'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {fileFormat.toUpperCase()} {fileSize ? `· ${fileSize}` : ''} · Готово до перегляду
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileUrl('');
                    setImageUrl('');
                    setFileName('');
                    setFileSize('');
                  }}
                  className="text-xs text-rose-600 hover:underline cursor-pointer font-medium ml-3 shrink-0"
                >
                  Видалити
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Або виберіть емблему з готових шаблонів:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_BADGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setFileUrl(preset.url);
                        setFileName(preset.name);
                        setFileFormat('image');
                        if (type === 'badge') setBadgeTier(preset.tier);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-white text-left transition-colors cursor-pointer group"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-8 h-8 rounded object-cover shrink-0"
                      />
                      <span className="text-[11px] font-medium text-slate-700 truncate group-hover:text-amber-800">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Badge Tier if type is badge */}
          {type === 'badge' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ранг бейджа (Рівень нагороди)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['platinum', 'gold', 'silver', 'bronze'] as BadgeTier[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setBadgeTier(tier)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                      badgeTier === tier
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Credential ID & Verification Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ID документа / Номер диплома
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="напр. КВ №491028 чи CERT-2024"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Посилання для онлайн-перевірки (якщо є)
              </label>
              <input
                type="url"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
          </div>

          {/* Score & Learning Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Оцінка / Результат (необов'язково)
              </label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="З відзнакою, 98 балів, C1 Advanced..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Годин навчання
              </label>
              <input
                type="number"
                min="0"
                value={learningHours}
                onChange={(e) => setLearningHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="напр. 60, 120"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Skills Acquired */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Навички та теми (через кому)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Кібербезпека, Криміналістика, Мережеві протоколи, Python, Аналіз загроз..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Опис документа / Коментар
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткий опис результатів, тем або практичних завдань..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 leading-relaxed"
            />
          </div>

          {/* Verified toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isVerifiedCheckbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
            />
            <label htmlFor="isVerifiedCheckbox" className="text-xs font-medium text-slate-700 cursor-pointer">
              Позначити як офіційно верифікований документ
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                isUploading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isUploading
                  ? 'Збереження файлу на сервері...'
                  : initialData
                  ? 'Зберегти зміни'
                  : 'Прикріпити документ'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
