import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { classNames } from '../../utils/format';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type: ToastType) => void;
  error: (message: string) => void;
  success: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const error = useCallback((message: string) => toast(message, 'error'), [toast]);
  const success = useCallback((message: string) => toast(message, 'success'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, error, success }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={classNames('toast', t.type)}>
            {t.type === 'error' ? (
              <AlertCircle className="icon" size={20} />
            ) : (
              <CheckCircle className="icon" size={20} />
            )}
            <div className="toast-message" style={{ flex: 1, fontSize: '0.875rem' }}>
              {t.message}
            </div>
            <button 
              className="btn-icon btn-ghost" 
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              style={{ padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
