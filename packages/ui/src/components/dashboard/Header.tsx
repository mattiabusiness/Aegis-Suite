// ============================================================================
// AEGIS SUITE - HEADER COMPONENT
// File: packages/ui/src/components/dashboard/Header.tsx
// ============================================================================

'use client';

import * as React from 'react';
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface HeaderUserMenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

export interface HeaderProps {
  /** Business name to display */
  businessName: string;
  /** Business logo URL (optional) */
  businessLogo?: string;
  /** User name */
  userName: string;
  /** User email */
  userEmail?: string;
  /** User avatar URL (optional) */
  userAvatar?: string;
  /** Notifications list */
  notifications?: HeaderNotification[];
  /** Unread notifications count */
  unreadCount?: number;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: HeaderNotification) => void;
  /** Callback when "View all notifications" is clicked */
  onViewAllNotifications?: () => void;
  /** Callback when profile is clicked */
  onProfileClick?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Additional user menu actions */
  additionalMenuActions?: HeaderUserMenuAction[];
  /** Sidebar collapsed state (for margin adjustment) */
  sidebarCollapsed?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const headerStyles = {
  container: `
    fixed top-0 right-0
    h-16
    bg-white
    border-b border-gray-200
    flex items-center justify-between
    px-6
    z-30
    transition-all duration-300 ease-in-out
  `,
  sidebarExpanded: 'left-64',
  sidebarCollapsed: 'left-24',

  // Business info (left side)
  businessInfo: `
    flex items-center gap-3
  `,
  businessLogo: `
    w-10 h-10
    rounded-lg
    bg-gray-100
    flex items-center justify-center
    overflow-hidden
  `,
  businessLogoImage: 'w-full h-full object-cover',
  businessLogoFallback: 'w-5 h-5 text-gray-400',
  businessName: `
    font-semibold text-gray-900
    text-lg
  `,

  // Right side actions
  actions: `
    flex items-center gap-2
  `,

  // Notifications
  notificationButton: `
    relative
    p-2
    rounded-lg
    text-gray-500
    hover:bg-gray-100 hover:text-gray-700
    transition-colors duration-150
    cursor-pointer
  `,
  notificationBadge: `
    absolute -top-1 -right-1
    min-w-5 h-5 px-1.5
    flex items-center justify-center
    bg-red-500 text-white
    text-xs font-bold
    rounded-full
  `,
  notificationDropdown: `
    absolute top-full right-0 mt-2
    w-80
    bg-white
    rounded-xl
    shadow-lg
    border border-gray-200
    overflow-hidden
    z-50
  `,
  notificationHeader: `
    px-4 py-3
    border-b border-gray-100
    font-semibold text-gray-900
  `,
  notificationList: `
    max-h-80
    overflow-y-auto
  `,
  notificationItem: `
    px-4 py-3
    hover:bg-gray-50
    cursor-pointer
    transition-colors duration-150
    border-b border-gray-50
    last:border-b-0
  `,
  notificationItemUnread: `
    bg-accent-50/50
  `,
  notificationTitle: `
    font-medium text-gray-900
    text-sm
  `,
  notificationMessage: `
    text-gray-500
    text-sm
    mt-0.5
    line-clamp-2
  `,
  notificationTime: `
    text-gray-400
    text-xs
    mt-1
  `,
  notificationFooter: `
    px-4 py-3
    border-t border-gray-100
    text-center
  `,
  notificationFooterLink: `
    text-sm font-medium
    text-accent-600
    hover:text-accent-700
    cursor-pointer
  `,
  notificationEmpty: `
    px-4 py-8
    text-center
    text-gray-500
    text-sm
  `,

  // User menu
  userButton: `
    flex items-center gap-3
    p-2 pr-3
    rounded-lg
    hover:bg-gray-100
    transition-colors duration-150
    cursor-pointer
  `,
  userAvatar: `
    w-9 h-9
    rounded-full
    bg-accent-100
    flex items-center justify-center
    overflow-hidden
  `,
  userAvatarImage: 'w-full h-full object-cover',
  userAvatarFallback: 'w-5 h-5 text-accent-600',
  userInfo: `
    hidden sm:block
    text-left
  `,
  userName: `
    font-medium text-gray-900
    text-sm
    leading-tight
  `,
  userEmail: `
    text-gray-500
    text-xs
    leading-tight
  `,
  userChevron: `
    w-4 h-4
    text-gray-400
    transition-transform duration-200
  `,
  userChevronOpen: 'rotate-180',

  // User dropdown
  userDropdown: `
    absolute top-full right-0 mt-2
    w-56
    bg-white
    rounded-xl
    shadow-lg
    border border-gray-200
    overflow-hidden
    z-50
    py-1
  `,
  userDropdownItem: `
    flex items-center gap-3
    px-4 py-2.5
    text-gray-700
    hover:bg-gray-50
    cursor-pointer
    transition-colors duration-150
    text-sm
  `,
  userDropdownItemDanger: `
    text-red-600
    hover:bg-red-50
  `,
  userDropdownIcon: 'w-4 h-4',
  userDropdownDivider: `
    my-1
    border-t border-gray-100
  `,
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface NotificationDropdownProps {
  notifications: HeaderNotification[];
  onNotificationClick?: (notification: HeaderNotification) => void;
  onViewAll?: () => void;
  onClose: () => void;
}

function NotificationDropdown({
  notifications,
  onNotificationClick,
  onViewAll,
  onClose,
}: NotificationDropdownProps) {
  return (
    <div className={headerStyles.notificationDropdown}>
      <div className={headerStyles.notificationHeader}>
        Notifiche
      </div>
      
      <div className={headerStyles.notificationList}>
        {notifications.length === 0 ? (
          <div className={headerStyles.notificationEmpty}>
            Nessuna notifica
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`
                ${headerStyles.notificationItem}
                ${!notification.read ? headerStyles.notificationItemUnread : ''}
              `.trim()}
              onClick={() => {
                onNotificationClick?.(notification);
                onClose();
              }}
            >
              <div className={headerStyles.notificationTitle}>
                {notification.title}
              </div>
              <div className={headerStyles.notificationMessage}>
                {notification.message}
              </div>
              <div className={headerStyles.notificationTime}>
                {notification.time}
              </div>
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className={headerStyles.notificationFooter}>
          <span
            className={headerStyles.notificationFooterLink}
            onClick={() => {
              onViewAll?.();
              onClose();
            }}
          >
            Vedi tutte le notifiche
          </span>
        </div>
      )}
    </div>
  );
}

interface UserDropdownProps {
  userName: string;
  userEmail?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  additionalActions?: HeaderUserMenuAction[];
  onClose: () => void;
}

function UserDropdown({
  onProfileClick,
  onSettingsClick,
  onLogout,
  additionalActions,
  onClose,
}: UserDropdownProps) {
  const handleClick = (callback?: () => void) => {
    callback?.();
    onClose();
  };

  return (
    <div className={headerStyles.userDropdown}>
      <div
        className={headerStyles.userDropdownItem}
        onClick={() => handleClick(onProfileClick)}
      >
        <User className={headerStyles.userDropdownIcon} />
        Il mio profilo
      </div>
      
      <div
        className={headerStyles.userDropdownItem}
        onClick={() => handleClick(onSettingsClick)}
      >
        <Settings className={headerStyles.userDropdownIcon} />
        Impostazioni
      </div>

      {additionalActions?.map((action) => (
        <div
          key={action.id}
          className={`
            ${headerStyles.userDropdownItem}
            ${action.danger ? headerStyles.userDropdownItemDanger : ''}
          `.trim()}
          onClick={() => handleClick(action.onClick)}
        >
          <action.icon className={headerStyles.userDropdownIcon} />
          {action.label}
        </div>
      ))}

      <div className={headerStyles.userDropdownDivider} />
      
      <div
        className={`${headerStyles.userDropdownItem} ${headerStyles.userDropdownItemDanger}`}
        onClick={() => handleClick(onLogout)}
      >
        <LogOut className={headerStyles.userDropdownIcon} />
        Esci
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Header({
  businessName,
  businessLogo,
  userName,
  userEmail,
  userAvatar,
  notifications = [],
  unreadCount,
  onNotificationClick,
  onViewAllNotifications,
  onProfileClick,
  onSettingsClick,
  onLogout,
  additionalMenuActions,
  sidebarCollapsed = false,
  className = '',
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate actual unread count
  const actualUnreadCount = unreadCount ?? notifications.filter(n => !n.read).length;

  return (
    <header
      className={`
        ${headerStyles.container}
        ${sidebarCollapsed ? headerStyles.sidebarCollapsed : headerStyles.sidebarExpanded}
        ${className}
      `.trim()}
    >
      {/* Business Info (Left) */}
      <div className={headerStyles.businessInfo}>
        <div className={headerStyles.businessLogo}>
          {businessLogo ? (
            <img
              src={businessLogo}
              alt={businessName}
              className={headerStyles.businessLogoImage}
            />
          ) : (
            <Building2 className={headerStyles.businessLogoFallback} />
          )}
        </div>
        <span className={headerStyles.businessName}>
          {businessName}
        </span>
      </div>

      {/* Actions (Right) */}
      <div className={headerStyles.actions}>
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <div
            className={headerStyles.notificationButton}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            role="button"
            tabIndex={0}
            aria-label="Notifiche"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setNotificationsOpen(!notificationsOpen);
              }
            }}
          >
            <Bell className="w-5 h-5" />
            {actualUnreadCount > 0 && (
              <span className={headerStyles.notificationBadge}>
                {actualUnreadCount > 99 ? '99+' : actualUnreadCount}
              </span>
            )}
          </div>
          
          {notificationsOpen && (
            <NotificationDropdown
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onViewAll={onViewAllNotifications}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <div
            className={headerStyles.userButton}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            role="button"
            tabIndex={0}
            aria-label="Menu utente"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setUserMenuOpen(!userMenuOpen);
              }
            }}
          >
            <div className={headerStyles.userAvatar}>
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className={headerStyles.userAvatarImage}
                />
              ) : (
                <User className={headerStyles.userAvatarFallback} />
              )}
            </div>
            
            <div className={headerStyles.userInfo}>
              <div className={headerStyles.userName}>{userName}</div>
              {userEmail && (
                <div className={headerStyles.userEmail}>{userEmail}</div>
              )}
            </div>
            
            <ChevronDown
              className={`
                ${headerStyles.userChevron}
                ${userMenuOpen ? headerStyles.userChevronOpen : ''}
              `.trim()}
            />
          </div>
          
          {userMenuOpen && (
            <UserDropdown
              userName={userName}
              userEmail={userEmail}
              onProfileClick={onProfileClick}
              onSettingsClick={onSettingsClick}
              onLogout={onLogout}
              additionalActions={additionalMenuActions}
              onClose={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}