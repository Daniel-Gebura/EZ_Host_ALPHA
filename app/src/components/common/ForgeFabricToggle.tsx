import React from 'react';
import forgeLogo from '../../assets/logo/Forge_Logo_No_Text.png';
import fabricLogo from '../../assets/logo/Fabric_Logo_No_Text.png';

interface ForgeFabricToggleProps {
  value: 'forge' | 'fabric';
  onChange: (value: 'forge' | 'fabric') => void;
}

/**
 * ForgeFabricToggle component
 * A simple toggle switch for selecting between Forge and Fabric
 * 
 * @param {string} value - The current value of the toggle (forge or fabric)
 * @param {function} onChange - The function to call when the value changes
 * @returns {JSX.Element}
 */
export const ForgeFabricToggle: React.FC<ForgeFabricToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-center mt-4">
      <img src={forgeLogo} alt="Forge Logo" className="h-6 w-6 mr-2" />
      <input
        type="checkbox"
        className={`toggle ${value === 'forge' ? 'bg-blue-400' : 'bg-beige-400'} toggle`}
        checked={value === 'fabric'}
        onChange={() => onChange(value === 'forge' ? 'fabric' : 'forge')}
      />
      <img src={fabricLogo} alt="Fabric Logo" className="h-6 w-6 ml-2" />
    </div>
  );
};
