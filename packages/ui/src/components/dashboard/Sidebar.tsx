// ============================================================================
// AEGIS SUITE - SIDEBAR COMPONENT (Perfected v3)
// File: packages/ui/src/components/dashboard/Sidebar.tsx
// ============================================================================

'use client';

import * as React from 'react';
import {
  ChevronLeft,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// THEME TYPES (unchanged — backward compatible)
// ============================================================================

export interface SidebarTheme {
  background: string;
  borderColor: string;
  logoBackground: string;
  brandTextColor: string;
  sectionLabelColor: string;
  itemTextColor: string;
  itemHoverBackground: string;
  itemHoverTextColor: string;
  itemActiveBackground: string;
  itemActiveTextColor: string;
  badgeBackground: string;
  badgeTextColor: string;
  collapseButtonColor: string;
  tooltipBackground: string;
  tooltipTextColor: string;
  dividerColor: string;
  logoutHoverColor: string;
}

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
// TYPES (unchanged)
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
  logo: React.ReactNode | string;
  brandName: string;
  menuSections: SidebarMenuSection[];
  activeItemId?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onMenuItemClick?: (item: SidebarMenuItem) => void;
  onLogout?: () => void;
  onHelp?: () => void;
  showHelp?: boolean;
  showLogout?: boolean;
  theme?: SidebarTheme;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPANDED_W = 272;
const COLLAPSED_W = 104;
const TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

// ============================================================================
// MENU ITEM COMPONENT
// Labels stay in DOM always — opacity + max-width transition for smooth collapse
// ============================================================================

interface MenuItemComponentProps {
  item: SidebarMenuItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  index: number;
  mounted: boolean;
  compact?: boolean;
}

function MenuItemComponent({ item, isActive, collapsed, onClick, index, mounted, compact }: MenuItemComponentProps) {
  const Icon = item.icon;
  const [hovered, setHovered] = React.useState(false);

  const py = compact ? 11 : 15;
  const px = compact ? 14 : 20;
  const iconSize = compact ? 20 : 24;
  const fontSize = compact ? '0.87rem' : '1rem';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative mx-2 rounded-xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
      style={{
        padding: collapsed ? `${py}px` : `${py}px ${px}px`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
        transition: `opacity 0.35s ease ${index * 0.04}s, transform 0.35s ease ${index * 0.04}s, padding 0.3s cubic-bezier(0.4,0,0.2,1)`,
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))'
            : hovered
              ? 'rgba(255,255,255,0.06)'
              : 'transparent',
          borderLeft: isActive
            ? '3px solid rgba(255,255,255,0.9)'
            : hovered
              ? '3px solid rgba(255,255,255,0.25)'
              : '3px solid transparent',
          backdropFilter: isActive ? 'blur(8px)' : 'none',
          boxShadow: isActive
            ? '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Content row */}
      <div className="relative flex items-center gap-3" style={{ justifyContent: collapsed ? 'center' : 'flex-start', transition: 'justify-content 0.3s' }}>
        {/* Icon */}
        <div
          className="flex-shrink-0"
          style={{
            transform: hovered && !isActive ? 'scale(1.1)' : 'scale(1)',
            filter: isActive
              ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))'
              : hovered
                ? 'drop-shadow(0 0 4px rgba(255,255,255,0.15))'
                : 'none',
            transition: 'transform 0.2s ease, filter 0.2s ease',
          }}
        >
          <Icon
            style={{
              width: iconSize,
              height: iconSize,
              color: isActive ? '#fff' : hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
              transition: 'color 0.2s ease',
            }}
          />
        </div>

        {/* Label — always in DOM, animated via opacity + overflow */}
        <span
          className="whitespace-nowrap"
          style={{
            fontSize,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#fff' : hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
            transform: hovered && !collapsed ? 'translateX(2px)' : 'translateX(0)',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 180,
            overflow: 'hidden',
            transition: 'color 0.2s ease, transform 0.2s ease, opacity 0.25s ease, max-width 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span
            className="flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full"
            style={{
              background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
              color: '#fff',
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : 60,
              overflow: 'hidden',
              transition: 'opacity 0.25s ease, max-width 0.3s ease',
            }}
          >
            {item.badge}
          </span>
        )}
      </div>

      {/* Tooltip (collapsed) */}
      {collapsed && (
        <div
          className="sb-tooltip absolute left-full ml-3 px-3 py-2 text-sm font-medium rounded-xl whitespace-nowrap pointer-events-none z-50"
          style={{
            background: 'rgba(15,23,42,0.95)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            opacity: 0,
            transform: 'translateX(-4px)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
        >
          {item.label}
          {item.badge && <span className="ml-2 opacity-60">({item.badge})</span>}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LOGOUT BUTTON (scoped red hover)
// ============================================================================

function LogoutButton({ collapsed, mounted, onLogout }: { collapsed: boolean; mounted: boolean; onLogout?: () => void }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onLogout}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative mx-2 rounded-xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      style={{
        padding: collapsed ? '10px' : '10px 14px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease 0.4s, padding 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogout?.(); }}
    >
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: hovered ? 'rgba(239,68,68,0.08)' : 'transparent',
          transition: 'background 0.2s ease',
        }}
      />
      <div className="relative flex items-center gap-3" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <LogOut
          className="flex-shrink-0"
          style={{
            width: 20,
            height: 20,
            color: hovered ? '#f87171' : 'rgba(255,255,255,0.4)',
            transition: 'color 0.2s ease',
          }}
        />
        <span
          className="font-medium whitespace-nowrap"
          style={{
            fontSize: '0.87rem',
            color: hovered ? '#f87171' : 'rgba(255,255,255,0.4)',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 100,
            overflow: 'hidden',
            transition: 'color 0.2s ease, opacity 0.25s ease, max-width 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          Esci
        </span>
      </div>

      {collapsed && (
        <div
          className="sb-tooltip absolute left-full ml-3 px-3 py-2 text-sm font-medium rounded-xl whitespace-nowrap pointer-events-none z-50"
          style={{
            background: 'rgba(15,23,42,0.95)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            opacity: 0,
            transform: 'translateX(-4px)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
        >
          Esci
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
  const [mounted, setMounted] = React.useState(false);
  const [collapseHovered, setCollapseHovered] = React.useState(false);
  const [transitioning, setTransitioning] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState<{ top: number; left: number } | null>(null);
  const collapseBtnRef = React.useRef<HTMLDivElement>(null);

  // Position tooltip next to button (fixed, outside sidebar overflow)
  React.useEffect(() => {
    if (collapseHovered && collapseBtnRef.current) {
      const rect = collapseBtnRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
    } else {
      setTooltipPos(null);
    }
  }, [collapseHovered]);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleCollapse = () => {
    setTransitioning(true);
    onCollapsedChange?.(!collapsed);
    setTimeout(() => setTransitioning(false), 350);
  };
  const handleItemClick = (item: SidebarMenuItem) => onMenuItemClick?.(item);

  // Split: first section = main nav, rest = bottom support
  const mainSections = menuSections.slice(0, 1);
  const bottomSections = menuSections.slice(1);

  let globalIndex = 0;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-40 ${className}`}
      style={{
        width: collapsed ? COLLAPSED_W : EXPANDED_W,
        background: 'linear-gradient(145deg, #3b0764 0%, #581c87 30%, #6b21a8 60%, #7c3aed 100%)',
        borderRight: '1px solid rgba(168,85,247,0.12)',
        boxShadow: '4px 0 32px rgba(88,28,135,0.08), 1px 0 0 rgba(168,85,247,0.06)',
        transition: `width 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
        overflow: 'hidden',
      }}
    >

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Transition blur overlay */}
      {transitioning && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            background: 'rgba(59,7,100,0.15)',
            animation: 'sb-blur-fade 0.35s ease-out forwards',
          }}
        />
      )}

      {/* ═══ Header ═══ */}
      <div
        className="relative flex items-center border-b"
        style={{
          padding: collapsed ? '20px 14px' : '20px 18px',
          borderColor: 'rgba(255,255,255,0.06)',
          transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo */}
        <div
          className="flex-shrink-0 rounded-xl flex items-center justify-center"
          style={{
            width: 42,
            height: 42,
            background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(126,34,206,0.4))',
            border: '1px solid rgba(168,85,247,0.25)',
            boxShadow: '0 4px 16px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'none',
          }}
        >
          {typeof logo === 'string' ? (
            <img src={logo} alt={brandName} className="w-6 h-6 object-contain" />
          ) : (
            logo
          )}
        </div>

        {/* Brand — smooth collapse */}
        <span
          className="ml-3 font-bold text-white whitespace-nowrap"
          style={{
            fontSize: '1.05rem',
            letterSpacing: '-0.01em',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 160,
            overflow: 'hidden',
            transition: 'opacity 0.25s ease, max-width 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {brandName}
        </span>

        {/* Collapse button — always visible, bigger hit area */}
        <div
          onClick={handleCollapse}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          className={`sb-collapse-btn flex-shrink-0 rounded-lg flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${collapsed ? '' : 'ml-auto'}`}
        ref={collapseBtnRef}
          style={{
            width: 28,
            height: 28,
            minWidth: 28,
            background: collapseHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: '1px solid',
            borderColor: collapseHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
            transition: 'all 0.2s ease',
          }}
          role="button"
          tabIndex={0}
          aria-label={collapsed ? 'Espandi menu' : 'Comprimi menu'}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCollapse(); }}
        >
          <div
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              color: collapseHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), color 0.2s ease',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ═══ Main Navigation ═══ */}
      <nav
        className="flex-1 overflow-y-auto py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mainSections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-2">
            {section.label && (
              <div
                className="px-5 mb-3 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap overflow-hidden"
                style={{
                  color: 'rgba(255,255,255,0.25)',
                  opacity: mounted && !collapsed ? 1 : 0,
                  maxHeight: collapsed ? 0 : 20,
                  marginBottom: collapsed ? 0 : 12,
                  transform: mounted ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 0.3s ease ${sectionIndex * 0.1}s, transform 0.4s ease ${sectionIndex * 0.1}s, max-height 0.3s ease, margin-bottom 0.3s ease`,
                }}
              >
                {section.label}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const itemIndex = globalIndex++;
                return (
                  <MenuItemComponent
                    key={item.id}
                    item={item}
                    isActive={activeItemId === item.id}
                    collapsed={collapsed}
                    onClick={() => handleItemClick(item)}
                    index={itemIndex}
                    mounted={mounted}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ═══ Footer: Support + Logout ═══ */}
      <div
        className="mt-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Support items (Impostazioni, Aiuto) */}
        <div className="pt-2 pb-1 space-y-0.5">
          {bottomSections.map((section) =>
            section.items.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                collapsed={collapsed}
                onClick={() => handleItemClick(item)}
                index={globalIndex++}
                mounted={mounted}
                compact
              />
            ))
          )}
        </div>

        {/* Divider */}
        <div
          className="mx-4 my-1"
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          }}
        />

        {/* Logout */}
        <div className="pb-3 pt-1">
          {showLogout && (
            <LogoutButton collapsed={collapsed} mounted={mounted} onLogout={onLogout} />
          )}
        </div>
      </div>

      {/* Collapse tooltip (fixed, outside sidebar overflow) */}
      {tooltipPos && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 500,
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(88,28,135,0.95), rgba(107,33,168,0.95))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 10,
            border: '1px solid rgba(168,85,247,0.2)',
            boxShadow: '0 8px 24px rgba(88,28,135,0.3), 0 0 0 1px rgba(168,85,247,0.1)',
            zIndex: 9999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: 'sb-tip-in 0.15s ease-out',
          }}
        >
          {collapsed ? 'Apri barra laterale' : 'Chiudi barra laterale'}
        </div>
      )}

      {/* ═══ Styles ═══ */}
      <style>{`
        @keyframes sb-tip-in {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes sb-blur-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes sb-breathe {
          0%, 100% {
            box-shadow: 0 4px 16px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
          }
          50% {
            box-shadow: 0 6px 28px rgba(168,85,247,0.45), 0 0 14px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.18);
          }
        }
        aside nav::-webkit-scrollbar { display: none; }
        .mx-2:hover .sb-tooltip,
        .sb-collapse-btn:hover .sb-tooltip,
        .sb-collapse-btn:hover .sb-collapse-tooltip {      </div>
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </aside>
  );
}