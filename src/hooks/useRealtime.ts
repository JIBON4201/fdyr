// =====================================================
// REALTIME HOOK - WebSocket Connection for Real-time Updates
// Connects to the realtime service on port 3003
// =====================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store';

interface BalanceUpdate {
  balance: number;
  change: number;
}

interface TransactionUpdate {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface RealtimeEvents {
  'auth:success': (data: { user: { id: string; username: string; balance: number; vipLevel: number } }) => void;
  'auth:error': (data: { message: string }) => void;
  'balance:update': (data: BalanceUpdate) => void;
  'transaction:new': (data: TransactionUpdate) => void;
  'transactions:new': (data: { count: number; timestamp: number }) => void;
  pong: () => void;
}

export function useRealtime() {
  const { user, setUser } = useUserStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socketUrl = `/?XTransformPort=3003`;

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current.on('connect', () => {
      console.log('[Realtime] Connected');
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;

      // Authenticate with stored token
      const token = localStorage.getItem('session_token');
      if (token) {
        socketRef.current?.emit('auth', { token });
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('[Realtime] Disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('[Realtime] Connection error:', error);
      setConnectionError('Failed to connect to realtime service');
      reconnectAttempts.current++;
    });

    socketRef.current.on('auth:success', (data) => {
      console.log('[Realtime] Authenticated:', data.user.username);
      if (setUser && data.user) {
        setUser({
          ...user,
          ...data.user,
        } as typeof user);
      }
    });

    socketRef.current.on('auth:error', (data) => {
      console.error('[Realtime] Auth error:', data.message);
    });

    socketRef.current.on('balance:update', (data: BalanceUpdate) => {
      console.log('[Realtime] Balance update:', data);
      if (setUser && user) {
        setUser({
          ...user,
          balance: data.balance,
        });
      }
    });

    socketRef.current.on('transaction:new', (data: TransactionUpdate) => {
      console.log('[Realtime] New transaction:', data);
      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('transaction:new', { detail: data }));
    });

  }, [user, setUser]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Subscribe to balance updates
  const subscribeBalance = useCallback(() => {
    socketRef.current?.emit('subscribe:balance');
  }, []);

  // Subscribe to transaction updates
  const subscribeTransactions = useCallback(() => {
    socketRef.current?.emit('subscribe:transactions');
  }, []);

  // Ping to check connection
  const ping = useCallback(() => {
    socketRef.current?.emit('ping');
  }, []);

  // Auto-connect when user is logged in
  useEffect(() => {
    if (user && !socketRef.current) {
      connect();
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [user, connect]);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeBalance,
    subscribeTransactions,
    ping,
  };
}

// Hook for listening to transaction events
export function useTransactionListener(
  callback: (transaction: TransactionUpdate) => void
) {
  useEffect(() => {
    const handleNewTransaction = (event: CustomEvent<TransactionUpdate>) => {
      callback(event.detail);
    };

    window.addEventListener('transaction:new', handleNewTransaction as EventListener);
    return () => {
      window.removeEventListener('transaction:new', handleNewTransaction as EventListener);
    };
  }, [callback]);
}
