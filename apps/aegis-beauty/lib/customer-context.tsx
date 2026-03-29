// ============================================================================
// AEGIS BEAUTY - CUSTOMER CONTEXT
// File: apps/aegis-beauty/lib/customer-context.tsx
// Provides business + customer data to the entire customer interface
// ============================================================================

'use client';

import React, { createContext, useContext } from 'react';
import type { Business, Customer } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerContextData {
  business: Business;
  customer: Customer | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CustomerContext = createContext<CustomerContextData | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function CustomerProvider({
  business,
  customer,
  children,
}: CustomerContextData & { children: React.ReactNode }) {
  return (
    <CustomerContext.Provider value={{ business, customer }}>
      {children}
    </CustomerContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useCustomer(): CustomerContextData {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return ctx;
}
