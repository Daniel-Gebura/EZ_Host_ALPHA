import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * ServerControl component
 * Provides controls to start, save, restart, and stop a server.
 * 
 * @returns {JSX.Element}
 */
export const ServerControl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /**
   * Handles server actions by calling the appropriate backend API
   * @param {string} action - The action to perform (start, save, restart, stop)
   */
  const handleAction = async (action: string) => {
    if (!id) {
      console.error('Server ID is undefined');
      return;
    }

    let response;
    try {
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
    } catch (error: any) { // Explicitly typing error as any
      console.error(`Error performing action '${action}':`, error);
      alert(`Failed to ${action} server: ${error.message}`);
    }
  };

  /**
   * Removes the server and navigates back to the home page
   */
  const removeServer = async () => {
    if (id) {
      try {
        await window.api.deleteServer(id);
        navigate('/');
      } catch (error: any) { // Explicitly typing error as any
        console.error('Error deleting server:', error);
        alert(`Failed to delete server: ${error.message}`);
      }
    } else {
      console.error('Server ID is undefined');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="p-6 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Server Control</h1>
        <p className="mb-4">Managing server with ID: {id}</p>
        <button className="btn btn-success mt-2" onClick={() => handleAction('start')}>Start Server</button>
        <button className="btn btn-warning mt-2" onClick={() => handleAction('save')}>Save Server</button>
        <button className="btn btn-info mt-2" onClick={() => handleAction('restart')}>Restart Server</button>
        <button className="btn btn-danger mt-2" onClick={() => handleAction('stop')}>Stop Server</button>
        <button className="btn btn-danger mt-4" onClick={removeServer}>Remove Server</button>
      </div>
    </div>
  );
};
