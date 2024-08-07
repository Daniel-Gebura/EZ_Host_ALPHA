import React, { useState } from 'react';
import { TextInput1 } from '../../common/TextInput1';
import { ChooseDirectory } from '../../common/ChooseDirectory';
import { Checkbox } from '../../common/Checkbox';
import defaultLogo from '../../../assets/logo/EZ_Host_Logo1.png';

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
    // Check that all required fields have been filled out correctly
    if (!serverName || !directory || !rconPassword || !agreeEula) {
      setError('Please provide the server name, directory, RCON password, and agree to the EULA.');
      return;
    }
    const variablesFileExists = await window.ipcRenderer.checkFileExistence(directory, 'variables.txt');
    if (!variablesFileExists) {
      setError('The chosen directory does not contain necessary files. Please select a valid server directory.');
      return;
    }

    // Begin adding/init server process
    setIsLoading(true);
    const newServer = {
      name: serverName,
      directory: directory,
      icon: serverIcon,
      rconPassword: rconPassword,
    };
    
    // Add Server
    const addServerResponse = await window.api.addServer(newServer);
    if (addServerResponse.status === 'success') {
      const addedServer = addServerResponse.data;
      // Init Server
      const initServerResponse = await window.api.initServer(addedServer.id);
      if (initServerResponse.status === 'success') {
        setServerName('');
        setDirectory('');
        setServerIcon(defaultLogo);
        setRconPassword('');
        setAgreeEula(false);
        setError(null);
        onServerAdded(addedServer.id);
      } else {
        setError('Failed to initialize the server.');
        await window.api.deleteServer(addedServer);
      }
    } else {
      setError(addServerResponse.message);
    }

    // Stop Loading before finishing
    setIsLoading(false);

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
        <ChooseDirectory
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
      <button
        className="btn btn-primary w-full"
        onClick={addServer}
        disabled={!agreeEula || isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          'Add Server'
        )}
      </button>
    </>
  );
};
