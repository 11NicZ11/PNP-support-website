'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RollResult } from '@/lib/dice';
import { setGlobalLogCallback } from '@/lib/diceSystem';

interface DiceLogContextType {
  logs: RollResult[];
  addLog: (log: Omit<RollResult, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  removeLog: (id: string) => void;
}

const DiceLogContext = createContext<DiceLogContextType | undefined>(undefined);

export function DiceLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<RollResult[]>([]);

  // Lade Logs aus localStorage beim Start
  useEffect(() => {
    const savedLogs = localStorage.getItem('diceLogs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        // Konvertiere timestamp Strings zurück zu Date Objects
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

  // Speichere Logs in localStorage bei Änderung
  useEffect(() => {
    localStorage.setItem('diceLogs', JSON.stringify(logs));
  }, [logs]);

  // Registriere den globalen Callback für automatisches Logging
  useEffect(() => {
    setGlobalLogCallback(addLog);
  }, []);

  const addLog = (log: Omit<RollResult, 'id' | 'timestamp'>) => {
    const newLog: RollResult = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Max 100 Logs
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('diceLogs');
  };

  const removeLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <DiceLogContext.Provider value={{ logs, addLog, clearLogs, removeLog }}>
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