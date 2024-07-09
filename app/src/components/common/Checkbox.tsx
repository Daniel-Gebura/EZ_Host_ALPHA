import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

/**
 * Checkbox component
 * Reusable checkbox with a label.
 * 
 * @param {CheckboxProps} props - The props for the Checkbox component.
 * @returns {JSX.Element}
 */
export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="cursor-pointer flex items-center">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
        className="checkbox checkbox-primary" 
      />
      <span className="label-text ml-2">{label}</span>
    </label>
  );
};
