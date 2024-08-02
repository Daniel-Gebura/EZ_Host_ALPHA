import React from 'react';
import { ServerActionButtons } from './ServerActionButtons';
import { PlayerList } from './PlayerList';

interface HomeTabProps {
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
  handleAction: (action: string) => void;
  removeServer: () => void;
  serverId: string;
}

/**
 * HomeTab component
 * Displays server controls and the player list.
 * 
 * @param {HomeTabProps} props - The props for the HomeTab component.
 * @param {'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'} props.status - The current server status.
 * @param {function} props.handleAction - The function to call for server actions (start, stop, save, restart).
 * @param {function} props.removeServer - The function to call to remove the server.
 * @param {string} props.serverId - The ID of the server.
 * @returns {JSX.Element} The rendered HomeTab component.
 */
export const HomeTab: React.FC<HomeTabProps> = ({ status, handleAction, removeServer, serverId }) => {
  return (
    <div>
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Server Controls</h2>
        <div className="flex justify-center">
          <ServerActionButtons onAction={handleAction} status={status} />
        </div>
        <PlayerList serverId={serverId} status={status} />
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-danger" onClick={removeServer} disabled={status !== 'Offline'}>
          Remove Server
        </button>
      </div>
    </div>
  );
};
