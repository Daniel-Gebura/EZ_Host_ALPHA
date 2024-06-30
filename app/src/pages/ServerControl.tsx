import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconChanger } from '../components/serverPage/IconChanger';
import { ServerStatus } from '../components/serverPage/ServerStatus';
import { UsageIndicator } from '../components/serverPage/UsageIndicator';
import { ActionButtons } from '../components/serverPage/ActionButtons';
import defaultLogo from '../assets/logo/EZ_Host_Logo1.png'; // Import the default logo

/**
 * ServerControl component
 * Provides controls to start, save, restart, and stop a server.
 * 
 * @returns {JSX.Element}
 */
export const ServerControl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('Loading...');
  const [status, setStatus] = useState<'running' | 'restarting' | 'offline'>('offline');
  const [icon, setIcon] = useState<string | null>(null); // Initialize icon state

  useEffect(() => {
    const fetchServerDetails = async () => {
      if (id) {
        try {
          const server = await window.api.getServer(id);
          setServerName(server.name);
          setIcon(server.icon || defaultLogo); // Set icon or default logo
        } catch (error: any) {
          console.error('Error fetching server details:', error);
        }
      }
    };

    fetchServerDetails();
  }, [id]);

  /**
   * Handles server actions by calling the appropriate backend API
   * @param {string} action - The action to perform (start, save, restart, stop)
   */
  const handleAction = async (action: string) => {
    if (!id) {
      console.error('Server ID is undefined');
      return;
    }

    let response;
    try {
      switch (action) {
        case 'start':
          response = await window.api.startServer(id);
          setStatus('running');
          break;
        case 'save':
          response = await window.api.saveServer(id);
          break;
        case 'restart':
          response = await window.api.restartServer(id);
          setStatus('restarting');
          break;
        case 'stop':
          response = await window.api.stopServer(id);
          setStatus('offline');
          break;
        default:
          response = 'Invalid action';
      }
      alert(response);
    } catch (error: any) { // Explicitly typing error as any
      console.error(`Error performing action '${action}':`, error);
      alert(`Failed to ${action} server: ${error.message}`);
    }
  };

  /**
   * Removes the server and navigates back to the home page
   */
  const removeServer = async () => {
    if (id) {
      try {
        await window.api.deleteServer(id);
        navigate('/');
      } catch (error: any) { // Explicitly typing error as any
        console.error('Error deleting server:', error);
        alert(`Failed to delete server: ${error.message}`);
      }
    } else {
      console.error('Server ID is undefined');
    }
  };

  /**
   * Handles icon change by opening a file dialog
   */
  const handleChangeIcon = async () => {
    const selectedIcon = await window.api.chooseFile();
    if (selectedIcon) {
      setIcon(selectedIcon);

      // Save the new icon path to the server details
      if (id) {
        try {
          const server = await window.api.getServer(id);
          server.icon = selectedIcon;
          await window.api.updateServer(id, server);
        } catch (error: any) {
          console.error('Error updating server icon:', error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 lg:pl-32 lg:pr-32"> {/* Adjusted padding for larger screens */}
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row items-center mb-4">
          <IconChanger icon={icon || defaultLogo} onChangeIcon={handleChangeIcon} />
          <div className="ml-4">
            <h1 className="text-3xl font-bold">{serverName}</h1>
            <div className="flex items-center mt-2">
              <div className={`h-4 w-4 rounded-full ${status === 'running' ? 'bg-green-500' : status === 'restarting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="ml-2 text-lg">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col mr-4 mb-4 md:mb-0">
            <button className="btn btn-outline mb-2">CPU</button>
            <button className="btn btn-outline mb-2">RAM</button>
            <button className="btn btn-outline">Both</button>
          </div>
          <div className="flex-grow">
            <UsageIndicator />
          </div>
        </div>
      </div>
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Server Controls</h2>
        <div className="flex justify-center">
          <ActionButtons onAction={handleAction} />
        </div>
      </div>
      <div className="text-center">
        <button className="btn btn-danger" onClick={removeServer}>Remove Server</button>
      </div>
    </div>
  );
};
