// pen-paper-character-app\src\contexts\DiceLogContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { RollResult, setGlobalLogCallback } from '@/lib/dice';
import { useToast } from './ToastContext';

interface DiceLogContextType {
  logs: RollResult[];
  addLog: (log: Omit<RollResult, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  removeLog: (id: string) => void;
}

const DiceLogContext = createContext<DiceLogContextType | undefined>(undefined);

export function DiceLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<RollResult[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const savedLogs = localStorage.getItem('diceLogs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        const logsWithDates = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(logsWithDates);
      } catch (e) {
        console.error('Fehler beim Laden der Logs:', e);
      }
    }
  }, []);

  // Persistierung debounced: localStorage-Schreiben ist synchron und blockiert
  // bei jedem Wurf den Main-Thread, wenn das Log groß ist.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem('diceLogs', JSON.stringify(logs));
      } catch (e) {
        console.error('Fehler beim Speichern der Logs:', e);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [logs]);

  const addLog = useCallback(
    (log: Omit<RollResult, 'id' | 'timestamp'>) => {
      const newLog: RollResult = {
        ...log,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      setLogs(prev => [newLog, ...prev].slice(0, 100));

      // Toast hinzufügen
      let shortReason = log.reason;
      shortReason = shortReason.replace(/ Probe$/, '').replace(/ Rettungswurf$/, '');
      const message = `${shortReason}: ${log.total ?? log.result}`;
      addToast(message);
    },
    [addToast]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem('diceLogs');
  }, []);

  const removeLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  }, []);

  // Wichtig: Callback nach jedem Re-Render aktualisieren, sonst hält das
  // Modul-globale Callback eine veraltete addLog-Closure fest.
  useEffect(() => {
    setGlobalLogCallback(addLog);
  }, [addLog]);

  const value = useMemo(
    () => ({ logs, addLog, clearLogs, removeLog }),
    [logs, addLog, clearLogs, removeLog]
  );

  return (
    <DiceLogContext.Provider value={value}>
      {children}
    </DiceLogContext.Provider>
  );
}

export function useDiceLog() {
  const context = useContext(DiceLogContext);
  if (context === undefined) {
    throw new Error('useDiceLog must be used within a DiceLogProvider');
  }
  return context;
}