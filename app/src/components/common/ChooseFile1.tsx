import React from 'react';

interface ChooseFile1Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * ChooseFile1 component
 * A reusable directory input component for selecting a folder
 * 
 * @param {string} value - The value of the input
 * @param {function} onChange - The function to call when the value changes
 * @param {string} [placeholder] - The placeholder text for the input
 * @returns {JSX.Element}
 */
export const ChooseFile1: React.FC<ChooseFile1Props> = ({ value, onChange, placeholder }) => {
  const handleChooseFile = async () => {
    const directoryPath = await window.api.chooseDirectory();
    if (directoryPath) {
      onChange(directoryPath);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="text"
        value={value}
        readOnly
        className="input input-bordered w-full"
        placeholder={placeholder}
      />
      <button className="btn btn-neutral mt-2" onClick={handleChooseFile}>Choose Directory</button>
    </div>
  );
};
