import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  disabled,
  children,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className={disabled ? 'opacity-60 cursor-not-allowed' : ''}>
        {children}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  label?: string;
  required?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, label, required, className, ...props }, ref) => {
    const baseClass =
      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
    const borderClass = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500';

    return label ? (
      <FormField label={label} error={error} required={required}>
        <input
          ref={ref}
          className={`${baseClass} ${borderClass} ${className || ''}`}
          {...props}
        />
      </FormField>
    ) : (
      <input
        ref={ref}
        className={`${baseClass} ${borderClass} ${className || ''}`}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  error?: string;
  label?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, label, required, options, className, ...props }, ref) => {
    const baseClass =
      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
    const borderClass = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500';

    const selectElement = (
      <select
        ref={ref}
        className={`${baseClass} ${borderClass} ${className || ''}`}
        {...props}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );

    return label ? (
      <FormField label={label} error={error} required={required}>
        {selectElement}
      </FormField>
    ) : (
      selectElement
    );
  }
);

Select.displayName = 'Select';
