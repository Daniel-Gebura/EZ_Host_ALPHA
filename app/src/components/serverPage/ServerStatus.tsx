import React from 'react';

interface ServerStatusProps {
  name: string;
  status: 'running' | 'restarting' | 'offline';
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ name, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-green-500';
      case 'restarting':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">{name}</h1>
      <div className={`flex items-center mt-1 ${getStatusColor()}`}>
        <span className="h-2 w-2 rounded-full mr-2" />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    </div>
  );
};
