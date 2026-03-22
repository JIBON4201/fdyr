// =====================================================
// REAL-TIME PROVIDER
// Wraps the app and provides real-time updates
// =====================================================

'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useUserStore } from '@/store';

interface RealTimeContextType {
  connected: boolean;
  lastUpdate: Date | null;
  requestBalance: () => void;
  requestTransactions: () => void;
}

const RealTimeContext = createContext<RealTimeContextType | null>(null);

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within RealTimeProvider');
  }
  return context;
}

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const ws = useWebSocket();
  const { setUser } = useUserStore();

  // Subscribe to balance updates
  useEffect(() => {
    ws.subscribe('balance:update', (data) => {
      // Update user balance in store
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          balance: data.balance,
          vipLevel: data.vipLevel,
        });
      }
    });

    ws.subscribe('refresh', () => {
      // Trigger a refresh of user data
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
          }
        })
        .catch(console.error);
    });

    return () => {
      ws.unsubscribe('balance:update');
      ws.unsubscribe('refresh');
    };
  }, [ws, setUser]);

  // Periodic balance refresh (fallback)
  useEffect(() => {
    if (!ws.connected) return;

    const interval = setInterval(() => {
      ws.requestBalance();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [ws]);

  return (
    <RealTimeContext.Provider value={{
      connected: ws.connected,
      lastUpdate: ws.lastUpdate,
      requestBalance: ws.requestBalance,
      requestTransactions: ws.requestTransactions,
    }}>
      {children}
    </RealTimeContext.Provider>
  );
}
