import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EduCred Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('educred_achievements_sync_v1');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Сталася помилка відображення
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Можливо, у пам'яті браузера збереглися застарілі дані або пошкоджений запис.
            </p>
            {this.state.error && (
              <div className="mt-3 p-3 bg-slate-100 rounded-lg text-left overflow-x-auto text-[11px] font-mono text-slate-700 max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Оновити сторінку</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Очистити кеш та перезавантажити
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
