import { useWebSocketContext } from '@context/WebSocketContext';
/**
 * Hook to access shared WebSocket connection
 */
export function useWebSocket() {
    const context = useWebSocketContext();
    return {
        isConnected: context.isConnected,
        error: context.error,
        send: context.send,
        subscribe: context.subscribe,
        // Provide stubs for legacy compatibility if needed
        unsubscribe: () => {
            console.warn('Unsubscribe called on shared connection. Subscription is managed by the return value of subscribe().');
        },
        disconnect: () => {
            console.warn('Disconnect called on shared connection. It is managed by the WebSocketProvider lifecycle.');
        }
    };
}
export default useWebSocket;
