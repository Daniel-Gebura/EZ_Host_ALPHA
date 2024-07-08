import React from 'react';

export const ConsoleTab: React.FC = () => {
  return (
    <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-bold mb-4">Console</h2>
      <div className="text-center text-gray-500">
        <p>Server-related messages will be displayed here.</p>
      </div>
    </div>
  );
};
