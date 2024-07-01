import React, { useState, useEffect } from 'react';
import { AddButton } from '../common/AddButton';
import { HomeButton } from '../common/HomeButton';
import { ServerButton } from '../common/ServerButton';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

interface Server {
  id: string;
  name: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = async () => {
    try {
      const serverList = await window.api.getServers();
      if (Array.isArray(serverList)) {
        setServers(serverList);
      } else {
        throw new Error('Server data is not an array');
      }
    } catch (err) {
      setError('Failed to fetch servers');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    const handleServersJsonChanged = () => {
      fetchServers();
    };

    window.ipcRenderer.on('servers-json-changed', handleServersJsonChanged);

    return () => {
      window.ipcRenderer.removeAllListeners('servers-json-changed');
    };
  }, []);

  return (
    <div
      className={`fixed top-[5rem] left-0 h-[calc(100%-5rem)] bg-base-200 p-4 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 z-20`}
    >
      <div className="flex justify-center mb-4">
        <HomeButton />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {servers.length === 0 && <div className="text-center text-gray-500">No servers added</div>}
      {servers.map((server) => (
        <div className="flex justify-center mb-4" key={server.id}>
          <ServerButton id={server.id} name={server.name} />
        </div>
      ))}
      <div className="flex justify-center mb-4">
        <AddButton />
      </div>
    </div>
  );
};
