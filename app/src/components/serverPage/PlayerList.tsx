import React, { useState, useEffect } from 'react';

interface PlayerListProps {
  serverId: string;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

export const PlayerList: React.FC<PlayerListProps> = ({ serverId, status }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersList = await window.api.getPlayers(serverId);
        setPlayers(playersList);
      } catch (error) {
        console.error('Error fetching players list:', error);
      }
    };

    if (status === 'Online') {
      fetchPlayers();
    }
  }, [status, serverId]);

  const handlePlayerClick = (playerName: string) => {
    setSelectedPlayer(selectedPlayer === playerName ? null : playerName);
  };

  const handleSetOp = async (playerName: string, op: boolean) => {
    try {
      await window.api.setPlayerOp(serverId, playerName, op);
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
            className={`mb-2 ${status === 'Online' ? '' : 'text-gray-400'}`}
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
