// ============================================================================
// AEGIS BEAUTY - AUTH CALLBACK
// File: apps/aegis-beauty/app/auth/callback/route.ts
// Handles: Email confirmation, Magic links, Invites
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  // Sanitize next: only allow relative paths (no external redirects)
  const rawNext = requestUrl.searchParams.get('next') ?? '';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  // Se non c'è code ma c'è type=invite, è implicit flow — gestito lato client
  if (!code && type === 'invite') {
    return NextResponse.redirect(new URL('/register?from_invite=true', request.url));
  }

  if (code) {
    // Prepara la response di redirect — i cookie vengono scritti su di essa
    const redirectUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Crea il client SSR corretto per Route Handler:
    // legge da request.cookies, scrive su response.cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Scambia il code con la sessione — scrive i cookie sulla response
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    const user = data?.user;
    const metadata = user?.user_metadata || {};

    // ================================================================
    // STAFF INVITE — collega user_id, crea business_member e profilo
    // ================================================================
    if (metadata.invite_type === 'staff' && metadata.staff_id && user?.id) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 1. Collega staff.user_id e leggi business_id in un'unica query
        const { data: staffRecord } = await supabaseAdmin
          .from('staff')
          .update({ user_id: user.id })
          .eq('id', metadata.staff_id)
          .is('user_id', null)
          .select('business_id')
          .single();

        // 2. Inserisci business_member e upsert profilo in parallelo
        if (staffRecord?.business_id) {
          await supabaseAdmin
            .from('business_members')
            .delete()
            .eq('user_id', user.id)
            .eq('business_id', staffRecord.business_id);

          await Promise.all([
            supabaseAdmin
              .from('business_members')
              .insert({
                user_id: user.id,
                business_id: staffRecord.business_id,
                role: 'staff',
                is_active: true,
              }),
            supabaseAdmin
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: metadata.full_name || '',
                phone: metadata.phone || null,
              }, { onConflict: 'id' }),
          ]);
        }

      } catch (e) {
        console.error('[Callback] Errore setup staff:', e);
      }

      // Ritorna la response con sessione nei cookie → dashboard diretta
      return response;
    }

    // ================================================================
    // CUSTOMER/BUSINESS INVITE
    // ================================================================
    if (type === 'invite' || metadata.invited_by_business) {
      const params = new URLSearchParams();
      params.set('invite', 'true');
      if (metadata.full_name) params.set('name', metadata.full_name);
      if (user?.email) params.set('email', user.email);
      if (metadata.phone) params.set('phone', metadata.phone);
      if (metadata.business_name) params.set('business', metadata.business_name);
      if (metadata.business_slug) params.set('business_slug', metadata.business_slug);
      if (metadata.customer_id) params.set('customer_id', metadata.customer_id);
      if (user?.id) params.set('user_id', user.id);
      // Riusa `response` (che ha già i cookie di sessione scritti) cambiando solo la destinazione
      response.headers.set('Location', new URL(`/register?${params.toString()}`, request.url).toString());
      return response;
    }

    // ================================================================
    // CONFERMA EMAIL STANDARD (titolare / cliente)
    // ================================================================
    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        await supabase.rpc('create_profile', {
          user_id: user.id,
          user_email: user.email,
          user_full_name: metadata.full_name || '',
          user_phone: metadata.phone || null,
        });
      }
    }

    // Ritorna la response con sessione nei cookie
    response.headers.set('Location', new URL(next, request.url).toString());
    return response;
  }

  return NextResponse.redirect(new URL(next, request.url));
}
