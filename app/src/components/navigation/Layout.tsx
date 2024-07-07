import React, { useState, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleCheckStatus = async () => {
    try {
      const response = await window.api.checkServerStatus();
      console.log('Server statuses updated successfully.', response);
    } catch (error: any) {
      console.error('Error checking server status:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} onCheckStatus={handleCheckStatus} />

      {/* Main Content */}
      <div className="flex flex-1 mt-16 relative">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="flex-1 p-4 bg-base-100">
          {children}
          <Outlet /> {/* This is where the nested routes will be rendered */}
        </div>
      </div>
    </div>
  );
};
