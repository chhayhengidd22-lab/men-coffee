import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl shadow-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-[#141d14] border-[#10b981]/40 text-[#f4efe9]'
                : toast.type === 'error'
                ? 'bg-[#221212] border-[#ef4444]/40 text-[#f4efe9]'
                : 'bg-[#1f150f] border-[#d97706]/40 text-[#f4efe9]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && (
                <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
              )}
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#8c7461] hover:text-[#f4efe9] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
