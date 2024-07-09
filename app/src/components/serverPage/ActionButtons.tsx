import React from 'react';

interface ActionButtonsProps {
  onAction: (action: string) => void;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

/**
 * ActionButtons component
 * Renders buttons for various server actions (start, save, stop).
 * 
 * @param {ActionButtonsProps} props - The props for the ActionButtons component.
 * @param {function} props.onAction - The function to call when an action button is clicked.
 * @param {'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'} props.status - The current server status.
 * @returns {JSX.Element} The rendered ActionButtons component.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, status }) => {
  return (
    <div className="flex flex-col md:flex-row md:space-x-4 justify-center w-full md:w-auto">
      <button
        className="btn btn-primary mb-2 md:mb-0"
        onClick={() => onAction('start')}
        disabled={status !== 'Offline'}
      >
        Start Server
      </button>

      <button
        className="btn btn-outline btn-primary mb-2 md:mb-0"
        onClick={() => onAction('save')}
        disabled={status !== 'Online'}
      >
        Save Server
      </button>
      
      <button
        className="btn btn-secondary mb-2 md:mb-0"
        onClick={() => onAction('stop')}
        disabled={status !== 'Online'}
      >
        Stop Server
      </button>
    </div>
  );
};
