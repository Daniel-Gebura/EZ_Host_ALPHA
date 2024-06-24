import React from 'react';
import { Link } from 'react-router-dom';

interface ServerButtonProps {
  id: string;
  name: string;
}

export const ServerButton: React.FC<ServerButtonProps> = ({ id, name }) => {
  return (
    <Link to={`/server/${id}`} className="btn btn-outline mb-2 w-full flex items-center justify-start px-4 py-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
      <span>{name}</span>
    </Link>
  );
};
