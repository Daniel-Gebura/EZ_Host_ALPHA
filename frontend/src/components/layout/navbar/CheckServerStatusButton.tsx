import React from 'react';
import { useServerStatus } from '../../../hooks/useServerStatus';
import { Notification } from '../../common/Notification';

/**
 * CheckServerStatusButton component
 * Provides a button to refresh the server status.
 * 
 * @returns {JSX.Element}
 */
export const CheckServerStatusButton: React.FC = () => {
  const { notification, checkServerStatus } = useServerStatus();

  return (
    <div className="tooltip tooltip-left" data-tip="Refresh Server Status">
      {notification && <Notification key={notification.key} message={notification.message} type={notification.type} />}
      <button className="btn btn-square btn-outline" onClick={checkServerStatus}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v6h6M20 20v-6h-6"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v6h6M20 20v-6h-6"
          />
        </svg>
      </button>
    </div>
  );
};
