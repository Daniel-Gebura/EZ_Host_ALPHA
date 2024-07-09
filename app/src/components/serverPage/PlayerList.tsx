import React, { useState, useEffect } from 'react';
import { api } from '../../api';

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

  /**
   * Fetch the list of players when the server status is 'Online'.
   */
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersList = await api.getPlayers(serverId);
        setPlayers(playersList);
      } catch (error) {
        console.error('Error fetching players list:', error);
      }
    };

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
      await api.setPlayerOp(serverId, playerName, op);
      setSelectedPlayer(null);
    } catch (error) {
      console.error(`Error setting player OP status:`, error);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold mb-4">Players</h3>
      <ul className="list-disc pl-5">
        {players.map((player) => (
          <li
            key={player}
            className={`mb-2 ${status === 'Online' ? 'cursor-pointer' : 'text-gray-400'}`}
            onClick={() => handlePlayerClick(player)}
          >
            {player}
            {selectedPlayer === player && (
              <div className="dropdown-content mt-1">
                <button className="btn btn-sm btn-primary mr-2" onClick={() => handleSetOp(player, true)}>
                  OP
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleSetOp(player, false)}>
                  Un-OP
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
