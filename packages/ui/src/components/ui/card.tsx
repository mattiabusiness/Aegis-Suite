// ============================================================================
// AEGIS SUITE - CARD COMPONENT
// File: packages/ui/src/components/ui/Card.tsx
// ============================================================================

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// ============================================================================
// STYLES
// ============================================================================

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const classes = `
    bg-white rounded-xl shadow-sm border border-gray-100
    ${paddingStyles[padding]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={classes}>{children}</div>;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-2xl font-bold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mt-2 text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-6 ${className}`}>
      {children}
    </div>
  );
}
