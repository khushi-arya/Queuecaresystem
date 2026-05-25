import { useEffect, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
/**
 * WebSocket subscription hook for real-time queue updates
 * Manages WebSocket connection for doctor queue management
 * Subscribes to `/topic/queue/{doctorId}` channel
 *
 * Features:
 * - Automatic connection on mount if user is a doctor
 * - Real-time queue updates via WebSocket
 * - Custom events for component-level listeners
 * - Auto-reconnect with exponential backoff
 *
 * Usage:
 * const { isConnected, queueUpdates } = useQueueSubscription();
 *
 * @returns {Object} WebSocket connection state and queue updates
 * @example
 * const { isConnected, queueUpdates, error } = useQueueSubscription();
 *
 * useEffect(() => {
 *   if (queueUpdates) {
 *     console.log('Queue updated:', queueUpdates);
 *   }
 * }, [queueUpdates]);
 */
export function useQueueSubscription() {
    const { user } = useAuth();
    const { isConnected, subscribe } = useWebSocket();
    const [queueUpdates, setQueueUpdates] = useState(null);
    const [error, setError] = useState(null);
    /**
     * Handle queue update from WebSocket
     */
    const handleQueueUpdate = useCallback((data) => {
        console.log('Queue update received:', data);
        // Update local state
        setQueueUpdates(data);
        // Dispatch custom event for component-level listeners
        if (data.type === 'queue_update' || data.type === 'token_status_change') {
            window.dispatchEvent(new CustomEvent('queueStatusUpdate', {
                detail: data,
            }));
        }
    }, []);
    /**
     * Subscribe to queue topic on mount
     */
    useEffect(() => {
        if (isConnected && user?.id) {
            const queueTopic = `/topic/queue/${user.id}`;
            console.log(`Subscribing to queue updates for doctor: ${user.id}`);
            try {
                const unsubscribeFn = subscribe(queueTopic, handleQueueUpdate);
                return () => {
                    if (unsubscribeFn) {
                        unsubscribeFn();
                    }
                };
            }
            catch (err) {
                console.error('WebSocket subscription error:', err);
                setError(err.message || 'Failed to subscribe to queue updates');
            }
        }
    }, [isConnected, user?.id, subscribe, handleQueueUpdate]);
    return {
        isConnected,
        error,
        queueUpdates,
    };
}
