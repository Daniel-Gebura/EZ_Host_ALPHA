import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconChanger } from '../components/serverPage/IconChanger';
import { ServerStatus } from '../components/serverPage/ServerStatus';
import { HomeTab } from '../components/serverPage/HomeTab';
import { ServerPropertiesTab } from '../components/serverPage/ServerPropertiesTab';
import { ConsoleTab } from '../components/serverPage/ConsoleTab';
import defaultLogo from '../assets/logo/EZ_Host_Logo1.png';

export const ServerControl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('');
  const [status, setStatus] = useState<'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'>('Offline');
  const [icon, setIcon] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'properties' | 'console'>('home');

  const fetchServerDetails = async () => {
    if (id) {
      try {
        const server = await window.api.getServer(id);
        setServerName(server.name);
        setStatus(server.status);
        setIcon(server.icon || defaultLogo);
      } catch (error: any) {
        console.error('Error fetching server details:', error);
      }
    }
  };

  useEffect(() => {
    fetchServerDetails();
  }, [id]);

  useEffect(() => {
    const handleServersJsonChanged = () => {
      fetchServerDetails();
    };

    window.ipcRenderer.on('servers-json-changed', handleServersJsonChanged);

    return () => {
      window.ipcRenderer.removeAllListeners('servers-json-changed');
    };
  }, []);

  const handleAction = async (action: string) => {
    if (!id) {
      console.error('Server ID is undefined');
      return;
    }

    try {
      let response;
      switch (action) {
        case 'start':
          response = await window.api.startServer(id);
          break;
        case 'save':
          response = await window.api.saveServer(id);
          break;
        case 'restart':
          response = await window.api.restartServer(id);
          break;
        case 'stop':
          response = await window.api.stopServer(id);
          break;
        default:
          response = 'Invalid action';
      }
      alert(response);
      await fetchServerDetails();
    } catch (error: any) {
      console.error(`Error performing action '${action}':`, error);
      alert(`Failed to ${action} server: ${error.message}`);
    }
  };

  const removeServer = async () => {
    if (id) {
      try {
        await window.api.deleteServer(id);
        navigate('/');
      } catch (error: any) {
        console.error('Error deleting server:', error);
        alert(`Failed to delete server: ${error.message}`);
      }
    } else {
      console.error('Server ID is undefined');
    }
  };

  const handleChangeIcon = async () => {
    const selectedIcon = await window.api.chooseFile();
    if (selectedIcon) {
      setIcon(selectedIcon);

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
    <div className="min-h-screen bg-base-100 p-4 lg:pl-32 lg:pr-32">
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row items-center mb-4">
          <IconChanger icon={icon || defaultLogo} onChangeIcon={handleChangeIcon} />
          <div className="ml-4">
            <ServerStatus name={serverName} status={status} onNameChange={setServerName} />
          </div>
        </div>
        <div className="tabs tabs-boxed mt-4">
          <a
            className={`tab ${activeTab === 'home' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </a>
          <a
            className={`tab ${activeTab === 'properties' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            Server Properties
          </a>
          <a
            className={`tab ${activeTab === 'console' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('console')}
          >
            Console
          </a>
        </div>
      </div>

      {activeTab === 'home' && <HomeTab status={status} handleAction={handleAction} removeServer={removeServer} />}
      {activeTab === 'properties' && <ServerPropertiesTab serverId={id!} serverStatus={status}/>}
      {activeTab === 'console' && <ConsoleTab />}
    </div>
  );
};
