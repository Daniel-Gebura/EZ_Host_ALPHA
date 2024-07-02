import React from 'react';
import { Link } from 'react-router-dom';

interface ServerButtonProps {
  id: string;
  name: string;
  icon: string; // Add icon prop
}

export const ServerButton: React.FC<ServerButtonProps> = ({ id, name, icon }) => {
  return (
    <Link to={`/server/${id}`} className="btn btn-outline mb-2 w-full flex items-center justify-start px-4 py-2">
      <img src={icon} alt={`${name} icon`} className="h-6 w-6 mr-2" />
      <span>{name}</span>
    </Link>
  );
};
