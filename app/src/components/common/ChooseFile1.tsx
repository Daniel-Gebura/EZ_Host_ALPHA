import React from 'react';

interface ChooseFile1Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ChooseFile1: React.FC<ChooseFile1Props> = ({ value, onChange, placeholder }) => {
  const handleChooseFile = async () => {
    try {
      const response = await window.api.chooseDirectory();
      if (response.success && response.path) {
        onChange(response.path);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error('Error choosing directory:', error);
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
