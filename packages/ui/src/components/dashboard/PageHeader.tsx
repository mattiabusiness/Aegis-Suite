// ============================================================================
// AEGIS SUITE - PAGE HEADER COMPONENT
// File: packages/ui/src/components/dashboard/PageHeader.tsx
// ============================================================================

import * as React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface BreadcrumbItem {
  /** Label to display */
  label: string;
  /** Link href (optional - if not provided, item is not clickable) */
  href?: string;
}

export interface PageHeaderAction {
  /** Unique identifier */
  id: string;
  /** Button label */
  label: string;
  /** Button icon (optional) */
  icon?: LucideIcon;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description/subtitle (optional) */
  description?: string;
  /** Breadcrumb items (optional) */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons (optional) */
  actions?: PageHeaderAction[];
  /** Callback when breadcrumb is clicked */
  onBreadcrumbClick?: (item: BreadcrumbItem) => void;
  /** Custom className */
  className?: string;
  /** Children to render below title (optional - for tabs, filters, etc.) */
  children?: React.ReactNode;
}

// ============================================================================
// STYLES
// ============================================================================

const headerStyles = {
  container: `
    mb-6
  `,
  breadcrumbs: `
    flex items-center gap-1
    text-sm
    mb-2
  `,
  breadcrumbItem: `
    text-gray-500
    hover:text-gray-700
    transition-colors duration-150
  `,
  breadcrumbItemClickable: `
    cursor-pointer
  `,
  breadcrumbItemCurrent: `
    text-gray-900
    font-medium
  `,
  breadcrumbSeparator: `
    text-gray-400
    w-4 h-4
  `,
  titleRow: `
    flex items-start justify-between
    gap-4
  `,
  titleSection: `
    flex-1
    min-w-0
  `,
  title: `
    text-2xl font-bold
    text-gray-900
    truncate
  `,
  description: `
    text-gray-500
    mt-1
  `,
  actions: `
    flex items-center gap-3
    flex-shrink-0
  `,
  // Button styles
  button: `
    inline-flex items-center justify-center gap-2
    px-4 py-2
    text-sm font-medium
    rounded-lg
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  buttonPrimary: `
    bg-purple-600 text-white
    hover:bg-purple-700
    focus:ring-purple-500
  `,
  buttonSecondary: `
    bg-gray-100 text-gray-900
    hover:bg-gray-200
    focus:ring-gray-500
  `,
  buttonOutline: `
    border-2 border-gray-300 text-gray-700
    hover:bg-gray-50
    focus:ring-gray-500
  `,
  buttonGhost: `
    text-gray-600
    hover:bg-gray-100
    focus:ring-gray-500
  `,
  buttonIcon: 'w-4 h-4',
  childrenContainer: `
    mt-4
  `,
};

const buttonVariants: Record<string, string> = {
  primary: headerStyles.buttonPrimary,
  secondary: headerStyles.buttonSecondary,
  outline: headerStyles.buttonOutline,
  ghost: headerStyles.buttonGhost,
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ActionButtonProps {
  action: PageHeaderAction;
}

function ActionButton({ action }: ActionButtonProps) {
  const Icon = action.icon;
  const variantClass = buttonVariants[action.variant || 'primary'];
  
  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className={`${headerStyles.button} ${variantClass}`}
    >
      {action.loading ? (
        <svg
          className="animate-spin w-4 h-4"
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
      ) : (
        Icon && <Icon className={headerStyles.buttonIcon} />
      )}
      {action.label}
    </button>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  onBreadcrumbClick,
  className = '',
  children,
}: PageHeaderProps) {
  return (
    <div className={`${headerStyles.container} ${className}`.trim()}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={headerStyles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isClickable = !!item.href && !isLast;
            
            return (
              <React.Fragment key={index}>
                <span
                  className={`
                    ${headerStyles.breadcrumbItem}
                    ${isClickable ? headerStyles.breadcrumbItemClickable : ''}
                    ${isLast ? headerStyles.breadcrumbItemCurrent : ''}
                  `.trim()}
                  onClick={isClickable ? () => onBreadcrumbClick?.(item) : undefined}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={isClickable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onBreadcrumbClick?.(item);
                    }
                  } : undefined}
                >
                  {item.label}
                </span>
                
                {!isLast && (
                  <ChevronRight className={headerStyles.breadcrumbSeparator} />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Title and Actions Row */}
      <div className={headerStyles.titleRow}>
        <div className={headerStyles.titleSection}>
          <h1 className={headerStyles.title}>{title}</h1>
          {description && (
            <p className={headerStyles.description}>{description}</p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className={headerStyles.actions}>
            {actions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>
        )}
      </div>

      {/* Children (tabs, filters, etc.) */}
      {children && (
        <div className={headerStyles.childrenContainer}>
          {children}
        </div>
      )}
    </div>
  );
}