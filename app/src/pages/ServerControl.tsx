import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconChanger } from '../components/serverPage/IconChanger';
import { ServerStatus } from '../components/serverPage/ServerStatus';
import { HomeTab } from '../components/serverPage/HomeTab';
import { ServerPropertiesTab } from '../components/serverPage/ServerPropertiesTab';
import { ServerDetailsTab } from '../components/serverPage/ServerDetailsTab'; // Import ServerDetailsTab
import { Notification } from '../components/common/Notification';
import defaultLogo from '../assets/logo/EZ_Host_Logo1.png';

export const ServerControl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('');
  const [status, setStatus] = useState<'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'>('Offline');
  const [icon, setIcon] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'properties' | 'serverDetails'>('home'); // Update tab state
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      // Check if any server is online
      if (action === 'start') {
        const servers = await window.api.getServers();
        const onlineServer = servers.find((server: any) => server.status === 'Online');
        if (onlineServer) {
          setIsModalOpen(true);
          return;
        }
      }

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
      setNotification({ message: response, type: 'success' });
      await fetchServerDetails();
    } catch (error: any) {
      console.error(`Error performing action '${action}':`, error);
      setNotification({ message: `Failed to ${action} server: ${error.message}`, type: 'error' });
    }
  };

  const removeServer = async () => {
    if (id) {
      try {
        await window.api.deleteServer(id);
        navigate('/');
        setNotification({ message: 'Server deleted successfully.', type: 'success' });
      } catch (error: any) {
        console.error('Error deleting server:', error);
        setNotification({ message: `Failed to delete server: ${error.message}`, type: 'error' });
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
          setNotification({ message: 'Failed to update server icon.', type: 'error' });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 lg:pl-32 lg:pr-32">
      {notification && <Notification message={notification.message} type={notification.type} />}
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
            className={`tab ${activeTab === 'serverDetails' ? 'tab-active bg-blue-500' : ''}`}
            onClick={() => setActiveTab('serverDetails')}
          >
            Server Details
          </a>
        </div>
      </div>

      {activeTab === 'home' && <HomeTab status={status} handleAction={handleAction} removeServer={removeServer} />}
      {activeTab === 'properties' && <ServerPropertiesTab serverId={id!} serverStatus={status} />}
      {activeTab === 'serverDetails' && <ServerDetailsTab serverId={id!} />}
      
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
