import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/EZ_Host_Logo1.png';

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

        <Link to="/" className="flex items-center mx-auto">
          <span className="text-2xl font-bold mr-2">EZ HOST</span>
          <img src={logo} alt="EZ HOST Logo" className="h-10 w-10" />
        </Link>

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
