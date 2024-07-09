import React from 'react';

interface ChooseFile1Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * ChooseFile1 component
 * A reusable directory input component for selecting a folder.
 * 
 * @param {ChooseFile1Props} props - The props for the ChooseFile1 component.
 * @param {string} props.value - The value of the input.
 * @param {function} props.onChange - The function to call when the value changes.
 * @param {string} [props.placeholder] - The placeholder text for the input.
 * @returns {JSX.Element}
 */
export const ChooseFile1: React.FC<ChooseFile1Props> = ({ value, onChange, placeholder }) => {
  /**
   * Handle the directory selection by calling the backend API.
   * If an error occurs, log it to the console.
   */
  const handleChooseFile = async () => {
    try {
      const directoryPath = await window.api.chooseDirectory(); // Use the centralized API module
      if (directoryPath) {
        onChange(directoryPath);
      }
    } catch (error) {
      console.error('Error choosing directory:', error);
      // Optionally, you can set an error state and display an error message to the user here
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
