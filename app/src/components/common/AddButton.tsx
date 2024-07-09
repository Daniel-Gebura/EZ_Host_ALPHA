import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddServerForm } from './AddServerForm';

/**
 * AddButton component
 * Provides a button to open a modal for adding a new server.
 * 
 * @returns {JSX.Element}
 */
export const AddButton: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handle the successful addition of a server.
   * @param {string} serverId - The ID of the newly added server.
   */
  const handleServerAdded = (serverId: string) => {
    const modal = document.getElementById('add_server_modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    navigate(`/server/${serverId}`);
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
          <AddServerForm onServerAdded={handleServerAdded} />
        </div>
      </dialog>
    </>
  );
};
