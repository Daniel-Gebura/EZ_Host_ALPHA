import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput1 } from './TextInput1';
import { ChooseFile1 } from './ChooseFile1';
import defaultLogo from '../../assets/logo/EZ_Host_Logo1.png';

/**
 * AddButton component
 * Provides a button to open a modal for adding a new server.
 * 
 * @returns {JSX.Element}
 */
export const AddButton: React.FC = () => {
  const [serverName, setServerName] = useState('');
  const [directory, setDirectory] = useState('');
  const [serverIcon, setServerIcon] = useState(defaultLogo);
  const [rconPassword, setRconPassword] = useState('');
  const [agreeEula, setAgreeEula] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Adds a new server by calling the backend API
   */
  const addServer = async () => {
    if (!serverName || !directory || !rconPassword || !agreeEula) {
      setError('Please provide the server name, directory, RCON password, and agree to the EULA.');
      return;
    }

    const newServer = {
      name: serverName,
      directory: directory,
      icon: serverIcon,
      rconPassword: rconPassword,
    };
    try {
      const addedServer = await window.api.addServer(newServer);
      // Initialize the server
      await window.api.initServer(addedServer.id);
      setServerName('');
      setDirectory('');
      setServerIcon(defaultLogo);
      setRconPassword('');
      setAgreeEula(false);
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
          <h3 className="font-bold text-lg text-center mb-4">Add New Server</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4 p-4 bg-base-300 rounded-lg">
            <label className="label">
              <span className="label-text">Server Name</span>
            </label>
            <TextInput1
              value={serverName}
              onChange={setServerName}
              placeholder="Server Name"
            />
          </div>

          <div className="mb-4 p-4 bg-base-300 rounded-lg">
            <label className="label">
              <span className="label-text">Server Directory</span>
            </label>
            <ChooseFile1
              value={directory}
              onChange={setDirectory}
              placeholder="Server Directory"
            />
          </div>

          <div className="mb-4 p-4 bg-base-300 rounded-lg">
            <label className="label">
              <span className="label-text">RCON Password</span>
            </label>
            <TextInput1
              value={rconPassword}
              onChange={setRconPassword}
              placeholder="RCON Password"
            />
          </div>

          <div className="form-control mb-4 p-4 bg-base-300 rounded-lg">
            <label className="cursor-pointer flex items-center">
              <input 
                type="checkbox" 
                checked={agreeEula} 
                onChange={() => setAgreeEula(!agreeEula)} 
                className="checkbox checkbox-primary" 
              />
              <span className="label-text ml-2">I agree to the EULA</span>
            </label>
          </div>

          <button className="btn btn-primary w-full" onClick={addServer} disabled={!agreeEula}>Add Server</button>
        </div>
      </dialog>
    </>
  );
};
