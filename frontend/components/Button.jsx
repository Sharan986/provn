'use client';

import { forwardRef } from 'react';

const variants = {
  primary: 'bg-lime text-black border-brutal hover-press shadow-brutal',
  outline: 'bg-white text-black border-brutal hover-press shadow-brutal hover:bg-bg-dark',
  dark: 'bg-black text-white border-brutal hover-press shadow-brutal-lime',
  purple: 'bg-purple text-black border-brutal hover-press shadow-brutal',
  danger: 'bg-danger text-white border-brutal hover-press shadow-brutal',
  ghost: 'bg-transparent text-black hover:bg-bg-dark',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  default: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-black uppercase tracking-tight
        transition-all duration-100 cursor-pointer
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.default}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed !transform-none !shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
