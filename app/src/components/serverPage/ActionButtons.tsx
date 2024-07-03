import React from 'react';

interface ActionButtonsProps {
  onAction: (action: string) => void;
  disabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, disabled }) => {
  return (
    <div className="flex flex-col md:flex-row md:space-x-4 justify-center w-full md:w-auto">
      <button
        className="btn btn-primary mb-2 md:mb-0"
        onClick={() => onAction('start')}
        disabled={disabled}
      >
        Start Server
      </button>

      <button
        className="btn btn-outline btn-primary mb-2 md:mb-0"
        onClick={() => onAction('save')}
        disabled={disabled}
      >
        Save Server
      </button>

      <button
        className="btn btn-warning mb-2 md:mb-0"
        onClick={() => onAction('restart')}
        disabled={disabled}
      >
        Restart Server
      </button>
      
      <button
        className="btn btn-secondary mb-2 md:mb-0"
        onClick={() => onAction('stop')}
        disabled={disabled}
      >
        Stop Server
      </button>
    </div>
  );
};
