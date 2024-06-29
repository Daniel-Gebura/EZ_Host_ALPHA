import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput1 } from './TextInput1';
import { ForgeFabricToggle } from './ForgeFabricToggle';
import { ChooseFile1 } from './ChooseFile1';

/**
 * AddButton component
 * Provides a button to open a modal for adding a new server.
 * 
 * @returns {JSX.Element}
 */
export const AddButton: React.FC = () => {
  const [serverName, setServerName] = useState('');
  const [serverType, setServerType] = useState<'forge' | 'fabric'>('forge');
  const [directory, setDirectory] = useState('');
  const [rconPassword, setRconPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Adds a new server by calling the backend API
   */
  const addServer = async () => {
    if (!serverName || !directory || !rconPassword) {
      setError('Please provide the server name, directory, and RCON password.');
      return;
    }

    const newServer = {
      name: serverName,
      type: serverType,
      directory: directory,
      rconPassword: rconPassword,
    };
    try {
      const addedServer = await window.api.addServer(newServer);
      // Initialize the server
      await window.api.initServer(addedServer.id);
      setServerName('');
      setServerType('forge'); // Reset to default
      setDirectory('');
      setRconPassword('');
      setError(null);
      const modal = document.getElementById('add_server_modal') as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      // Navigate to the new server's page
      navigate(`/server/${addedServer.id}`);
    } catch (err) {
      setError('Failed to add and initialize the server.');
      console.error(err);
    }
  };

  return (
    <>
      <button className="btn btn-circle btn-outline btn-success" onClick={() => {
        const modal = document.getElementById('add_server_modal') as HTMLDialogElement;
        if (modal) {
          modal.showModal();
        }
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <dialog id="add_server_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Add New Server</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <TextInput1
            value={serverName}
            onChange={setServerName}
            placeholder="Server Name"
          />
          <ForgeFabricToggle
            value={serverType}
            onChange={setServerType}
          />
          <ChooseFile1
            value={directory}
            onChange={setDirectory}
            placeholder="Server Directory"
          />
          <TextInput1
            value={rconPassword}
            onChange={setRconPassword}
            placeholder="RCON Password"
          />
          <button className="btn btn-primary w-full mt-4" onClick={addServer}>Add Server</button>
        </div>
      </dialog>
    </>
  );
};
