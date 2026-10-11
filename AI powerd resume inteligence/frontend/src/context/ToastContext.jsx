import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let bg = 'bg-slate-900 border-slate-700 text-slate-100';
          let icon = <Info className="h-4 w-4 text-blue-400 shrink-0" />;

          if (t.type === 'success') {
            bg = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100';
            icon = <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
          } else if (t.type === 'error') {
            bg = 'bg-rose-950/90 border-rose-500/40 text-rose-100';
            icon = <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bg = 'bg-amber-950/90 border-amber-500/40 text-amber-100';
            icon = <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-3 text-xs font-medium animate-fadeIn transition-all ${bg}`}
            >
              <div className="flex items-start gap-2.5">
                {icon}
                <span className="leading-snug">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
