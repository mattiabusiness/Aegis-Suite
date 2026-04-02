// ============================================================================
// AEGIS SUITE - SERVICE CARD (Customer Interface, multi-vertical)
// File: packages/ui/src/components/customer/ServiceCard.tsx
// Row layout: name + description + duration badge | price + prenota button
// ============================================================================

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { DashboardTheme } from '../dashboard/Themes';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceCardService {
  id: string;
  name: string;
  short_description: string | null;
  duration_minutes: number;
  price: number;
  price_from: boolean;
}

export interface ServiceCardProps {
  service: ServiceCardService;
  theme: DashboardTheme;
  onBook: (serviceId: string) => void;
  index?: number;
  isLast?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ServiceCard({ service, onBook, index = 0, isLast = false }: ServiceCardProps) {
  const priceLabel = service.price_from
    ? `Da €${service.price.toFixed(2)}`
    : `€${service.price.toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.25) }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Left: name, description, duration */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e',
          marginBottom: 3, lineHeight: 1.3,
        }}>
          {service.name}
        </div>
        {service.short_description && (
          <div style={{
            fontSize: '0.78rem', color: '#9ca3af',
            marginBottom: 7, lineHeight: 1.4,
          }}>
            {service.short_description}
          </div>
        )}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 6,
          background: 'rgba(168,85,247,0.07)',
          border: '1px solid rgba(168,85,247,0.12)',
        }}>
          <Clock style={{ width: 11, height: 11, color: '#a855f7' }} />
          <span style={{ fontSize: '0.72rem', color: '#9333ea', fontWeight: 600 }}>
            {service.duration_minutes} min
          </span>
        </div>
      </div>

      {/* Right: price + book button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <span style={{
          fontSize: '1.05rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {priceLabel}
        </span>
        <motion.button
          onClick={() => onBook(service.id)}
          whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(147,51,234,0.45)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            boxShadow: '0 2px 12px rgba(147,51,234,0.3)',
          }}
        >
          Prenota
        </motion.button>
      </div>
    </motion.div>
  );
}
