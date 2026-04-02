// ============================================================================
// AEGIS SUITE - STAFF CARD (Customer Interface, multi-vertical)
// File: packages/ui/src/components/customer/StaffCard.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import type { DashboardTheme } from '../dashboard/Themes';

// ============================================================================
// TYPES
// ============================================================================

export interface StaffCardStaff {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specializations: string[] | null;
}

export interface StaffCardProps {
  staff: StaffCardStaff;
  theme: DashboardTheme;
  onBook: (staffId: string) => void;
  index?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StaffCard({ staff, theme, onBook, index = 0 }: StaffCardProps) {
  const initials = staff.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.04)' }}
      onClick={() => onBook(staff.id)}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.12)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.04)'; }}
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
        padding: '20px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        textAlign: 'center',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Avatar — plain <img>, no Next.js dependency in packages/ui */}
      {staff.avatar_url ? (
        <img
          src={staff.avatar_url}
          alt={staff.full_name}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid rgba(168,85,247,0.12)',
          }}
        />
      ) : (
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${theme.sidebar.background}`}
        >
          {initials}
        </div>
      )}

      {/* Name */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
        {staff.full_name}
      </h3>

      {/* Specializations badges */}
      {staff.specializations && staff.specializations.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {staff.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme.header.accentColor}`}
              style={{ background: 'rgba(168,85,247,0.08)' }}
            >
              {spec}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
