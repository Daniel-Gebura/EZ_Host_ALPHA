import React from 'react';

interface IconChangerProps {
  icon: string;
  onChangeIcon: () => void;
}

/**
 * IconChanger component
 * A button that allows changing the server icon.
 * 
 * @param {IconChangerProps} props - The props for the IconChanger component.
 * @param {string} props.icon - The current server icon.
 * @param {function} props.onChangeIcon - The function to call when changing the icon.
 * @returns {JSX.Element} The rendered IconChanger component.
 */
export const IconChanger: React.FC<IconChangerProps> = ({ icon, onChangeIcon }) => {
  return (
    <div className="tooltip" data-tip="Change Icon">
      <button className="btn btn-square btn-outline mr-4" onClick={onChangeIcon}>
        <img src={icon} alt="Server Icon" className="h-10 w-10 rounded" />
      </button>
    </div>
  );
};
