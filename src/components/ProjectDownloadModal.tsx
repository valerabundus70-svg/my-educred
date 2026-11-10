import React, { useState } from 'react';
import { X, Download, Terminal, Globe, FileCode, Check, Copy, ExternalLink, HardDrive, Lock, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { Achievement } from '../types';

interface ProjectDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  isAdmin: boolean;
  onOpenAdminModal?: () => void;
}

export const ProjectDownloadModal: React.FC<ProjectDownloadModalProps> = ({
  isOpen,
  onClose,
  achievements,
  isAdmin,
  onOpenAdminModal,
}) => {
  const [activeTab, setActiveTab] = useState<'offline' | 'code' | 'deploy'>('offline');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center my-8">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Скачування сайту доступне лише адміністратору
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Вихідний код сайту, архіви та резервні копії захищені від завантаження гостями. Увійдіть як власник портфоліо для доступу.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Закрити
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminModal?.();
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
            >
              Увійти як адмін
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate self-contained offline HTML
  const handleDownloadOfflineHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduCred - Офлайн Портфоліо Досягнень</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased p-6 md:p-12">
  <div class="max-w-5xl mx-auto">
    <header class="border-b border-slate-200 pb-6 mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">EduCred · Портфоліо Досягнень</h1>
        <p class="text-xs text-slate-500 mt-1">Офлайн копія документів та сертифікатів (${achievements.length} шт.)</p>
      </div>
      <button onclick="window.print()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer">
        Роздрукувати / Зберегти як PDF
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${achievements
        .map(
          (a) => `
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          ${
            a.imageUrl
              ? `<div class="h-44 w-full rounded-lg overflow-hidden mb-3 bg-slate-100"><img src="${a.imageUrl}" alt="${a.title}" class="w-full h-full object-cover"></div>`
              : ''
          }
          <div class="text-xs text-slate-500 mb-1 font-medium">${a.issuer} · ${a.issueDate}</div>
          <h2 class="text-base font-bold text-slate-900 leading-snug">${a.title}</h2>
          ${a.score ? `<div class="text-xs text-amber-700 font-semibold mt-1">Результат: ${a.score}</div>` : ''}
          <p class="text-xs text-slate-600 mt-2 line-clamp-3">${a.description || ''}</p>
          ${
            a.credentialId
              ? `<div class="mt-3 text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">ID: ${a.credentialId}</div>`
              : ''
          }
          ${
            a.credentialUrl
              ? `<div class="mt-2"><a href="${a.credentialUrl}" target="_blank" class="text-xs text-sky-600 hover:underline">Перевірити сертифікат онлайн →</a></div>`
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-certificates-offline-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(achievements, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educred-achievements-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCustomZip = async () => {
    try {
      setIsZipping(true);
      const res = await fetch('/educred-source.zip');
      if (!res.ok) throw new Error('Could not fetch base zip');
      const blob = await res.blob();
      const zip = await JSZip.loadAsync(blob);

      const jsonStr = JSON.stringify(achievements, null, 2);
      zip.file('data/achievements.json', jsonStr);
      zip.file('public/data/achievements.json', jsonStr);

      const tsContent = `import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = ${jsonStr};

export const PRESET_BADGES = [
  {
    name: 'Золотий кібердетектив',
    tier: 'gold' as const,
    url: '/assets/images/badge_mastery_gold_1794149557866.jpg',
  },
  {
    name: 'Архітектор систем безпеки',
    tier: 'silver' as const,
    url: '/assets/images/badge_code_architect_1794149558466.jpg',
  },
  {
    name: 'Зразок сертифіката',
    tier: 'gold' as const,
    url: '/assets/images/cert_sample_preview_1794149560004.jpg',
  },
  {
    name: 'Навчальний диплом ХНУВС',
    tier: 'gold' as const,
    url: '/assets/images/cert_hero_learning_1794149557969.jpg',
  },
];

export const DEMO_ACHIEVEMENTS = INITIAL_ACHIEVEMENTS;
`;
      zip.file('src/data/initialAchievements.ts', tsContent);

      const updatedBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(updatedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `educred-portfolio-ready-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Fallback to direct link', e);
      window.location.href = '/educred-source.zip';
    } finally {
      setIsZipping(false);
    }
  };

  const terminalCmds = `# 1. Клонуйте або завантажте ZIP з AI Studio (кнопка в правому верхньому кутку)
# 2. Відкрийте папку у терміналі (VS Code):
cd my-certificates-app

# 3. Встановіть залежності:
npm install

# 4. Запустіть сайт локально:
npm run dev

# 5. Для створення готової збірки для хостингу:
npm run build`;

  const handleCopyCmds = () => {
    navigator.clipboard.writeText(terminalCmds);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Як завантажити та зберегти цей сайт
              </h2>
              <p className="text-xs text-slate-500">
                Варіанти завантаження офлайн, коду та публікації
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

        {/* Tab switch */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'offline'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Завантажити офлайн (.html)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Завантажити весь вихідний код
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'deploy'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Безкоштовний хостинг
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <HardDrive className="w-4 h-4 text-amber-600" />
                    <span>Автономна сторінка портфоліо</span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md">
                    Завантажує єдиний готовий HTML-файл з усіма вашими сертифікатами. Ви можете відкрити його подвійним кліком на будь-якому комп'ютері чи смартфоні навіть без інтернету!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadOfflineHtml}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Завантажити .html</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 space-y-1.5 p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-700 block">Порада для збереження:</span>
                <div>• Файл зберігається у папку "Завантаження" (Downloads).</div>
                <div>• Ви можете пересилати його рекрутерам або прикріплювати до листів.</div>
                <div>• Натиснувши "Роздрукувати" всередині файлу, можна зберегти красивий PDF-каталог!</div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Пряме завантаження ZIP-архіву проєкту</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Усі вихідні файли (React + Vite + TypeScript, емблеми ХНУВС та Кіберполіції, налаштування Vercel) вже запаковані.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadCustomZip}
                    disabled={isZipping}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    {isZipping ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Пакування ZIP ({achievements.length} док.)...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Скачати ZIP для Vercel ({achievements.length} док.)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <FileCode className="w-3.5 h-3.5 text-sky-400" />
                    <span>Експорт JSON</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">💡 Як зробити, щоб усі гості бачили ваші документи на Vercel:</span>
                <div>1. Додайте ваші сертифікати через кнопку <strong>«+ Додати досягнення»</strong> (вони надійно зберігаються у вашому браузері і більше не зникають після оновлення).</div>
                <div>2. Натисніть кнопку <strong>«Скачати ZIP для Vercel»</strong> вище. Архів збереже всі ваші додані документи всередині коду.</div>
                <div>3. Завантажте цей ZIP у ваш проєкт на <strong>Vercel</strong> — і будь-яка людина у світі одразу побачить ваше портфоліо!</div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2">
                Після завантаження розархівуйте ZIP-файл на своєму комп'ютері:
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleCopyCmds}
                  className="absolute right-3 top-3 text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer font-mono"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Скопійовано' : 'Копіювати'}</span>
                </button>
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {terminalCmds}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 leading-relaxed">
                <span className="font-bold block mb-1">⚡ Чому на Vercel гості не бачать збережені файли безпосередньо:</span>
                <div>Vercel — це <strong>статичний хостинг</strong> (без сервера та постійного диску). На ньому нові файли через веб-форму не записуються у спільну базу автоматично.</div>
                <div className="mt-1.5 font-medium">Якщо ви хочете, щоб сервер працював цілодобово і всі гості миттєво бачили ваші додані сертифікати — використовуйте <strong>Render.com</strong> або <strong>Railway.app</strong>!</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white mb-1.5">
                      РЕКОМЕНДОВАНО
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Render.com</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Безкоштовний повноцінний Node.js сервер! Запускає наш `server.ts`. Усі додані сертифікати зберігаються і доступні всім гостям 24/7.
                    </p>
                  </div>
                  <a
                    href="https://render.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>render.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Railway.app</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Повноцінний хмарний хостинг із постійним збереженням файлів. Деплой за 1 клік.
                    </p>
                  </div>
                  <a
                    href="https://railway.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-sky-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>railway.app</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Vercel</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Статичний хостинг. Щоб гості бачили оновлені документи, використовуйте кнопку <strong>«Скачати ZIP для Vercel»</strong>.
                    </p>
                  </div>
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-sky-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>vercel.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
