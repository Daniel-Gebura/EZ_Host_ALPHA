import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'warning' | 'alert-error';
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
  const [parsedMessage, setParsedMessage] = useState('');
  const [parsedType, setParsedType] = useState<'success' | 'warning' | 'alert-error'>(type);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Parse the JSON message to extract the desired part
    try {
      const parsed = JSON.parse(message);
      setParsedMessage(parsed.message || message);
      setParsedType(parsed.type || type);
    } catch (error) {
      setParsedMessage(message);
      setParsedType(type);
    }

    return () => clearTimeout(timer);
  }, [message, type, duration]);

  if (!isVisible) return null;

  return (
    <div role="alert" className={`alert ${parsedType}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{parsedMessage}</span>
    </div>
  );
};
