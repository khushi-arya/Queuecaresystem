import React, { createContext, useReducer, useCallback, useEffect, ReactNode } from 'react';

/**
 * Notification types
 */
export type NotificationType = 
  | 'appointment'
  | 'prescription'
  | 'message'
  | 'system'
  | 'payment'
  | 'profile_update';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  appointment: boolean;
  prescription: boolean;
  message: boolean;
  system: boolean;
  payment: boolean;
  profile_update: boolean;
}

/**
 * Notification context state
 */
export interface NotificationContextState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
}

/**
 * Notification context actions
 */
export type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'CLEAR_ALL' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<NotificationPreferences> }
  | { type: 'LOAD_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'LOAD_NOTIFICATIONS'; payload: Notification[] };

/**
 * Notification context type
 */
export interface NotificationContextType extends NotificationContextState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  removeNotification: (notificationId: string) => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

/**
 * Default notification preferences
 */
const DEFAULT_PREFERENCES: NotificationPreferences = {
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
const initialState: NotificationContextState = {
  notifications: [],
  preferences: DEFAULT_PREFERENCES,
  unreadCount: 0,
};

/**
 * Reducer function for notification actions
 */
function notificationReducer(
  state: NotificationContextState,
  action: NotificationAction
): NotificationContextState {
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
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
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
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Notification Provider Component
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications);
        dispatch({ type: 'LOAD_NOTIFICATIONS', payload: notifications });
      } catch (error) {
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
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        isRead: false,
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    },
    []
  );

  /**
   * Mark a notification as read
   */
  const markRead = useCallback((notificationId: string) => {
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
  const removeNotification = useCallback((notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  }, []);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback((preferences: Partial<NotificationPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const contextValue: NotificationContextType = {
    ...state,
    addNotification,
    markRead,
    markAllRead,
    clearAll,
    removeNotification,
    updatePreferences,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
