import React from 'react';
import { AddButton } from '../common/AddButton';
import { HomeButton } from '../common/HomeButton';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-[5rem] left-0 h-[calc(100%-5rem)] bg-base-200 p-4 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-20`}
      >
        <div className="flex justify-center mb-4">
          <HomeButton />
        </div>
        <div className="flex justify-center mb-4">
          <AddButton />
        </div>
      </div>
    </>
  );
};
