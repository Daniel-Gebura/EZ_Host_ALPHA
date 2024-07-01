import React from 'react';

interface ServerStatusProps {
  name: string;
  status: 'Offline' | 'Starting...' | 'Online' | 'Stopping...' | 'Restarting...';
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ name, status }) => {
  const getStatusDotColor = () => {
    switch (status) {
      case 'Offline':
        return 'bg-red-500';
      case 'Online':
        return 'bg-green-500';
      case 'Starting...':
        return 'bg-blue-500';
      case 'Stopping...':
        return 'bg-yellow-500';
      case 'Restarting...':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isLoading = status === 'Starting...' || status === 'Stopping...' || status === 'Restarting...';

  return (
    <div>
      <h1 className="text-3xl font-bold">{name}</h1>
      <div className="flex items-center mt-1 text-gray-500">
        <span className={`h-4 w-4 rounded-full mr-2 ${getStatusDotColor()}`} />
        <span className="text-lg">{status}</span>
        {isLoading && <span className="loading loading-bars loading-xs ml-2"></span>}
      </div>
    </div>
  );
};
