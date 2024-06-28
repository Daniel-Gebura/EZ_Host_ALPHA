import React from 'react';

interface ActionButtonsProps {
  onAction: (action: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col md:flex-row md:space-x-4 justify-center w-full md:w-auto">
      <button className="btn btn-primary mb-2 md:mb-0" onClick={() => onAction('start')}>Start Server</button>
      <button className="btn btn-outline btn-primary mb-2 md:mb-0" onClick={() => onAction('save')}>Save Server</button>
      <button className="btn btn-warning mb-2 md:mb-0" onClick={() => onAction('restart')}>Restart Server</button>
      <button className="btn btn-secondary mb-2 md:mb-0" onClick={() => onAction('stop')}>Stop Server</button>
    </div>
  );
};
