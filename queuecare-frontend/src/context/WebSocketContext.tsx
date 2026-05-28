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
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.disconnect();
    }
    setIsConnected(false);
    subscriptionsRef.current.clear();
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      disconnect();
      return;
    }
    if (stompClientRef.current?.connected) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      disconnect();
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      // Pass token as query parameter for WebSocket handshake authentication
      // The backend WebSocketAuthInterceptor extracts it from the query parameter
      const wsUrl = `${API_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
      
      const socket = new SockJS(wsUrl, undefined, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      });
      
      const stompClient = StompJs.over(socket);
      stompClient.debug = () => { }; // Disable logging

      stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log('WebSocket connected successfully');
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0; // Reset reconnect counter on successful connection
          stompClientRef.current = stompClient;
        },
        (err: any) => {
          console.error('WebSocket connection error:', err);
          setError('Connection failed. Retrying...');
          setIsConnected(false);
          scheduleReconnect();
        }
      );

      // Handle socket close/error
      socket.onclose = () => {
        console.warn('WebSocket socket closed');
        setIsConnected(false);
        scheduleReconnect();
      };

      socket.onerror = () => {
        console.error('WebSocket socket error');
        setError('Connection lost. Attempting to reconnect...');
        scheduleReconnect();
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to create connection');
      scheduleReconnect();
    }
  }, [isAuthenticated, user?.id]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setError('Max reconnection attempts reached. Please refresh the page.');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current += 1;
    
    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && localStorage.getItem('auth_token')) {
        connect();
      }
    }, delay);
  }, [isAuthenticated, connect]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, connect, disconnect]);

  const send = useCallback((destination: string, message: any) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.send(destination, {}, JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent to:', destination);
    }
  }, []);

  const subscribe = useCallback((destination: string, callback: (data: any) => void) => {
    if (!stompClientRef.current?.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to:', destination);
      return () => { };
    }

    const subscription = stompClientRef.current.subscribe(destination, (frame: any) => {
      try {
        callback(JSON.parse(frame.body));
      } catch {
        callback(frame.body);
      }
    });

    subscriptionsRef.current.set(destination, subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(destination);
    };
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
