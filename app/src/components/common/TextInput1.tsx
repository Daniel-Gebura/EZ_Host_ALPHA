import React from 'react';

interface TextInput1Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * TextInput1 component
 * A reusable text input component for entering text.
 * 
 * @param {TextInput1Props} props - The props for the TextInput1 component.
 * @param {string} props.value - The value of the input.
 * @param {function} props.onChange - The function to call when the value changes.
 * @param {string} [props.placeholder] - The placeholder text for the input.
 * @returns {JSX.Element} The rendered TextInput1 component.
 */
export const TextInput1: React.FC<TextInput1Props> = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input input-bordered w-full mt-4"
      placeholder={placeholder}
    />
  );
};
