import React from 'react';
import { ActionButtons } from './ActionButtons';

interface HomeTabProps {
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
  handleAction: (action: string) => void;
  removeServer: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ status, handleAction, removeServer }) => {
  // Determine if the action buttons should be disabled based on server status
  const isActionDisabled = status === 'Starting...' || status === 'Stopping...' || status === 'Restarting...';

  return (
    <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Server Controls</h2>
      <div className="flex justify-center">
        <ActionButtons onAction={handleAction} disabled={isActionDisabled} />
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-danger" onClick={removeServer} disabled={status !== 'Offline'}>
          Remove Server
        </button>
      </div>
    </div>
  );
};
