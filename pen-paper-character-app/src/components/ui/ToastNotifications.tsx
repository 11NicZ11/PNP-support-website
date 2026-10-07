// pen-paper-character-app\src\components\ui\ToastNotifications.tsx

'use client';

import { useToast } from '@/contexts/ToastContext';
import { useEffect, useState } from 'react';

export function ToastNotifications() {
  const { toasts, clearToasts } = useToast();
  const [visible, setVisible] = useState(true);

  // Automatisch ausblenden nach 5 Sekunden? Laut Wunsch nicht, aber optional.
  // Wir behalten sie, bis der Benutzer den Pfeil klickt.

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Pfeil-Button zum Löschen aller Toasts */}
      <button
        onClick={clearToasts}
        className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition"
        title="Alle Benachrichtigungen löschen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Toast-Liste: ältester oben, neuester unten */}
      <div className="flex flex-col gap-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-lg px-4 py-2 min-w-[200px] text-sm font-mono animate-slide-in"
            style={{
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}