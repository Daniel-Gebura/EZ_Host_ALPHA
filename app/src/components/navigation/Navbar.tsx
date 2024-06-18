import React from 'react';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <nav className="bg-base-300 p-4 shadow-md fixed w-full z-10">
      <div className="flex items-center justify-between">
        <button
          className="btn btn-primary"
          onClick={toggleSidebar}
        >
          Open Sidebar
        </button>
        <div>Navbar Content</div>
      </div>
    </nav>
  );
};