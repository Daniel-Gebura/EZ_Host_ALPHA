import React, { useState } from 'react';
import { TextInput1 } from './TextInput1';
import { ChooseFile1 } from './ChooseFile1';
import { Checkbox } from './Checkbox';
import { api } from '../../api';
import defaultLogo from '../../assets/logo/EZ_Host_Logo1.png';

interface AddServerFormProps {
  onServerAdded: (serverId: string) => void;
}

/**
 * AddServerForm component
 * Form for adding a new server.
 * 
 * @param {AddServerFormProps} props - The props for the AddServerForm component.
 * @returns {JSX.Element}
 */
export const AddServerForm: React.FC<AddServerFormProps> = ({ onServerAdded }) => {
  const [serverName, setServerName] = useState('');
  const [directory, setDirectory] = useState('');
  const [serverIcon, setServerIcon] = useState(defaultLogo);
  const [rconPassword, setRconPassword] = useState('');
  const [agreeEula, setAgreeEula] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Adds a new server by calling the backend API
   */
  const addServer = async () => {
    if (!serverName || !directory || !rconPassword || !agreeEula) {
      setError('Please provide the server name, directory, RCON password, and agree to the EULA.');
      return;
    }

    setIsLoading(true);
    const newServer = {
      name: serverName,
      directory: directory,
      icon: serverIcon,
      rconPassword: rconPassword,
    };
    try {
      const addedServer = await api.addServer(newServer);
      // Initialize the server
      await api.initServer(addedServer.id);
      setServerName('');
      setDirectory('');
      setServerIcon(defaultLogo);
      setRconPassword('');
      setAgreeEula(false);
      setError(null);
      onServerAdded(addedServer.id);
    } catch (err) {
      setError('Failed to add and initialize the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
        <Checkbox
          label="I agree to the EULA"
          checked={agreeEula}
          onChange={() => setAgreeEula(!agreeEula)}
        />
      </div>

      <button className="btn btn-primary w-full" onClick={addServer} disabled={!agreeEula || isLoading}>
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          'Add Server'
        )}
      </button>
    </>
  );
};
