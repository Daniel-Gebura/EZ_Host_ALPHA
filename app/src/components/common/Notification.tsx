import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

/**
 * Notification component
 * Displays a notification message that automatically disappears after a set duration.
 * 
 * @param {NotificationProps} props - The props for the Notification component.
 * @param {string} props.message - The notification message.
 * @param {'success' | 'error'} props.type - The type of notification ('success' or 'error').
 * @param {number} [props.duration=3000] - The duration (in milliseconds) for which the notification is visible.
 * @returns {JSX.Element | null} The rendered Notification component or null if not visible.
 */
export const Notification: React.FC<NotificationProps> = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div role="alert" className={`fixed top-4 right-4 alert ${type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
      <div>
        <span>{message}</span>
      </div>
    </div>
  );
};
