import React from 'react';

export interface SelectOption<T> {
  value: string;
  label: string;
  data?: T;
  disabled?: boolean;
}

export interface SelectProps<T> {
  id?: string;
  label?: string;
  options: SelectOption<T>[];
  value: string;
  onChange: (value: string, selectedOption?: SelectOption<T>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select<T>({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  className = '',
}: SelectProps<T>): React.ReactElement {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const found = options.find((opt) => opt.value === val);
    onChange(val, found);
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className="form-select"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
