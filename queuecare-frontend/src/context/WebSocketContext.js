import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import StompJs from 'stompjs';
import { useAuth } from '@hooks/useAuth';
const WebSocketContext = createContext(undefined);
export const WebSocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const stompClientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const subscriptionsRef = useRef(new Map());
    const disconnect = useCallback(() => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.disconnect();
        }
        setIsConnected(false);
        subscriptionsRef.current.clear();
    }, []);
    const connect = useCallback(() => {
        if (!isAuthenticated || !user?.id)
            return;
        if (stompClientRef.current?.connected)
            return;
        const token = localStorage.getItem('auth_token');
        if (!token)
            return;
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        const socket = new SockJS(`${API_BASE_URL}/ws?token=${encodeURIComponent(token)}`);
        const stompClient = StompJs.over(socket);
        stompClient.debug = () => { }; // Disable logging to keep console clean
        stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
            setIsConnected(true);
            setError(null);
            stompClientRef.current = stompClient;
        }, (err) => {
            console.error('WebSocket Error:', err);
            setError('Failed to connect to notification service');
            setIsConnected(false);
        });
    }, [isAuthenticated, user?.id]);
    useEffect(() => {
        if (isAuthenticated) {
            connect();
        }
        else {
            disconnect();
        }
        return () => disconnect();
    }, [isAuthenticated, connect, disconnect]);
    const send = useCallback((destination, message) => {
        if (stompClientRef.current?.connected) {
            stompClientRef.current.send(destination, {}, JSON.stringify(message));
        }
    }, []);
    const subscribe = useCallback((destination, callback) => {
        if (!stompClientRef.current?.connected)
            return () => { };
        const subscription = stompClientRef.current.subscribe(destination, (frame) => {
            try {
                callback(JSON.parse(frame.body));
            }
            catch {
                callback(frame.body);
            }
        });
        return () => subscription.unsubscribe();
    }, []);
    return (_jsx(WebSocketContext.Provider, { value: { isConnected, error, send, subscribe }, children: children }));
};
export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context)
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    return context;
};
