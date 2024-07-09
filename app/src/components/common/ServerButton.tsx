import React from 'react';
import { Link } from 'react-router-dom';

interface ServerButtonProps {
  id: string;
  name: string;
  icon: string;
}

/**
 * ServerButton component
 * A button that links to a specific server's page, displaying the server's icon and name as a tooltip.
 * 
 * @param {ServerButtonProps} props - The props for the ServerButton component.
 * @param {string} props.id - The ID of the server.
 * @param {string} props.name - The name of the server.
 * @param {string} props.icon - The icon of the server.
 * @returns {JSX.Element} The rendered ServerButton component.
 */
export const ServerButton: React.FC<ServerButtonProps> = ({ id, name, icon }) => {
  return (
    <Link to={`/server/${id}`} className="relative btn btn-square btn-outline mb-2 w-16 h-16 flex items-center justify-center p-0">
      <div className="tooltip tooltip-top" data-tip={name}>
        <div className="w-14 h-14 p-1 rounded">
          <img src={icon} alt={`${name} icon`} className="w-full h-full object-cover rounded" />
        </div>
      </div>
    </Link>
  );
};
