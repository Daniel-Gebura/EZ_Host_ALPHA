import React from 'react';

export const UsageIndicator: React.FC = () => {
  return (
    <div className="bg-gray-100 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Usage Indicator</h2>
      <p>CPU Usage: <span className="font-mono text-green-500">N/A</span></p>
      <p>RAM Usage: <span className="font-mono text-green-500">N/A</span></p>
    </div>
  );
};
