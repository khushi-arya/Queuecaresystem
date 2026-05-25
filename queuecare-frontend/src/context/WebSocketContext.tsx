import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import StompJs from 'stompjs';
import { useAuth } from '@hooks/useAuth';

interface WebSocketContextType {
  isConnected: boolean;
  error: string | null;
  send: (destination: string, message: any) => void;
  subscribe: (destination: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const stompClientRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  const disconnect = useCallback(() => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.disconnect();
    }
    setIsConnected(false);
    subscriptionsRef.current.clear();
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) return;
    if (stompClientRef.current?.connected) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    const socket = new SockJS(`${API_BASE_URL}/ws?token=${encodeURIComponent(token)}`);
    const stompClient = StompJs.over(socket);
    stompClient.debug = () => { }; // Disable logging to keep console clean

    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        setIsConnected(true);
        setError(null);
        stompClientRef.current = stompClient;
      },
      (err: any) => {
        console.error('WebSocket Error:', err);
        setError('Failed to connect to notification service');
        setIsConnected(false);
      }
    );
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [isAuthenticated, connect, disconnect]);

  const send = useCallback((destination: string, message: any) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.send(destination, {}, JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((destination: string, callback: (data: any) => void) => {
    if (!stompClientRef.current?.connected) return () => { };

    const subscription = stompClientRef.current.subscribe(destination, (frame: any) => {
      try {
        callback(JSON.parse(frame.body));
      } catch {
        callback(frame.body);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, error, send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocketContext must be used within WebSocketProvider');
  return context;
};
