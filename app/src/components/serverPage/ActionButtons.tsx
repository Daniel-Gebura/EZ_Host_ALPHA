import React from 'react';

interface ActionButtonsProps {
  onAction: (action: string) => void;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

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
        className="btn btn-warning mb-2 md:mb-0"
        onClick={() => onAction('restart')}
        disabled={status !== 'Online'}
      >
        Restart Server
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
