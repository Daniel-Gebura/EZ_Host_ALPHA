import React from 'react';

interface IconChangerProps {
  icon: string;
  onChangeIcon: () => void;
}

export const IconChanger: React.FC<IconChangerProps> = ({ icon, onChangeIcon }) => {
  return (
    <button className="btn btn-square btn-outline mr-4" onClick={onChangeIcon}>
      <img src={icon} alt="Server Icon" className="h-10 w-10 rounded" />
    </button>
  );
};
