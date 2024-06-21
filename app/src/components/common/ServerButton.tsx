import React from 'react';
import { Link } from 'react-router-dom';

interface ServerButtonProps {
  to: string;
  name: string;
}

export const ServerButton: React.FC<ServerButtonProps> = ({ to, name }) => {
  return (
    <Link to={to}>
      <button className="btn btn-circle btn-outline">
        {name.charAt(0).toUpperCase()}
      </button>
    </Link>
  );
};
