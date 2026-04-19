'use client';

const variants = {
  lime: 'bg-lime text-black',
  yellow: 'bg-yellow text-black',
  purple: 'bg-purple text-black',
  dark: 'bg-black text-white',
  danger: 'bg-danger text-white',
  default: 'bg-white text-black',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  default: 'px-3 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}) {
  return (
    <span
      className={`
        inline-flex items-center font-mono font-bold uppercase tracking-wider
        border-2 border-black
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.default}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
