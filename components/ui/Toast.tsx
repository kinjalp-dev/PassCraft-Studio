import React from 'react';
import { useStore } from '../../store';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded shadow-lg text-white min-w-[300px] animate-in slide-in-from-right-full",
            {
              'bg-green-600': toast.type === 'success',
              'bg-red-600': toast.type === 'error',
              'bg-blue-600': toast.type === 'info',
            }
          )}
        >
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
