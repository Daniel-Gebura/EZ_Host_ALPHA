import React, { useState, useEffect } from 'react';
import { Notification } from '../common/Notification';

interface ServerPropertiesTabProps {
  serverId: string;
  serverStatus: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

export const ServerPropertiesTab: React.FC<ServerPropertiesTabProps> = ({ serverId, serverStatus }) => {
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
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const fetchProperties = async () => {
    try {
      const result = await window.api.getServerProperties(serverId);
      setProperties(result);
    } catch (error) {
      console.error('Error fetching server properties:', error);
    }
  };

  const saveProperties = async () => {
    try {
      await window.api.saveServerProperties(serverId, properties);
      if (serverStatus === 'Online') {
        await window.api.sendRconCommand(serverId, '/reload');
      }
      setNotification({ message: 'Server properties saved successfully.', type: 'success' });
    } catch (error) {
      console.error('Error saving server properties:', error);
      setNotification({ message: 'Failed to save server properties.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [serverId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProperties((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
      {notification && <Notification message={notification.message} type={notification.type} />}
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
