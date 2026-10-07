// pen-paper-character-app\src\contexts\ToastContext.tsx

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface Toast {
  id: string;
  message: string;
  timestamp: Date;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const newToast: Toast = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      message,
      timestamp: new Date(),
    };
    setToasts(prev => {
      // Maximal 3 Toasts, neuester unten (am Ende)
      const updated = [...prev, newToast];
      if (updated.length > 3) {
        return updated.slice(-3);
      }
      return updated;
    });
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Value memoisieren, sonst re-rendern ALLE useToast()-Consumer bei jedem Toast.
  const value = useMemo(
    () => ({ toasts, addToast, clearToasts }),
    [toasts, addToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}