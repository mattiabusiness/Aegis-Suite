// ============================================================================
// AEGIS SUITE - SUPABASE CLIENT
// File: packages/core/src/lib/supabase.ts
// Compatible with Next.js 15
// ============================================================================

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from '@aegis/types';

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ============================================================================
// BROWSER CLIENT (per componenti 'use client')
// ============================================================================

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ============================================================================
// SERVER CLIENT (per Server Components, API Routes, Server Actions)
// Next.js 15 compatible - usa getAll/setAll invece di get/set/remove
// ============================================================================

export function createServerSupabaseClient(
  cookieStore: {
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: object) => void;
  }
) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignora errori in Server Components (read-only)
          // Questo è normale quando si chiama da un Server Component
        }
      },
    },
  });
}