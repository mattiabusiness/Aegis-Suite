// ============================================================================
// AEGIS SUITE - EMPTY STATE COMPONENT
// File: packages/ui/src/components/dashboard/EmptyState.tsx
// ============================================================================

import * as React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Button icon (optional) */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button (optional) */
  secondaryAction?: EmptyStateAction;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const sizeStyles = {
  sm: {
    container: 'py-8',
    iconContainer: 'w-12 h-12 mb-3',
    icon: 'w-6 h-6',
    title: 'text-base',
    description: 'text-sm',
    button: 'px-3 py-1.5 text-sm',
  },
  md: {
    container: 'py-12',
    iconContainer: 'w-16 h-16 mb-4',
    icon: 'w-8 h-8',
    title: 'text-lg',
    description: 'text-base',
    button: 'px-4 py-2 text-sm',
  },
  lg: {
    container: 'py-16',
    iconContainer: 'w-20 h-20 mb-5',
    icon: 'w-10 h-10',
    title: 'text-xl',
    description: 'text-base',
    button: 'px-5 py-2.5 text-base',
  },
};

const emptyStateStyles = {
  container: `
    flex flex-col items-center justify-center
    text-center
  `,
  iconContainer: `
    rounded-full
    bg-gray-100
    flex items-center justify-center
  `,
  icon: 'text-gray-400',
  title: `
    font-semibold
    text-gray-900
  `,
  description: `
    text-gray-500
    mt-1
    max-w-sm
  `,
  actions: `
    flex items-center gap-3
    mt-6
  `,
  // Button styles
  button: `
    inline-flex items-center justify-center gap-2
    font-medium
    rounded-lg
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
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
  buttonIcon: 'w-4 h-4',
};

const buttonVariants: Record<string, string> = {
  primary: emptyStateStyles.buttonPrimary,
  secondary: emptyStateStyles.buttonSecondary,
  outline: emptyStateStyles.buttonOutline,
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ActionButtonProps {
  action: EmptyStateAction;
  sizeClass: string;
}

function ActionButton({ action, sizeClass }: ActionButtonProps) {
  const Icon = action.icon;
  const variantClass = buttonVariants[action.variant || 'primary'];
  
  return (
    <button
      onClick={action.onClick}
      className={`${emptyStateStyles.button} ${variantClass} ${sizeClass}`}
    >
      {Icon && <Icon className={emptyStateStyles.buttonIcon} />}
      {action.label}
    </button>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const sizes = sizeStyles[size];

  return (
    <div
      className={`
        ${emptyStateStyles.container}
        ${sizes.container}
        ${className}
      `.trim()}
    >
      {/* Icon */}
      <div className={`${emptyStateStyles.iconContainer} ${sizes.iconContainer}`}>
        <Icon className={`${emptyStateStyles.icon} ${sizes.icon}`} />
      </div>

      {/* Title */}
      <h3 className={`${emptyStateStyles.title} ${sizes.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`${emptyStateStyles.description} ${sizes.description}`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className={emptyStateStyles.actions}>
          {secondaryAction && (
            <ActionButton 
              action={{ ...secondaryAction, variant: secondaryAction.variant || 'outline' }} 
              sizeClass={sizes.button} 
            />
          )}
          {action && (
            <ActionButton 
              action={action} 
              sizeClass={sizes.button} 
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PRESET EMPTY STATES (convenience exports)
// ============================================================================

export interface PresetEmptyStateProps {
  onAction?: () => void;
  actionLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Empty state for no appointments */
export function EmptyAppointments({ 
  onAction, 
  actionLabel = 'Nuova prenotazione',
  size,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      title="Nessuna prenotazione"
      description="Non ci sono prenotazioni per il periodo selezionato."
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
      size={size}
      className={className}
    />
  );
}

/** Empty state for no services */
export function EmptyServices({ 
  onAction, 
  actionLabel = 'Aggiungi servizio',
  size,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      title="Nessun servizio"
      description="Inizia aggiungendo i servizi che offri ai tuoi clienti."
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
      size={size}
      className={className}
    />
  );
}

/** Empty state for no staff */
export function EmptyStaff({ 
  onAction, 
  actionLabel = 'Aggiungi membro',
  size,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      title="Nessun membro dello staff"
      description="Aggiungi i membri del tuo team per gestire le prenotazioni."
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
      size={size}
      className={className}
    />
  );
}

/** Empty state for no customers */
export function EmptyCustomers({ 
  onAction, 
  actionLabel = 'Aggiungi cliente',
  size,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      title="Nessun cliente"
      description="I clienti appariranno qui quando effettueranno prenotazioni."
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
      size={size}
      className={className}
    />
  );
}

/** Empty state for no notifications */
export function EmptyNotifications({ 
  size,
  className,
}: Omit<PresetEmptyStateProps, 'onAction' | 'actionLabel'>) {
  return (
    <EmptyState
      title="Nessuna notifica"
      description="Sei al passo con tutto!"
      size={size}
      className={className}
    />
  );
}

/** Empty state for search with no results */
export function EmptySearchResults({ 
  onAction,
  actionLabel = 'Cancella ricerca',
  size,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      title="Nessun risultato"
      description="Prova a modificare i filtri o i termini di ricerca."
      action={onAction ? { label: actionLabel, onClick: onAction, variant: 'outline' } : undefined}
      size={size}
      className={className}
    />
  );
}