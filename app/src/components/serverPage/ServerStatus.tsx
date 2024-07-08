import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Notification } from '../common/Notification';

interface ServerStatusProps {
  name: string;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
  onNameChange: (newName: string) => void;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ name, status, onNameChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const { id } = useParams<{ id: string }>();

  const getStatusDotColor = () => {
    switch (status) {
      case 'Offline':
        return 'bg-red-500';
      case 'Online':
        return 'bg-green-500';
      case 'Starting...':
        return 'bg-blue-500';
      case 'Stopping...':
        return 'bg-yellow-500';
      case 'Restarting...':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isLoading = status === 'Starting...' || status === 'Stopping...' || status === 'Restarting...';

  const handleNameChange = async () => {
    if (newName.length > 0 && newName.length <= 20) {
      try {
        const server = await window.api.getServer(id!);
        server.name = newName;
        await window.api.updateServer(id!, server);
        onNameChange(newName);
        setIsModalOpen(false);
        setNotification({ message: 'Server name updated successfully.', type: 'success' });
      } catch (error) {
        console.error('Error updating server name:', error);
        setNotification({ message: 'Error updating server name.', type: 'error' });
      }
    } else {
      setNotification({ message: 'Server name must be between 1 and 20 characters.', type: 'error' });
    }
  };

  return (
    <div>
      {notification && <Notification message={notification.message} type={notification.type} />}
      <h1 className="text-3xl font-bold cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {name}
      </h1>
      <div className="flex items-center mt-1 text-gray-500">
        <span className={`h-4 w-4 rounded-full mr-2 ${getStatusDotColor()}`} />
        <span className="text-lg">{status}</span>
        {isLoading && <span className="loading loading-bars loading-xs ml-2"></span>}
      </div>
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Server Name</h3>
            <input
              type="text"
              className="input input-bordered w-full mt-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={20}
            />
            <div className="modal-action">
              <button className="btn" onClick={handleNameChange}>
                Save
              </button>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
