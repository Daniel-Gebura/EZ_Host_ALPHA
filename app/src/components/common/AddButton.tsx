import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AddButton: React.FC = () => {
  const [serverName, setServerName] = useState('');
  const navigate = useNavigate();

  const addServer = async () => {
    const newServer = {
      id: Date.now().toString(),
      name: serverName,
    };
    await window.api.addServer(newServer);
    setServerName('');
    const modal = document.getElementById('add_server_modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    // Navigate to the new server's page
    navigate(`/server/${newServer.id}`);
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
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Add New Server</h3>
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className="input input-bordered w-full mt-4"
            placeholder="Server Name"
          />
          <button className="btn btn-primary w-full mt-4" onClick={addServer}>Add Server</button>
        </div>
      </dialog>
    </>
  );
};
