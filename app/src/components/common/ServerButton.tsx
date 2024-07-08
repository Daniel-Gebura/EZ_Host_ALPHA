import React from 'react';
import { Link } from 'react-router-dom';

interface ServerButtonProps {
  id: string;
  name: string;
  icon: string;
}

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
