import { useState, useCallback } from 'react';
import { Notification } from '../components/common/Notification';

/**
 * Custom hook for checking server status.
 * 
 * @returns An object containing the server status and a function to check the server status.
 */
export const useServerStatus = () => {
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning', key: number } | null>(null);

  /**
   * Handles the server status check by calling the backend API.
   */
  const checkServerStatus = useCallback(async () => {

    // Use api call to update the status 
    const response = await window.api.checkServerStatus();
    if (response.status === 'error') {
      const server = response.data
      setNotification({
        message: response.message || response.error || 'An unexpected error occurred.',
        type: 'error',
        key: Date.now(),
      });
    }
  }, []);

  return {
    notification,
    checkServerStatus,
  };
};