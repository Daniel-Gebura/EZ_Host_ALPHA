import React, { useState, useEffect } from 'react';
import { Notification } from '../../../common/Notification';

interface GameSettingsTabProps {
  serverId: string;
  serverStatus: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

/**
 * GameSettingsTab component
 * Displays and allows editing of server properties.
 * 
 * @param {GameSettingsTabProps} props - The props for the GameSettingsTab component.
 * @param {string} props.serverId - The ID of the server.
 * @param {'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'} props.serverStatus - The current server status.
 * @returns {JSX.Element} The rendered GameSettingsTabProps component.
 */
export const GameSettingsTab: React.FC<GameSettingsTabProps> = ({ serverId, serverStatus }) => {
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning', key: number } | null>(null);
  const [properties, setProperties] = useState({
    'allow-flight': 'false',
    'allow-nether': 'true',
    difficulty: 'normal',
    gamemode: 'survival',
    hardcore: 'false',
    pvp: 'true',
    'spawn-animals': 'true',
    'spawn-monsters': 'true',
    'spawn-npcs': 'true',
  });

  /**
   * Fetch the server properties from the backend API.
   */
  const fetchProperties = async () => {
    const response = await  window.api.getServerProperties(serverId);
    if (response.status === 'success') {
      const result = response.data
      setProperties(result);
    }
    else {
      setNotification({
        message: response.message || response.error || 'An unexpected error occurred.',
        type: 'error',
        key: Date.now(),
      });
    }
  };

  /**
   * Save the updated server properties to the backend API.
   */
  const saveProperties = async () => {
    try {
      await  window.api.saveServerProperties(serverId, properties);
    } catch (error) {
      console.error('Error saving server properties:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [serverId]);

  /**
   * Handle changes to the server properties form inputs.
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event for the select input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProperties((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
      {notification && <Notification key={notification.key} message={notification.message} type={notification.type} />}
      <h2 className="text-2xl font-bold mb-4">Server Properties</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Allow Flying</label>
          <select name="allow-flight" value={properties['allow-flight']} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Allow Nether</label>
          <select name="allow-nether" value={properties['allow-nether']} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select name="difficulty" value={properties.difficulty} onChange={handleChange} className="select select-bordered w-full">
            <option value="peaceful">Peaceful</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Game Mode</label>
          <select name="gamemode" value={properties.gamemode} onChange={handleChange} className="select select-bordered w-full">
            <option value="survival">Survival</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hardcore Mode</label>
          <select name="hardcore" value={properties.hardcore} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PvP</label>
          <select name="pvp" value={properties.pvp} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spawn Animals</label>
          <select name="spawn-animals" value={properties['spawn-animals']} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spawn Monsters</label>
          <select name="spawn-monsters" value={properties['spawn-monsters']} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spawn NPC's</label>
          <select name="spawn-npcs" value={properties['spawn-npcs']} onChange={handleChange} className="select select-bordered w-full">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>
      <div className="text-right mt-4">
        <button className="btn btn-primary" onClick={saveProperties}>
          Save
        </button>
      </div>
    </div>
  );
};
