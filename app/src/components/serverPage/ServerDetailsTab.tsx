import React, { useState, useEffect } from 'react';

interface ServerDetailsTabProps {
  serverId: string;
}

export const ServerDetailsTab: React.FC<ServerDetailsTabProps> = ({ serverId }) => {
  const [ramAllocation, setRamAllocation] = useState(4);
  const [ipAddress, setIpAddress] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch server details on load
    const fetchServerDetails = async () => {
      try {
        const server = await window.api.getServer(serverId);
        const ram = server.javaArgs.match(/-Xmx(\d+)G/)[1];
        setRamAllocation(parseInt(ram, 10));
        const ip = await window.api.getIpAddress();
        setIpAddress(ip);
      } catch (error) {
        console.error('Error fetching server details:', error);
      }
    };

    fetchServerDetails();
  }, [serverId]);

  const handleRamSave = async () => {
    setIsModalOpen(false);
    try {
      const response = await window.api.updateRamAllocation(serverId, ramAllocation);
      setNotification(response);
    } catch (error) {
      console.error('Error updating RAM allocation:', error);
      setNotification('Failed to update RAM allocation');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Server Details</h2>
      <div className="mb-4">
        <label className="label">
          <span className="label-text">Server IP Address</span>
        </label>
        <input type="text" className="input input-bordered w-full" value={ipAddress} readOnly />
      </div>
      <div className="mb-4">
        <label className="label">
          <span className="label-text">RAM Allocation (GB)</span>
        </label>
        <div className="flex items-center">
          <button className="btn" onClick={() => setRamAllocation(prev => Math.max(4, prev - 1))}>-</button>
          <input type="number" className="input input-bordered w-full mx-2" value={ramAllocation} readOnly />
          <button className="btn" onClick={() => setRamAllocation(prev => Math.min(16, prev + 1))}>+</button>
        </div>
        <button className="btn btn-primary mt-2" onClick={() => setIsModalOpen(true)}>Save</button>
      </div>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Warning</h3>
            <p>You must have enough memory to allocate this specified amount. The server will need to be restarted to take effect.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRamSave}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="alert alert-info mt-4">
          <div>{notification}</div>
        </div>
      )}
    </div>
  );
};
