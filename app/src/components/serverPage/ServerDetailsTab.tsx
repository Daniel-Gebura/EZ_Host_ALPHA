import React, { useState, useEffect } from 'react';

interface ServerDetailsTabProps {
  ip: string;
  ramAllocation: number;
  onRamChange: (newRam: number) => void;
}

/**
 * ServerDetailsTab component
 * Displays and allows modification of server details like IP address and RAM allocation.
 * 
 * @param {ServerDetailsTabProps} props - The props for the ServerDetailsTab component.
 * @param {string} props.ip - The IP address of the server.
 * @param {number} props.ramAllocation - The current RAM allocation for the server.
 * @param {function} props.onRamChange - The function to call when the RAM allocation is changed.
 * @returns {JSX.Element} The rendered ServerDetailsTab component.
 */
export const ServerDetailsTab: React.FC<ServerDetailsTabProps> = ({ ip, ramAllocation, onRamChange }) => {
  const [ram, setRam] = useState(ramAllocation);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setRam(ramAllocation);
  }, [ramAllocation]);

  /**
   * Increment the RAM allocation, with a maximum limit of 16GB.
   */
  const handleIncrement = () => {
    if (ram < 16) {
      setRam(ram + 1);
    }
  };

  /**
   * Decrement the RAM allocation, with a minimum limit of 4GB.
   */
  const handleDecrement = () => {
    if (ram > 4) {
      setRam(ram - 1);
    }
  };

  /**
   * Open the confirmation modal when the save button is clicked.
   */
  const handleSave = () => {
    setIsModalOpen(true);
  };

  /**
   * Confirm the RAM allocation change and close the modal.
   */
  const handleConfirmSave = () => {
    onRamChange(ram);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 bg-base-200 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Server Details</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">IP Address</label>
        <div className="flex items-center">
          <input type="text" readOnly value={ip} className="input input-bordered w-full max-w-xs" />
          <button className="btn btn-outline ml-2" onClick={() => navigator.clipboard.writeText(ip)}>
            Copy
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">RAM Allocation (GB)</label>
        <div className="flex items-center">
          <button className="btn btn-outline" onClick={handleDecrement}>-</button>
          <input type="number" readOnly value={ram} className="input input-bordered mx-2 w-16 text-center" />
          <button className="btn btn-outline" onClick={handleIncrement}>+</button>
          <button className="btn btn-primary ml-4" onClick={handleSave}>Save</button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm RAM Allocation</h3>
            <p>
              You are about to allocate {ram} GB of RAM to this server. Please ensure you have enough available memory.
              The server will need to be restarted for changes to take effect.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={handleConfirmSave}>Continue</button>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
