import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { SideBar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl">
      <SideBar />
      <div className="py-2 px-6">
        <Outlet />
      </div>
    </div>
  );
};
