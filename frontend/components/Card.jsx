'use client';

const variants = {
  default: 'bg-white',
  lime: 'bg-lime',
  yellow: 'bg-yellow',
  purple: 'bg-purple',
  muted: 'bg-bg-dark',
  dark: 'bg-black text-white',
};

const paddings = {
  none: 'p-0',
  sm: 'p-3',
  default: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  variant = 'default',
  hoverable = false,
  padding = 'default',
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        border-brutal shadow-brutal
        ${variants[variant] || variants.default}
        ${paddings[padding] || paddings.default}
        ${hoverable ? 'hover-press cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
