import React from 'react';
import logo from '../assets/logo/EZ_Host_Logo1.png'; // Adjust the path based on your project structure

export const Central: React.FC = () => {
  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-lg text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
        <p className="text-lg">
          This is the home page of your application. Customize it as needed.
        </p>
      </div>
      <img src={logo} alt="Logo" className="mx-auto mb-4 h-48" />{' '}
      {/* Adjust the className and styles as needed */}
    </div>
  );
};
