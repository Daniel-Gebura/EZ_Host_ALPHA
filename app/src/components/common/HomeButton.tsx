import React from 'react';
import { Link } from 'react-router-dom';

/**
 * HomeButton component
 * A button that navigates to the home page.
 * 
 * @returns {JSX.Element}
 */
export const HomeButton: React.FC = () => {
  return (
    <Link to="/">
      <button className="btn btn-circle btn-outline">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"
          />
        </svg>
      </button>
    </Link>
  );
};
