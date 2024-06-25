import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconChanger } from '../components/serverPage/IconChanger';
import { ServerStatus } from '../components/serverPage/ServerStatus';
import { UsageIndicator } from '../components/serverPage/UsageIndicator';
import { ActionButtons } from '../components/serverPage/ActionButtons';

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
  const [icon, setIcon] = useState('/path/to/default/icon.png');

  useEffect(() => {
    const fetchServerDetails = async () => {
      if (id) {
        try {
          const server = await window.api.getServer(id);
          setServerName(server.name);
          setIcon(server.icon || '/path/to/default/icon.png');
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
    <div className="min-h-screen bg-base-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
        <div className="flex items-center mb-4">
          <IconChanger icon={icon} onChangeIcon={handleChangeIcon} />
          <ServerStatus name={serverName} status={status} />
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <UsageIndicator />
          </div>
          <ActionButtons onAction={handleAction} />
        </div>
      </div>
      <div className="text-center">
        <button className="btn btn-danger" onClick={removeServer}>Remove Server</button>
      </div>
    </div>
  );
};
