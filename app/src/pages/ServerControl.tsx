import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const ServerControl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const removeServer = async () => {
    if (id) {
      await window.api.deleteServer(id);
      navigate('/');
    } else {
      console.error('Server ID is undefined');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="p-6 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Server Control</h1>
        <p className="mb-4">Managing server with ID: {id}</p>
        <button className="btn btn-danger mt-4" onClick={removeServer}>Remove Server</button>
      </div>
    </div>
  );
};
