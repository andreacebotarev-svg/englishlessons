import { type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable button component
 */
export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-success hover:bg-success/90 text-white',
    error: 'bg-error hover:bg-error/90 text-white',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-lg font-semibold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
