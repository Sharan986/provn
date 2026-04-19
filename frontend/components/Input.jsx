'use client';

import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-xs font-bold uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3
          bg-white text-black
          border-brutal shadow-brutal-sm
          font-sans text-sm
          placeholder:text-muted-light
          focus:outline-none focus:shadow-brutal focus:ring-0
          focus:border-black
          transition-shadow duration-100
          ${disabled ? 'opacity-50 cursor-not-allowed bg-bg-dark' : ''}
          ${error ? 'border-danger shadow-[2px_2px_0_0_#ef4444]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="font-mono text-xs font-bold text-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
