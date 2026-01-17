// ============================================================================
// AEGIS BEAUTY - AUTH CALLBACK ROUTE
// File: apps/aegis-beauty/app/auth/callback/route.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  console.log('=== CALLBACK START ===');

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    console.log('verifyOtp error:', error);

    if (!error && data.user) {
      const user = data.user;
      console.log('User ID:', user.id);

      // Usa RPC per inserire il profilo (bypassa RLS)
      const { error: profileError } = await supabase.rpc('create_profile', {
        user_id: user.id,
        user_email: user.email || '',
        user_full_name: user.user_metadata?.full_name || '',
        user_phone: user.user_metadata?.phone || null,
      });

      console.log('Profile RPC error:', profileError);

      // Controlla se è un business owner
      const { data: businessMember } = await supabase
        .from('business_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (businessMember && ['owner', 'admin', 'staff'].includes((businessMember as any).role)) {
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      } else {
        return NextResponse.redirect(new URL('/bookings', requestUrl.origin));
      }
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}