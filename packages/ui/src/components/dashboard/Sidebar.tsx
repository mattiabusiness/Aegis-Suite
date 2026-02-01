// ============================================================================
// AEGIS SUITE - SIDEBAR COMPONENT
// File: packages/ui/src/components/dashboard/Sidebar.tsx
// ============================================================================

'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// THEME TYPES
// ============================================================================

export interface SidebarTheme {
  /** Sidebar background (supports gradients) */
  background: string;
  /** Sidebar border color */
  borderColor: string;
  /** Logo container background */
  logoBackground: string;
  /** Brand name text color */
  brandTextColor: string;
  /** Section label text color */
  sectionLabelColor: string;
  /** Menu item default text color */
  itemTextColor: string;
  /** Menu item hover background */
  itemHoverBackground: string;
  /** Menu item hover text color */
  itemHoverTextColor: string;
  /** Menu item active background */
  itemActiveBackground: string;
  /** Menu item active text color */
  itemActiveTextColor: string;
  /** Badge background */
  badgeBackground: string;
  /** Badge text color */
  badgeTextColor: string;
  /** Collapse button text color */
  collapseButtonColor: string;
  /** Tooltip background */
  tooltipBackground: string;
  /** Tooltip text color */
  tooltipTextColor: string;
  /** Divider/separator color */
  dividerColor: string;
  /** Logout hover color */
  logoutHoverColor: string;
}

// ============================================================================
// DEFAULT THEME (Dark - fallback)
// ============================================================================

export const defaultSidebarTheme: SidebarTheme = {
  background: 'bg-gray-900',
  borderColor: 'border-gray-800',
  logoBackground: 'bg-gradient-to-br from-purple-500 to-purple-700',
  brandTextColor: 'text-white',
  sectionLabelColor: 'text-gray-500',
  itemTextColor: 'text-gray-400',
  itemHoverBackground: 'hover:bg-gray-800',
  itemHoverTextColor: 'hover:text-white',
  itemActiveBackground: 'bg-purple-600/20',
  itemActiveTextColor: 'text-purple-400',
  badgeBackground: 'bg-purple-600',
  badgeTextColor: 'text-white',
  collapseButtonColor: 'text-gray-500',
  tooltipBackground: 'bg-gray-800',
  tooltipTextColor: 'text-white',
  dividerColor: 'border-gray-800',
  logoutHoverColor: 'hover:text-red-400',
};

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
}

export interface SidebarMenuSection {
  id: string;
  label?: string;
  items: SidebarMenuItem[];
}

export interface SidebarProps {
  /** Logo component or image URL */
  logo: React.ReactNode | string;
  /** Brand name shown next to logo */
  brandName: string;
  /** Menu sections configuration */
  menuSections: SidebarMenuSection[];
  /** Currently active item id */
  activeItemId?: string;
  /** Collapsed state */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Callback when menu item is clicked */
  onMenuItemClick?: (item: SidebarMenuItem) => void;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Callback when help is clicked */
  onHelp?: () => void;
  /** Show help button */
  showHelp?: boolean;
  /** Show logout button */
  showLogout?: boolean;
  /** Theme configuration */
  theme?: SidebarTheme;
  /** Custom className */
  className?: string;
}

// ============================================================================
// STYLES (static parts only)
// ============================================================================

const sidebarStyles = {
  container: `
    fixed left-0 top-0 h-screen
    flex flex-col
    transition-all duration-300 ease-in-out
    z-40
    border-r
  `,
  expanded: 'w-64',
  collapsed: 'w-24',
  
  // Header con logo e collapse button
  header: `
    flex items-center justify-between
    px-4 py-5
    border-b
  `,
  headerCollapsed: `
    flex items-center justify-between
    px-3 py-5
    border-b
  `,
  headerLeft: `
    flex items-center gap-3
    min-w-0
  `,
  logoContainer: `
    flex-shrink-0
    w-10 h-10
    rounded-xl
    flex items-center justify-center
    shadow-lg
  `,
  logoImage: 'w-6 h-6 object-contain',
  brandName: `
    font-bold text-lg
    whitespace-nowrap
    overflow-hidden
    transition-opacity duration-200
  `,
  
  // Collapse button (in header)
  collapseButton: `
    flex-shrink-0
    w-8 h-8
    flex items-center justify-center
    rounded-lg
    transition-all duration-150
    cursor-pointer
    group
    relative
  `,
  collapseTooltip: `
    absolute left-full ml-2
    px-2 py-1
    text-xs font-medium
    rounded-md
    shadow-lg
    whitespace-nowrap
    opacity-0 invisible
    group-hover:opacity-100 group-hover:visible
    transition-all duration-150
    z-50
    pointer-events-none
  `,
  
  // Navigation - nascondo scrollbar
  nav: `
    flex-1 
    overflow-y-auto
    py-4
    scrollbar-none
    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  `,
  section: 'mb-6',
  sectionLabel: `
    px-4 mb-2
    text-xs font-semibold uppercase tracking-wider
    whitespace-nowrap
    overflow-hidden
  `,
  
  // Menu items
  menuItem: `
    flex items-center gap-3
    mx-3 px-3 py-2.5
    rounded-lg
    transition-all duration-150
    cursor-pointer
    group
    relative
  `,
  menuItemIcon: `
    flex-shrink-0
    w-5 h-5
    transition-colors duration-150
  `,
  menuItemLabel: `
    flex-1
    text-sm font-medium
    whitespace-nowrap
    overflow-hidden
    transition-opacity duration-200
  `,
  menuItemBadge: `
    flex-shrink-0
    px-2 py-0.5
    text-xs font-semibold
    rounded-full
  `,
  
  // Tooltip (quando collapsed)
  tooltip: `
    absolute left-full ml-3
    px-3 py-2
    text-sm font-medium
    rounded-lg
    shadow-lg
    whitespace-nowrap
    opacity-0 invisible
    group-hover:opacity-100 group-hover:visible
    transition-all duration-150
    z-50
    pointer-events-none
  `,
  
  // Footer
  footer: `
    border-t
    py-3
    mt-auto
  `,
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface MenuItemComponentProps {
  item: SidebarMenuItem;
  isActive: boolean;
  collapsed: boolean;
  theme: SidebarTheme;
  onClick: () => void;
}

function MenuItemComponent({ item, isActive, collapsed, theme, onClick }: MenuItemComponentProps) {
  const Icon = item.icon;
  
  return (
    <div
      onClick={onClick}
      className={`
        ${sidebarStyles.menuItem}
        ${theme.itemTextColor}
        ${theme.itemHoverBackground}
        ${theme.itemHoverTextColor}
        ${isActive ? `${theme.itemActiveBackground} ${theme.itemActiveTextColor}` : ''}
      `.trim()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <Icon className={sidebarStyles.menuItemIcon} />
      
      {!collapsed && (
        <>
          <span className={sidebarStyles.menuItemLabel}>
            {item.label}
          </span>
          {item.badge && (
            <span className={`${sidebarStyles.menuItemBadge} ${theme.badgeBackground} ${theme.badgeTextColor}`}>
              {item.badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip quando collapsed */}
      {collapsed && (
        <div className={`${sidebarStyles.tooltip} ${theme.tooltipBackground} ${theme.tooltipTextColor}`}>
          {item.label}
          {item.badge && (
            <span className={`ml-2 ${theme.itemActiveTextColor}`}>({item.badge})</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Sidebar({
  logo,
  brandName,
  menuSections,
  activeItemId,
  collapsed = false,
  onCollapsedChange,
  onMenuItemClick,
  onLogout,
  showLogout = true,
  theme = defaultSidebarTheme,
  className = '',
}: SidebarProps) {
  
  const handleCollapse = () => {
    onCollapsedChange?.(!collapsed);
  };

  const handleItemClick = (item: SidebarMenuItem) => {
    onMenuItemClick?.(item);
  };

  return (
    <aside
      className={`
        ${sidebarStyles.container}
        ${theme.background}
        ${theme.borderColor}
        ${collapsed ? sidebarStyles.collapsed : sidebarStyles.expanded}
        ${className}
      `.trim()}
    >
      {/* Header con Logo e Collapse Button */}
      <div className={`${collapsed ? sidebarStyles.headerCollapsed : sidebarStyles.header} ${theme.dividerColor}`}>
        {/* Logo - sempre a sinistra */}
        <div className={`${sidebarStyles.logoContainer} ${theme.logoBackground}`}>
          {typeof logo === 'string' ? (
            <img src={logo} alt={brandName} className={sidebarStyles.logoImage} />
          ) : (
            logo
          )}
        </div>
        
        {/* Brand name - solo quando expanded */}
        {!collapsed && (
          <span className={`${sidebarStyles.brandName} ${theme.brandTextColor}  ml-3 flex-1`}>
            {brandName}
          </span>
        )}
        
        {/* Collapse Button - sempre a destra */}
        <div
          onClick={handleCollapse}
          className={`
            ${sidebarStyles.collapseButton}
            ${theme.collapseButtonColor}
            ${theme.itemHoverBackground}
            ${theme.itemHoverTextColor}
          `.trim()}
          role="button"
          tabIndex={0}
          aria-label={collapsed ? 'Espandi menu' : 'Comprimi menu'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCollapse();
            }
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          {/* Tooltip */}
          <div className={`${sidebarStyles.collapseTooltip} ${theme.tooltipBackground} ${theme.tooltipTextColor}`}>
            {collapsed ? 'Espandi menu' : 'Comprimi menu'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={sidebarStyles.nav}>
        {menuSections.map((section, index) => (
          <div key={section.id} className={sidebarStyles.section}>
            {/* Divider between sections (except first) */}
            {index > 0 && section.label && !collapsed && (
              <div className={`mx-4 mb-4 border-t ${theme.dividerColor}`} />
            )}
            
            {/* Section Label */}
            {section.label && !collapsed && (
              <div className={`${sidebarStyles.sectionLabel} ${theme.sectionLabelColor}`}>
                {section.label}
              </div>
            )}
            
            {/* Section Items */}
            {section.items.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                collapsed={collapsed}
                theme={theme}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer - Solo Logout */}
      <div className={`${sidebarStyles.footer} ${theme.dividerColor}`}>
        {/* Logout Button */}
        {showLogout && (
          <div
            onClick={onLogout}
            className={`
              ${sidebarStyles.menuItem}
              ${theme.itemTextColor}
              ${theme.itemHoverBackground}
              ${theme.logoutHoverColor}
            `.trim()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onLogout?.();
              }
            }}
          >
            <LogOut className={sidebarStyles.menuItemIcon} />
            {!collapsed && (
              <span className={sidebarStyles.menuItemLabel}>Esci</span>
            )}
            {collapsed && (
              <div className={`${sidebarStyles.tooltip} ${theme.tooltipBackground} ${theme.tooltipTextColor}`}>
                Esci
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}