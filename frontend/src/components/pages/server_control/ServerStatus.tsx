import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Notification } from '../../common/Notification';

interface ServerStatusProps {
  name: string;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
  onNameChange: (newName: string) => void;
}

/**
 * ServerStatus component
 * Displays the server status and allows changing the server name.
 * 
 * @param {ServerStatusProps} props - The props for the ServerStatus component.
 * @param {string} props.name - The current server name.
 * @param {'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...'} props.status - The current server status.
 * @param {function} props.onNameChange - The function to call when the server name changes.
 * @returns {JSX.Element} The rendered ServerStatus component.
 */
export const ServerStatus: React.FC<ServerStatusProps> = ({ name, status, onNameChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const { id } = useParams<{ id: string }>();

  /**
   * Get the color of the status dot based on the server status.
   * 
   * @returns {string} The CSS class for the status dot color.
   */
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

  /**
   * Handle changing the server name.
   * 
   * Validates the new name and updates the server name via the backend API.
   */
  const handleNameChange = async () => {
    if (newName.length > 0 && newName.length <= 20) {
      try {
        const server = await  window.api.getServer(id!);
        server.name = newName;
        await  window.api.updateServer(id!, server);
        onNameChange(newName);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating server name:', error);
      }
    }
  };

  return (
    <div>
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
