import React, { useState, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './navbar/Navbar';
import { Sidebar } from './sidebar/Sidebar';

interface LayoutProps {
  children?: ReactNode;
}

/**
 * Layout component that defines the common structure of the application.
 * It includes a Navbar, Sidebar, and renders child components using <Outlet />.
 * 
 * @param {LayoutProps} props - The props for the Layout component.
 * @returns {JSX.Element} The rendered Layout component.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Toggles the sidebar open and closed.
   */
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

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
