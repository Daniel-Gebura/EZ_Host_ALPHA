import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <nav className="bg-base-300 py-4 px-6 shadow-md fixed w-full z-20">
      <div className="flex items-center justify-between">
        <button 
          className="btn btn-square btn-outline"
          onClick={toggleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-16 6h16" />
          </svg>
        </button>
        
        <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <Link to="/Dummy">
                            DUMMY
                        </Link>
                    </li>
                </ul>
            </div>
      </div>
    </nav>
  );
};
