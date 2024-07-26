import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
}

const alertIcons = {
  success: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  error: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
};

/**
 * Notification component
 * Displays a notification message that automatically disappears after a set duration.
 * 
 * @param {NotificationProps} props - The props for the Notification component.
 * @param {string} props.message - The notification message.
 * @param {string} props.type - The type of notification ('success', 'error', or 'warning').
 * @param {number} [props.duration=3000] - The duration (in milliseconds) for which the notification is visible.
 * @returns {JSX.Element | null} The rendered Notification component or null if not visible.
 */
export const Notification: React.FC<NotificationProps> = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [parsedMessage, setParsedMessage] = useState('');

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Parse the JSON message to extract the desired part
    try {
      const parsed = JSON.parse(message);
      setParsedMessage(parsed.message || message);
    } catch (error) {
      setParsedMessage(message);
    }

    return () => clearTimeout(timer);
  }, [message, type, duration]);

  if (!isVisible) return null;

  const alertClass = type === 'error' ? 'alert-error'
    : type === 'warning' ? 'alert-warning'
    : 'alert-success';

  return (
    <div role="alert" className={`alert ${alertClass}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24">
        {alertIcons[type]}
      </svg>
      <span>{parsedMessage}</span>
    </div>
  );
};