// =====================================================
// REAL-TIME WEBSOCKET HOOK
// Connects to the real-time service for live updates
// =====================================================

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store';

interface UseWebSocketReturn {
  connected: boolean;
  lastUpdate: Date | null;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string) => void;
  emit: (event: string, data: any) => void;
  requestBalance: () => void;
  requestTransactions: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '';
const WS_PORT = 3010;

export function useWebSocket(): UseWebSocketReturn {
  const { user } = useUserStore();
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socketUrl = WS_URL || `/?XTransformPort=${WS_PORT}`;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[WS] Connected');
      setConnected(true);
      // Authenticate with user ID
      socket.emit('auth', user.id);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error);
      setConnected(false);
    });

    // User data events
    socket.on('connected', (data) => {
      console.log('[WS] Authenticated:', data);
    });

    socket.on('user:data', (data) => {
      setLastUpdate(new Date());
      // Update user store if needed
      if (listenersRef.current.has('user:data')) {
        listenersRef.current.get('user:data')?.(data);
      }
    });

    socket.on('balance:update', (data) => {
      setLastUpdate(new Date());
      if (listenersRef.current.has('balance:update')) {
        listenersRef.current.get('balance:update')?.(data);
      }
    });

    socket.on('transactions:list', (data) => {
      setLastUpdate(new Date());
      if (listenersRef.current.has('transactions:list')) {
        listenersRef.current.get('transactions:list')?.(data);
      }
    });

    socket.on('orders:list', (data) => {
      setLastUpdate(new Date());
      if (listenersRef.current.has('orders:list')) {
        listenersRef.current.get('orders:list')?.(data);
      }
    });

    socket.on('refresh', () => {
      setLastUpdate(new Date());
      if (listenersRef.current.has('refresh')) {
        listenersRef.current.get('refresh')?.({});
      }
    });

    socket.on('error', (error) => {
      console.error('[WS] Error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    listenersRef.current.set(event, callback);
  }, []);

  const unsubscribe = useCallback((event: string) => {
    listenersRef.current.delete(event);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  }, [connected]);

  const requestBalance = useCallback(() => {
    if (socketRef.current && connected) {
      socketRef.current.emit('balance:get');
    }
  }, [connected]);

  const requestTransactions = useCallback(() => {
    if (socketRef.current && connected) {
      socketRef.current.emit('transactions:get');
    }
  }, [connected]);

  return {
    connected,
    lastUpdate,
    subscribe,
    unsubscribe,
    emit,
    requestBalance,
    requestTransactions,
  };
}
