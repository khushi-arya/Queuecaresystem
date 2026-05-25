import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useReducer, useCallback, useEffect } from 'react';
/**
 * Default notification preferences
 */
const DEFAULT_PREFERENCES = {
    appointment: true,
    prescription: true,
    message: true,
    system: true,
    payment: true,
    profile_update: true,
};
/**
 * Initial state
 */
const initialState = {
    notifications: [],
    preferences: DEFAULT_PREFERENCES,
    unreadCount: 0,
};
/**
 * Reducer function for notification actions
 */
function notificationReducer(state, action) {
    switch (action.type) {
        case 'ADD_NOTIFICATION': {
            const newNotifications = [action.payload, ...state.notifications].slice(0, 50); // Keep max 50
            return {
                ...state,
                notifications: newNotifications,
                unreadCount: newNotifications.filter(n => !n.isRead).length,
            };
        }
        case 'MARK_READ': {
            const updatedNotifications = state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n);
            return {
                ...state,
                notifications: updatedNotifications,
                unreadCount: updatedNotifications.filter(n => !n.isRead).length,
            };
        }
        case 'MARK_ALL_READ': {
            const updatedNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
            return {
                ...state,
                notifications: updatedNotifications,
                unreadCount: 0,
            };
        }
        case 'CLEAR_ALL':
            return {
                ...state,
                notifications: [],
                unreadCount: 0,
            };
        case 'REMOVE_NOTIFICATION': {
            const updatedNotifications = state.notifications.filter(n => n.id !== action.payload);
            return {
                ...state,
                notifications: updatedNotifications,
                unreadCount: updatedNotifications.filter(n => !n.isRead).length,
            };
        }
        case 'UPDATE_PREFERENCES': {
            const updatedPreferences = { ...state.preferences, ...action.payload };
            return {
                ...state,
                preferences: updatedPreferences,
            };
        }
        case 'LOAD_PREFERENCES':
            return {
                ...state,
                preferences: action.payload,
            };
        case 'LOAD_NOTIFICATIONS': {
            return {
                ...state,
                notifications: action.payload,
                unreadCount: action.payload.filter(n => !n.isRead).length,
            };
        }
        default:
            return state;
    }
}
/**
 * Create Notification Context
 */
export const NotificationContext = createContext(undefined);
/**
 * Notification Provider Component
 */
export const NotificationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    /**
     * Load preferences from localStorage on mount
     */
    useEffect(() => {
        const savedPreferences = localStorage.getItem('notification_preferences');
        if (savedPreferences) {
            try {
                const preferences = JSON.parse(savedPreferences);
                dispatch({ type: 'LOAD_PREFERENCES', payload: preferences });
            }
            catch (error) {
                console.error('Failed to load notification preferences:', error);
            }
        }
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            try {
                const notifications = JSON.parse(savedNotifications);
                dispatch({ type: 'LOAD_NOTIFICATIONS', payload: notifications });
            }
            catch (error) {
                console.error('Failed to load notifications:', error);
            }
        }
    }, []);
    /**
     * Persist preferences to localStorage
     */
    useEffect(() => {
        localStorage.setItem('notification_preferences', JSON.stringify(state.preferences));
    }, [state.preferences]);
    /**
     * Persist notifications to localStorage
     */
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
    }, [state.notifications]);
    /**
     * Add a new notification
     */
    const addNotification = useCallback((notification) => {
        const newNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            isRead: false,
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    }, []);
    /**
     * Mark a notification as read
     */
    const markRead = useCallback((notificationId) => {
        dispatch({ type: 'MARK_READ', payload: notificationId });
    }, []);
    /**
     * Mark all notifications as read
     */
    const markAllRead = useCallback(() => {
        dispatch({ type: 'MARK_ALL_READ' });
    }, []);
    /**
     * Clear all notifications
     */
    const clearAll = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
    }, []);
    /**
     * Remove a notification
     */
    const removeNotification = useCallback((notificationId) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
    }, []);
    /**
     * Update notification preferences
     */
    const updatePreferences = useCallback((preferences) => {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    }, []);
    const contextValue = {
        ...state,
        addNotification,
        markRead,
        markAllRead,
        clearAll,
        removeNotification,
        updatePreferences,
    };
    return (_jsx(NotificationContext.Provider, { value: contextValue, children: children }));
};
export default NotificationProvider;
