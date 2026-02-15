// ============================================================================
// AEGIS SUITE - ANIMATED SELECT COMPONENT
// File: packages/ui/src/components/ui/animated-select.tsx
// Reusable dropdown with animated list, hover depth effect, stagger entrance
// Uses portal + fixed positioning to escape overflow:hidden containers
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// TYPES
// ============================================================================

export interface AnimatedSelectOption {
  value: string;
  label: string;
}

export interface AnimatedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AnimatedSelectOption[] | string[];
  placeholder?: string;
  disabled?: boolean;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Max visible items before scroll */
  maxVisible?: number;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEM_HEIGHT = 36;

// ============================================================================
// COMPONENT
// ============================================================================

export function AnimatedSelect({
  value,
  onChange,
  options: rawOptions,
  placeholder = 'Seleziona...',
  disabled = false,
  compact = false,
  maxVisible = 10,
  className = '',
}: AnimatedSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number; width: number; direction: 'down' | 'up' }>({ top: 0, left: 0, width: 0, direction: 'down' });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  const options: AnimatedSelectOption[] = React.useMemo(
    () => rawOptions.map(o => (typeof o === 'string' ? { value: o, label: o } : o)),
    [rawOptions]
  );

  const selectedOption = options.find(o => o.value === value);
  const selectedIndex = options.findIndex(o => o.value === value);
  const maxHeight = maxVisible * ITEM_HEIGHT + 8;

  // Calculate dropdown position from trigger
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const goUp = spaceBelow < maxHeight && spaceAbove > spaceBelow;

    setDropdownPos({
      left: rect.left,
      width: Math.max(rect.width, 90),
      direction: goUp ? 'up' : 'down',
      top: goUp ? rect.top - 4 : rect.bottom + 4,
    });
  }, [maxHeight]);

  // Open handler
  const handleOpen = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    // Set hoveredIndex before opening
    setHoveredIndex(selectedIndex >= 0 ? selectedIndex : null);
    setIsOpen(true);
  };

  // Recalculate position whenever dropdown opens
  React.useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on scroll of ancestor (not the dropdown list itself)
  React.useEffect(() => {
    if (!isOpen) return;
    // Small delay to avoid the initial scrollIntoView triggering close
    const timer = setTimeout(() => {
      const handler = (e: Event) => {
        // Don't close if scrolling inside the dropdown list
        if (dropdownRef.current?.contains(e.target as Node)) return;
        setIsOpen(false);
      };
      window.addEventListener('scroll', handler, true);
      // Store cleanup ref
      cleanupRef.current = () => window.removeEventListener('scroll', handler, true);
    }, 100);
    return () => {
      clearTimeout(timer);
      cleanupRef.current?.();
    };
  }, [isOpen]);

  // Scroll selected into view on open
  React.useEffect(() => {
    if (isOpen && listRef.current && selectedIndex >= 0) {
      requestAnimationFrame(() => {
        if (!listRef.current) return;
        const scrollTo = Math.max(0, selectedIndex * ITEM_HEIGHT - maxHeight / 2 + ITEM_HEIGHT / 2);
        listRef.current.scrollTop = scrollTo;
      });
    }
  }, [isOpen, selectedIndex, maxHeight]);

  // Keyboard
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && hoveredIndex !== null) {
        onChange(options[hoveredIndex].value);
        setIsOpen(false);
      } else {
        updatePosition();
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) { updatePosition(); setIsOpen(true); return; }
      setHoveredIndex(prev => {
        const next = prev === null ? 0 : Math.min(prev + 1, options.length - 1);
        if (listRef.current) (listRef.current.children[next] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) { updatePosition(); setIsOpen(true); return; }
      setHoveredIndex(prev => {
        const next = prev === null ? options.length - 1 : Math.max(prev - 1, 0);
        if (listRef.current) (listRef.current.children[next] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    }
  }, [disabled, isOpen, hoveredIndex, options, onChange, updatePosition]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const py = compact ? 'py-1.5' : 'py-2';
  const px = compact ? 'px-2.5' : 'px-3.5';

  // Dropdown rendered via portal
  const dropdown = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="rounded-xl overflow-hidden"
      style={{
        position: 'fixed',
        zIndex: 9999,
        left: dropdownPos.left,
        ...(dropdownPos.direction === 'down'
          ? { top: dropdownPos.top }
          : { bottom: window.innerHeight - dropdownPos.top }
        ),
        minWidth: dropdownPos.width,
        maxWidth: dropdownPos.width,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(168,85,247,0.12)',
        boxShadow: '0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        animation: dropdownPos.direction === 'down' ? 's_asel_enter 0.2s ease-out' : 's_asel_enterUp 0.2s ease-out',
      }}
    >
      <div
        ref={listRef}
        className="overflow-y-auto overflow-x-hidden py-1"
        style={{ maxHeight }}
        role="listbox"
      >
        {options.map((option, idx) => {
          const isSelected = option.value === value;
          const isHovered = hoveredIndex === idx;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHoveredIndex(idx)}
              className="w-full text-left outline-none"
              style={{ height: ITEM_HEIGHT, padding: '0 4px' }}
            >
              <div
                className="flex items-center rounded-md px-2.5 h-full"
                style={{
                  background: isSelected
                    ? 'rgba(168,85,247,0.1)'
                    : isHovered
                      ? 'rgba(168,85,247,0.05)'
                      : 'transparent',
                  transform: isHovered
                    ? 'translateY(-2px) scale(1.03)'
                    : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? '0 4px 14px rgba(168,85,247,0.12)'
                    : 'none',
                  borderLeft: isSelected
                    ? '2.5px solid #a855f7'
                    : isHovered
                      ? '2.5px solid rgba(168,85,247,0.4)'
                      : '2.5px solid transparent',
                  transition: 'all 0.15s ease-out',
                }}
              >
                <span
                  className="text-sm"
                  style={{
                    color: isSelected ? '#7c3aed' : isHovered ? '#6d28d9' : '#4b5563',
                    fontWeight: isSelected ? 600 : isHovered ? 500 : 400,
                    transition: 'color 0.15s, font-weight 0.15s',
                  }}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes s_asel_enter {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes s_asel_enterUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-1.5 rounded-xl ${py} ${px} text-sm
          outline-none transition-all duration-200 min-w-0 cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: isOpen ? '1.5px solid #a855f7' : '1.5px solid rgba(0,0,0,0.08)',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(168,85,247,0.12), 0 4px 12px rgba(124,58,237,0.08)'
            : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <span className={`truncate ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className="w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdown}
    </div>
  );
}