import React from 'react';
import logo from '../../assets/logo/EZ_Host_Logo1.png';

/**
 * Central component representing the home page of the application.
 * 
 * @returns {JSX.Element} The rendered Central component.
 */
export const Central: React.FC = () => {
  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-lg text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Welcome to EZ Host!</h1>
        <p className="text-lg">
          To get started, simply download a server pack from CurseForge and add an EZ Host server to its root directory.
        </p>
      </div>
      <img src={logo} alt="Logo" className="mx-auto mb-4 h-48" />
    </div>
  );
};
