import React, { useState, useEffect } from 'react';
import { Notification } from '../../../common/Notification';

interface PlayerListProps {
  serverId: string;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

/**
 * PlayerList component
 * Displays a list of players on the server and allows setting OP/Un-OP status.
 * 
 * @param {PlayerListProps} props - The props for the PlayerList component.
 * @param {string} props.serverId - The ID of the server.
 * @param {'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'} props.status - The current server status.
 * @returns {JSX.Element} The rendered PlayerList component.
 */
export const PlayerList: React.FC<PlayerListProps> = ({ serverId, status }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning', key: number } | null>(null);

  /**
   * Fetch the list of players from the server.
   */
  const fetchPlayers = async () => {
    const response = await window.api.getPlayers(serverId);
    if (response.status === 'success') {
      const playersList = response.data;
      setPlayers(playersList);
    } else {
      setNotification({
        message: response.message || response.error || 'An unexpected error occurred.',
        type: 'error',
        key: Date.now(),
      });
    }
  };

  useEffect(() => {
    if (status === 'Online') {
      fetchPlayers();
    }
  }, [status, serverId]);

  /**
   * Handle clicking on a player name to toggle selection.
   * 
   * @param {string} playerName - The name of the player.
   */
  const handlePlayerClick = (playerName: string) => {
    setSelectedPlayer(selectedPlayer === playerName ? null : playerName);
  };

  /**
   * Handle setting or unsetting a player as an operator.
   * 
   * @param {string} playerName - The name of the player.
   * @param {boolean} op - Whether to set or unset the player as an operator.
   */
  const handleSetOp = async (playerName: string, op: boolean) => {
    try {
      await window.api.setPlayerOp(serverId, playerName, op);
      setSelectedPlayer(null);
    } catch (error) {
      console.error(`Error setting player OP status:`, error);
    }
  };

  /**
   * Handle the refresh button click to refetch the player list.
   */
  const handleRefresh = () => {
    fetchPlayers();
  };

  return (
    <div className="mt-4 text-left"> {/* Ensure everything is aligned to the left */}
      {notification && <Notification key={notification.key} message={notification.message} type={notification.type} />}
      <div className="flex items-start mb-4"> {/* Align items to the start (left) */}
        <h3 className="text-xl font-bold mr-2">Players</h3>
        <button className="btn btn-outline btn-sm" onClick={handleRefresh} title="Refresh Player List">
          &#x21bb; {/* Unicode character for a refresh arrow */}
        </button>
      </div>
      {players.length > 0 ? (
        <ul className="list-disc pl-5">
          {players.map((player) => (
            <li key={player} className="mb-2">
              {player}
            </li>
          ))}
        </ul>
      ) : (
        <p>No Players Online</p>
      )}
    </div>
  );
};
