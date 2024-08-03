import { useState, useCallback } from 'react';

/**
 * Custom hook for checking server status.
 * 
 * @returns An object containing the server status and a function to check the server status.
 */
export const useServerStatus = () => {
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Handles the server status check by calling the backend API.
   */
  const checkServerStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await window.api.checkServerStatus(); // The API call, which returns void
      setServerStatus('Updated'); // This is a placeholder, use as needed
      console.log('Server statuses updated successfully.');
    } catch (error: any) {
      console.error('Error checking server status:', error);
      setError('Failed to update server status.');
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are empty because there's no specific dependency

  return {
    serverStatus,
    checkServerStatus,
    error,
    loading,
  };
};