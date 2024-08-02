import React from 'react';

/**
 * Dummy component representing a placeholder page.
 * 
 * @returns {JSX.Element} The rendered Dummy component.
 */
export const Dummy: React.FC = () => {
  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-lg text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">DUMMY PAGE</h1>
      </div>
    </div>
  );
};
