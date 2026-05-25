import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useWebSocket } from './useWebSocket';

/**
 * WebSocket notification subscription hook
 * Manages WebSocket connection for real-time notifications
 * Auto-subscribes to personal notification channel on mount
 * Automatically handles "called in queue" events
 *
 * Features:
 * - Automatic subscription to personal notification channel
 * - Handles appointment confirmed/cancelled events
 * - Handles "called in queue" events with high priority
 * - Handles doctor status change events
 * - Dispatches notifications to NotificationContext
 * - Triggers custom events for UI updates
 *
 * Usage:
 * const { isConnected, error } = useNotificationSubscription();
 *
 * @returns {Object} WebSocket connection state
 * @example
 * const { isConnected, error } = useNotificationSubscription();
 * if (!isConnected) {
 *   console.log('WebSocket disconnected');
 * }
 */
export function useNotificationSubscription() {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const { isConnected, subscribe, error } = useWebSocket();

  /**
   * Handle incoming notification messages
   */
  const handleNotificationMessage = useCallback((data: any) => {
    try {
      console.log('WebSocket notification received:', data);

      // Handle PatientNotificationMessage from backend
      if (data.notificationType) {
        const notification = data;

        // Handle "called" events - patient is being called for consultation
        if (notification.notificationType === 'CALLED') {
          console.log('Patient called for consultation:', notification);
          
          // Add high-priority notification
          addNotification({
            type: 'appointment',
            title: 'Your Turn is Now!',
            message: notification.message || 
              `Doctor ${notification.doctorName} is ready for you. Please proceed to the examination room immediately!`,
            actionUrl: `/patient/queue/${notification.doctorId}`,
            actionLabel: 'Go Now',
          });

          // Trigger custom event for immediate UI updates
          window.dispatchEvent(
            new CustomEvent('patientCalledInQueue', {
              detail: notification,
            })
          );
        }
        // Handle "turn near" - patient is next or 2 positions away
        else if (notification.notificationType === 'TURN_NEAR') {
          console.log('Patient turn is near:', notification);
          
          addNotification({
            type: 'appointment',
            title: 'Your Turn is Soon',
            message: notification.message || 
              `You are ${notification.patientsAhead} position(s) away from being called with Dr. ${notification.doctorName}.`,
            actionUrl: `/patient/queue/${notification.doctorId}`,
            actionLabel: 'View Queue',
          });
        }
        // Handle position updates
        else if (notification.notificationType === 'POSITION_UPDATE') {
          console.log('Queue position updated:', notification);
          
          addNotification({
            type: 'appointment',
            title: 'Queue Position Updated',
            message: notification.message || 
              `You are now at position ${notification.currentPosition}. Estimated wait: ${notification.estimatedWaitTimeMinutes} minutes.`,
            actionUrl: `/patient/queue/${notification.doctorId}`,
            actionLabel: 'View Details',
          });
        }
        // Handle appointment start
        else if (notification.notificationType === 'APPOINTMENT_START') {
          console.log('Appointment confirmed:', notification);
          
          addNotification({
            type: 'appointment',
            title: 'Appointment Confirmed',
            message: notification.message || 
              `Your appointment with Dr. ${notification.doctorName} is confirmed.`,
            actionUrl: `/patient/appointments`,
            actionLabel: 'View Appointment',
          });
        }
        // Handle cancellation
        else if (notification.notificationType === 'CANCELLED') {
          console.log('Appointment cancelled:', notification);
          
          addNotification({
            type: 'appointment',
            title: 'Cancelled',
            message: notification.message || 
              `Your appointment with Dr. ${notification.doctorName} has been cancelled.`,
          });
        }
        // Handle missed appointment
        else if (notification.notificationType === 'MISSED') {
          console.log('Appointment marked as missed:', notification);
          
          addNotification({
            type: 'appointment',
            title: 'Appointment Marked as Missed',
            message: notification.message || 
              `Your appointment with Dr. ${notification.doctorName} was marked as no-show.`,
          });
        }
        // Handle doctor delayed
        else if (notification.notificationType === 'DOCTOR_DELAYED') {
          console.log('Doctor is delayed:', notification);
          
          addNotification({
            type: 'appointment',
            title: 'Doctor Running Behind',
            message: notification.message || 
              `Dr. ${notification.doctorName} is running behind schedule.`,
          });
        }
      }
      // Handle other generic notification types
      else if (data.type === 'notification') {
        const payload = data.payload;

        // Handle "called in queue" events from generic notifications
        if (payload.type === 'called_in_queue' || payload.type === 'CALLED_IN_QUEUE') {
          console.log('Patient called in queue (generic):', payload);
          
          addNotification({
            type: 'appointment',
            title: 'Your Turn!',
            message: payload.message || `Token ${payload.tokenNumber} is now being called. Please proceed to the examination room immediately!`,
            actionUrl: payload.actionUrl,
            actionLabel: 'Go to Queue',
          });
        }
        // Handle appointment confirmed events
        else if (payload.type === 'appointment_confirmed' || payload.type === 'APPOINTMENT_CONFIRMED') {
          console.log('Appointment confirmed (generic):', payload);
          addNotification({
            type: 'appointment',
            title: 'Appointment Confirmed',
            message: payload.message || 'Your appointment has been confirmed.',
            actionUrl: payload.actionUrl,
            actionLabel: 'View Details',
          });
        }
        // Handle appointment cancelled events
        else if (payload.type === 'appointment_cancelled' || payload.type === 'APPOINTMENT_CANCELLED') {
          console.log('Appointment cancelled (generic):', payload);
          addNotification({
            type: 'appointment',
            title: 'Appointment Cancelled',
            message: payload.message || 'Your appointment has been cancelled.',
          });
        }
        // Handle doctor status change events
        else if (payload.type === 'doctor_status_changed' || payload.type === 'DOCTOR_STATUS_CHANGED') {
          console.log('Doctor status changed (generic):', payload);
          addNotification({
            type: 'system',
            title: 'Doctor Status Updated',
            message: payload.message || 'The assigned doctor\'s status has changed.',
          });
        }
        // Handle other generic notifications
        else {
          addNotification({
            type: payload.type || 'system',
            title: payload.title || 'Notification',
            message: payload.message || '',
            actionUrl: payload.actionUrl,
            actionLabel: payload.actionLabel,
          });
        }
      }

      // Handle queue status updates
      if (data.type === 'queue_status_update') {
        console.log('Queue status update received:', data.payload);
        window.dispatchEvent(
          new CustomEvent('queueStatusUpdate', {
            detail: data.payload,
          })
        );
      }

      // Handle token status changes
      if (data.type === 'token_status_change') {
        console.log('Token status changed:', data.payload);
        window.dispatchEvent(
          new CustomEvent('tokenStatusChange', {
            detail: data.payload,
          })
        );
      }

      // Handle connection confirmations
      if (data.type === 'subscribed') {
        console.log('Successfully subscribed to notifications channel:', data.channel);
      }

      if (data.type === 'pong') {
        console.log('WebSocket pong received');
      }
    } catch (error) {
      console.error('Error parsing WebSocket notification message:', error);
    }
  }, [addNotification]);

  /**
   * Subscribe to notification channel on mount
   */
  useEffect(() => {
    if (isConnected && user?.id && isAuthenticated) {
      // Subscribe to user-specific notification queue using STOMP user destination
      const notificationDestination = `/user/${user.id}/topic/notifications`;
      console.log(`Subscribing to notifications for user: ${user.id}`);
      
      const unsubscribeFn = subscribe(notificationDestination, handleNotificationMessage);

      return () => {
        if (unsubscribeFn) {
          unsubscribeFn();
        }
      };
    }
  }, [isConnected, user?.id, isAuthenticated, subscribe, handleNotificationMessage]);

  return {
    isConnected,
    error,
  };
}

export default useNotificationSubscription;
