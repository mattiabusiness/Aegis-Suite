// ============================================================================
// AEGIS SUITE - STAT CARD COMPONENT
// File: packages/ui/src/components/dashboard/StatCard.tsx
// ============================================================================

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type StatCardAccentColor = 
  | 'purple' 
  | 'emerald' 
  | 'sky' 
  | 'amber' 
  | 'slate' 
  | 'indigo'
  | 'red'
  | 'green'
  | 'blue';

export interface StatCardTrend {
  /** Trend value (percentage or absolute) */
  value: number;
  /** Trend direction */
  direction: 'up' | 'down' | 'neutral';
  /** Label to show after value (e.g., "vs ieri", "vs mese scorso") */
  label?: string;
}

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Icon to display */
  icon: LucideIcon;
  /** Accent color for the icon background */
  accentColor?: StatCardAccentColor;
  /** Optional trend indicator */
  trend?: StatCardTrend;
  /** Format value as currency (adds €) */
  isCurrency?: boolean;
  /** Format value as percentage (adds %) */
  isPercentage?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const accentColors: Record<StatCardAccentColor, { bg: string; text: string; iconBg: string }> = {
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    iconBg: 'bg-sky-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    iconBg: 'bg-slate-100',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
};

const cardStyles = {
  container: `
    bg-white
    rounded-xl
    border border-gray-200
    p-6
    transition-all duration-200
  `,
  containerClickable: `
    cursor-pointer
    hover:shadow-md
    hover:border-gray-300
  `,
  header: `
    flex items-start justify-between
    mb-4
  `,
  iconContainer: `
    w-12 h-12
    rounded-xl
    flex items-center justify-center
  `,
  icon: 'w-6 h-6',
  content: '',
  title: `
    text-sm font-medium
    text-gray-500
    mb-1
  `,
  value: `
    text-2xl font-bold
    text-gray-900
  `,
  subtitle: `
    text-sm
    text-gray-500
    mt-1
  `,
  trend: `
    flex items-center gap-1
    mt-3
    text-sm font-medium
  `,
  trendIcon: 'w-4 h-4',
  trendLabel: `
    text-gray-500
    font-normal
    ml-1
  `,
  // Loading skeleton
  skeleton: 'animate-pulse bg-gray-200 rounded',
  skeletonValue: 'h-8 w-24',
  skeletonTitle: 'h-4 w-32',
  skeletonTrend: 'h-4 w-20 mt-3',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatValue(
  value: string | number,
  isCurrency?: boolean,
  isPercentage?: boolean
): string {
  if (typeof value === 'string') return value;
  
  if (isCurrency) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  if (isPercentage) {
    return `${value}%`;
  }
  
  // Format large numbers with dots (Italian locale)
  return new Intl.NumberFormat('it-IT').format(value);
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  switch (direction) {
    case 'up':
      return <TrendingUp className={cardStyles.trendIcon} />;
    case 'down':
      return <TrendingDown className={cardStyles.trendIcon} />;
    case 'neutral':
      return <Minus className={cardStyles.trendIcon} />;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'purple',
  trend,
  isCurrency = false,
  isPercentage = false,
  loading = false,
  onClick,
  className = '',
}: StatCardProps) {
  const colors = accentColors[accentColor];
  
  // Loading state
  if (loading) {
    return (
      <div className={`${cardStyles.container} ${className}`.trim()}>
        <div className={cardStyles.header}>
          <div>
            <div className={`${cardStyles.skeleton} ${cardStyles.skeletonTitle} mb-2`} />
            <div className={`${cardStyles.skeleton} ${cardStyles.skeletonValue}`} />
          </div>
          <div className={`${cardStyles.skeleton} w-12 h-12 rounded-xl`} />
        </div>
        <div className={`${cardStyles.skeleton} ${cardStyles.skeletonTrend}`} />
      </div>
    );
  }

  return (
    <div
      className={`
        ${cardStyles.container}
        ${onClick ? cardStyles.containerClickable : ''}
        ${className}
      `.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      } : undefined}
    >
      {/* Header with icon */}
      <div className={cardStyles.header}>
        <div className={cardStyles.content}>
          <p className={cardStyles.title}>{title}</p>
          <p className={cardStyles.value}>
            {formatValue(value, isCurrency, isPercentage)}
          </p>
          {subtitle && (
            <p className={cardStyles.subtitle}>{subtitle}</p>
          )}
        </div>
        
        <div className={`${cardStyles.iconContainer} ${colors.iconBg}`}>
          <Icon className={`${cardStyles.icon} ${colors.text}`} />
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={`${cardStyles.trend} ${trendColors[trend.direction]}`}>
          <TrendIcon direction={trend.direction} />
          <span>
            {trend.direction === 'up' && '+'}
            {trend.direction === 'down' && '-'}
            {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className={cardStyles.trendLabel}>{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}