import React from 'react';

interface CheckServerStatusButtonProps {
  onCheckStatus: () => void;
}

/**
 * CheckServerStatusButton component
 * Provides a button to refresh the server status.
 * 
 * @param {CheckServerStatusButtonProps} props - The props for the CheckServerStatusButton component.
 * @returns {JSX.Element}
 */
export const CheckServerStatusButton: React.FC<CheckServerStatusButtonProps> = ({ onCheckStatus }) => {
  return (
    <div className="tooltip tooltip-left" data-tip="Refresh Server Status">
      <button className="btn btn-square btn-outline" onClick={onCheckStatus}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6" />
        </svg>
      </button>
    </div>
  );
};
