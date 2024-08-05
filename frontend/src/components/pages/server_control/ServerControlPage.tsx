import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconChanger } from './ServerIconChanger';
import { ServerStatus } from './ServerStatus';
import { HomeTab } from './home_tab/HomeTab';
import { GameSettingsTab } from './game_settings_tab/GameSettingsTab';
import { ServerSettingsTab } from './server_settings_tab/ServerSettingsTab';
import { Notification } from '../../common/Notification';
import defaultLogo from '../../../assets/logo/EZ_Host_Logo1.png';

export const ServerControlPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('');
  const [status, setStatus] = useState<'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'>('Offline');
  const [icon, setIcon] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'properties' | 'details'>('home');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning', key: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ramAllocation, setRamAllocation] = useState(4);
  const [ip, setIp] = useState('127.0.0.1');
  const [currentServerId, setCurrentServerId] = useState<string | null>(id || null);

  /**
   * Fetch server details from the backend.
   * @param {string} serverId - The ID of the server.
   */
  const fetchServerDetails = async (serverId: string) => {
    try {
      const response = await  window.api.getServer(serverId);
      if (response.status === 'success') {
        const server = response.data
        setServerName(server.name);
        setStatus(server.status);
        setIcon(server.icon || defaultLogo);
      }
      else {
        setNotification({
          message: response.message || response.error || 'An unexpected error occurred.',
          type: 'error',
          key: Date.now(),
        });
      }
      
      const ram = await  window.api.getRamAllocation(serverId);
      setRamAllocation(ram);

      const ipAddress = await  window.api.getIpAddress();
      setIp(ipAddress);

    } catch (error: any) {
      console.error('Error fetching server details:', error);
    }
  };

  useEffect(() => {
    if (id) {
      setCurrentServerId(id);
      fetchServerDetails(id);
    }
  }, [id]);

  useEffect(() => {
    const handleServersJsonChanged = () => {
      if (currentServerId) {
        fetchServerDetails(currentServerId);
      }
    };

    window.ipcRenderer.on('servers-json-changed', handleServersJsonChanged);

    return () => {
      window.ipcRenderer.removeAllListeners('servers-json-changed');
    };
  }, [currentServerId]);

  /**
   * Handle server actions (start, save, restart, stop).
   * @param {string} action - The action to perform.
   */
  const handleAction = async (action: string) => {
    if (!currentServerId) {
      console.error('Server ID is undefined');
      return;
    }
  
    try {
      if (action === 'start') {
        const servers = await window.api.getServers();
        const onlineServer = servers.find((server: any) => server.status === 'Online');
        if (onlineServer) {
          setIsModalOpen(true);
          return;
        }
      }
  
      // Execute the desired action
      let response: ApiResponse;
      switch (action) {
        case 'start':
          response = await window.api.startServer(currentServerId);
          break;
        case 'save':
          response = await window.api.saveServer(currentServerId);
          break;
        case 'stop':
          response = await window.api.stopServer(currentServerId);
          break;
        default:
          response = { status: 'error', message: 'Invalid action', error: 'Action not recognized' };
      }
  
      // Handle the api response
      if (response.status === 'success') {
        // Suppress a succesful start notification
        if (action !== 'start') {
          setNotification({
            message: response.message,
            type: 'success',
            key: Date.now(),
          });
        }
      } else {
        setNotification({
          message: response.message || response.error || 'An unexpected error occurred.',
          type: 'error',
          key: Date.now(),
        });
      }
  
      await fetchServerDetails(currentServerId);
    } catch (error: any) {
      console.error(`Error performing action '${action}':`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action} server: ${error.message}`;
      setNotification({ message: errorMessage, type: 'error', key: Date.now() });
    }
  };

  /**
   * Remove the current server.
   */
  const removeServer = async () => {
    if (currentServerId) {
      try {
        await window.api.deleteServer(currentServerId);
        navigate('/');
      } catch (error: any) {
        console.error('Error deleting server:', error);
      }
    } else {
      console.error('Server ID is undefined');
    }
  };

  /**
   * Handle changing the server icon.
   */
  const handleChangeIcon = async () => {
    const selectedIcon = await window.api.chooseFile();
    if (selectedIcon && currentServerId) {
      setIcon(selectedIcon);

      try {
        const response = await  window.api.getServer(currentServerId);
        if (response.status === 'success') {
          const server = response.data
          server.icon = selectedIcon;
          await window.api.updateServer(currentServerId, server);
        }
        else {
          setNotification({
            message: response.message || response.error || 'An unexpected error occurred.',
            type: 'error',
            key: Date.now(),
          });
        }
      } catch (error: any) {
        console.error('Error updating server icon:', error);
      }
    }
  };

  /**
   * Handle changing the RAM allocation.
   * @param {number} newRam - The new RAM allocation.
   */
  const handleRamChange = async (newRam: number) => {
    if (!currentServerId) {
      console.error('Server ID is undefined');
      return;
    }

    try {
      await window.api.updateRamAllocation(currentServerId, newRam);
      setRamAllocation(newRam);
    } catch (error: any) {
      console.error('Error updating RAM allocation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 lg:pl-32 lg:pr-32">
      {notification && <Notification key={notification.key} message={notification.message} type={notification.type} />}
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row items-center mb-4">
          <IconChanger icon={icon || defaultLogo} onChangeIcon={handleChangeIcon} />
          <div className="ml-4">
            <ServerStatus name={serverName} status={status} onNameChange={setServerName} />
          </div>
        </div>
        <div className="tabs tabs-boxed mt-4">
          <a
            className={`tab ${activeTab === 'home' ? 'tab-active bg-blue-500' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </a>
          <a
            className={`tab ${activeTab === 'properties' ? 'tab-active bg-blue-500' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            Server Properties
          </a>
          <a
            className={`tab ${activeTab === 'details' ? 'tab-active bg-blue-500' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Server Details
          </a>
        </div>
      </div>

      {activeTab === 'home' && <HomeTab status={status} handleAction={handleAction} removeServer={removeServer} serverId={currentServerId!} />}
      {activeTab === 'properties' && <GameSettingsTab serverId={currentServerId!} serverStatus={status} />}
      {activeTab === 'details' && <ServerSettingsTab ip={ip} ramAllocation={ramAllocation} onRamChange={handleRamChange} />}
      
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Warning</h3>
            <p>Only one server can be online at a time. Please stop the currently running server before starting a new one.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};