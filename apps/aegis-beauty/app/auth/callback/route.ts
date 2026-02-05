// ============================================================================
// AEGIS BEAUTY - AUTH CALLBACK
// File: apps/aegis-beauty/app/auth/callback/route.ts
// Handles: Email confirmation, Magic links, Invites
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@aegis/core';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  
  // ================================================================
  // CASO 1: Implicit flow (hash fragment con access_token)
  // Supabase invites usano questo flow - il token è nel # fragment
  // Ma il server non può leggere il hash, quindi serve una pagina client
  // Redirect a una pagina client che gestisce il hash
  // ================================================================
  
  // Se non c'è code ma c'è type=invite, probabilmente è implicit flow
  // Il browser deve gestire il hash fragment lato client
  if (!code && type === 'invite') {
    // Redirect alla pagina register che gestirà il token lato client
    return NextResponse.redirect(new URL('/register?from_invite=true', request.url));
  }
  
  // ================================================================
  // CASO 2: PKCE flow (code nei query params)
  // ================================================================
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore) as any;
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
    
    const user = data?.user;
    const metadata = user?.user_metadata || {};
    
    // Check if this is an invite
    if (type === 'invite' || metadata.invited_by_business) {
      // Build query params for register page
      const params = new URLSearchParams();
      params.set('invite', 'true');
      
      if (metadata.full_name) params.set('name', metadata.full_name);
      if (user?.email) params.set('email', user.email);
      if (metadata.phone) params.set('phone', metadata.phone);
      if (metadata.business_name) params.set('business', metadata.business_name);
      if (metadata.business_slug) params.set('business_slug', metadata.business_slug);
      if (metadata.customer_id) params.set('customer_id', metadata.customer_id);
      if (user?.id) params.set('user_id', user.id);
      
      // Redirect to register page with pre-filled data
      return NextResponse.redirect(new URL(`/register?${params.toString()}`, request.url));
    }
    
    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      // Create profile for new user
      const { error: profileError } = await supabase.rpc('create_profile', {
        user_id: user.id,
        user_email: user.email,
        user_full_name: metadata.full_name || '',
        user_phone: metadata.phone || null,
      });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }
  }
  
  return NextResponse.redirect(new URL(next, request.url));
}