import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck, Check, AlertCircle, LogOut } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (enteredPasscode: string) => Promise<boolean> | boolean;
  onLogout: () => void;
  onChangePasscode: (oldPass: string, newPass: string) => Promise<boolean> | boolean;
  ownerEmail: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  onChangePasscode,
  ownerEmail,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Change password mode
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const success = await onLogin(passcode);
      if (success) {
        setSuccessMsg('Вхід виконано! Режим адміністратора активовано.');
        setTimeout(() => {
          setSuccessMsg('');
          setPasscode('');
          onClose();
        }, 800);
      } else {
        setErrorMsg('Невірний пароль адміністратора. Спробуйте ще раз.');
      }
    } catch (err) {
      setErrorMsg('Помилка під час авторизації.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPasscode.length < 4) {
      setErrorMsg('Новий пароль має містити щонайменше 4 символи.');
      return;
    }
    setIsLoading(true);
    try {
      const success = await onChangePasscode(oldPasscode, newPasscode);
      if (success) {
        setSuccessMsg('Пароль успішно змінено!');
        setOldPasscode('');
        setNewPasscode('');
        setIsChangingPass(false);
        setTimeout(() => setSuccessMsg(''), 2500);
      } else {
        setErrorMsg('Поточний пароль вказано невірно.');
      }
    } catch (err) {
      setErrorMsg('Помилка при зміні пароля.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isAdmin ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isAdmin ? 'Панель Адміністратора' : 'Вхід для Власника'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin ? 'Ви авторизовані як власник' : 'Захист від несанкціонованих змін'}
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

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isAdmin ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Статус: Повний доступ адміністратора</span>
                </div>
                <div className="text-xs text-slate-600">
                  Власник портфоліо: <strong className="text-slate-800">{ownerEmail}</strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Вам доступне додавання, редагування та видалення сертифікатів. Відвідувачі сайту бачитимуть лише публічну галерею без кнопок зміни.
                </p>
              </div>

              {!isChangingPass ? (
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPass(true)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Змінити пароль адміністратора</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Вийти з режиму адміністратора (Публічний перегляд)</span>
                  </button>
                </div>
              ) : (
                /* Change password form */
                <form onSubmit={handleChangePassSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Поточний пароль
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPasscode}
                      onChange={(e) => setOldPasscode(e.target.value)}
                      placeholder="Введіть старий пароль"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Новий пароль
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Введіть новий пароль"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPass(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Скасувати
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
                    >
                      Зберегти новий пароль
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Login form for guests */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Зараз увімкнено <strong>публічний режим перегляду</strong>. Щоб додавати сертифікати або редагувати дані, введіть свій пароль.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Пароль адміністратора
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Введіть пароль (стандартний: admin2024)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Початковий пароль за замовчуванням: <strong className="font-mono text-slate-700">admin2024</strong> (його можна змінити після входу).
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Увійти як адміністратор</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
