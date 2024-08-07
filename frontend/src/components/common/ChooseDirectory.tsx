import React, { useState } from 'react';

interface ChooseDirectoryProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * ChooseDirectory component
 * A reusable directory input component for selecting a folder.
 * 
 * @param {ChooseDirectoryProps} props - The props for the ChooseDirectory component.
 * @param {string} props.value - The value of the input.
 * @param {function} props.onChange - The function to call when the value changes.
 * @param {string} [props.placeholder] - The placeholder text for the input.
 * @returns {JSX.Element}
 */
export const ChooseDirectory: React.FC<ChooseDirectoryProps> = ({ value, onChange, placeholder }) => {
  const [error, setError] = useState<string | null>(null); // State for error handling

  /**
   * Handle the directory selection by calling the backend API.
   * If an error occurs, set the error state to display it in the UI.
   */
  const handleChooseDirectory = async () => {
    const response = await  window.api.chooseDirectory();
    if (response.status === 'success') {
      const directoryPath = response.data
      onChange(directoryPath);
      setError(null); // Clear error state on success
    }
    else {
      setError('Failed to choose directory. Please try again.');
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
      <button className="btn btn-neutral mt-2" onClick={handleChooseDirectory}>
        Choose Directory
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>} {/* Display error message */}
    </div>
  );
};
