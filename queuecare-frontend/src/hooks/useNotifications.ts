import { useContext } from 'react';
import {
  NotificationContext,
  NotificationContextType,
} from '@context/NotificationContext';

/**
 * Hook to access notification context
 * @returns Notification context with all methods and state
 * @throws Error if used outside NotificationProvider
 */
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}

export default useNotifications;
