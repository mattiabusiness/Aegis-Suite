// ============================================================================
// AEGIS SUITE - BUTTON COMPONENT
// File: packages/ui/src/components/ui/Button.tsx
// ============================================================================

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ============================================================================
// STYLES
// ============================================================================

const baseStyles = `
  inline-flex items-center justify-center
  font-medium rounded-lg
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const variantStyles: Record<string, string> = {
  primary: `
    bg-accent-600 text-white
    hover:bg-accent-700
    focus:ring-accent-500
  `,
  secondary: `
    bg-gray-100 text-gray-900
    hover:bg-gray-200
    focus:ring-gray-500
  `,
  outline: `
    border-2 border-accent-600 text-accent-600
    hover:bg-accent-50
    focus:ring-accent-500
  `,
  ghost: `
    text-gray-600
    hover:bg-gray-100
    focus:ring-gray-500
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700
    focus:ring-red-500
  `,
};

const sizeStyles: Record<string, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Caricamento...
        </>
      ) : (
        children
      )}
    </button>
  );
}
