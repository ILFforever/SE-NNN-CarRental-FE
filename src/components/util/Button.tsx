import React from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline'|'ghost'|'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
  type = 'button',
}) => {
  const baseStyles = 'rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2';
  const variantStyles = {
    primary: 'bg-primary text-base-100 hover:bg-base-800 focus:ring-base-700',
    secondary: 'bg-base-300 text-base-900 hover:bg-base-400 focus:ring-base-500',
    outline: 'border border-base-500 text-base-900 hover:bg-base-200 focus:ring-base-500',
    ghost: 'text-base-900 hover:bg-base-200 focus:ring-base-500',
    danger: 'bg-danger text-on-danger hover:bg-danger-dark focus:ring-danger-dark',
  };
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = clsx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;