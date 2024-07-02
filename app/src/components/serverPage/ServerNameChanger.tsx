import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

interface ServerNameChangerProps {
  name: string;
  onNameChange: (newName: string) => void;
}

export const ServerNameChanger: React.FC<ServerNameChangerProps> = ({ name, onNameChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const { id } = useParams<{ id: string }>();

  const handleNameChange = async () => {
    if (newName.length > 0 && newName.length <= 20) {
      try {
        const server = await window.api.getServer(id!);
        server.name = newName;
        await window.api.updateServer(id!, server);
        onNameChange(newName);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating server name:', error);
      }
    } else {
      alert('Server name must be between 1 and 20 characters.');
    }
  };

  return (
    <div>
      <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>
        {name}
      </button>
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
