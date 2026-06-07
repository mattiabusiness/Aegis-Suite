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

  // Implicit flow (no code, token in hash) — manda a /login, il browser preserva il hash
  if (!code && type === 'invite') {
    return NextResponse.redirect(new URL('/login?mode=register', request.url));
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
      // Vai direttamente a /login — salta /register per evitare il bug useSearchParams() di Next.js 15
      params.set('mode', 'register');
      response.headers.set('Location', new URL(`/login?${params.toString()}`, request.url).toString());
      return response;
    }

    // ================================================================
    // CONFERMA EMAIL STANDARD (titolare / cliente)
    // ================================================================
    if (user?.id) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Use the admin client so create_profile can be locked down to service_role
        // (a SECURITY DEFINER function must not be callable directly by authenticated users).
        await supabaseAdmin.rpc('create_profile', {
          user_id: user.id,
          user_email: user.email,
          user_full_name: metadata.full_name || '',
          user_phone: metadata.phone || null,
        });
      }

      // Sync email in customers table (email change confirmed — keep in sync with auth.users)
      if (user.email) {
        await supabaseAdmin
          .from('customers')
          .update({ email: user.email })
          .eq('user_id', user.id);
      }
    }

    // ================================================================
    // CUSTOMER SELF-REGISTRATION (dal link del business pubblico)
    // Se business_slug è nei metadata, crea o linka il record customers
    // ================================================================
    if (user?.id && metadata.business_slug) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: business } = await supabaseAdmin
          .from('businesses')
          .select('id')
          .eq('slug', metadata.business_slug)
          .eq('is_active', true)
          .single();

        if (business?.id) {
          // Check if a customer record exists by user_id OR by email (imported by owner)
          const { data: existing } = await supabaseAdmin
            .from('customers')
            .select('id, user_id')
            .eq('business_id', business.id)
            .or(`user_id.eq.${user.id},email.ilike.${user.email}`)
            .maybeSingle();

          if (existing && !existing.user_id) {
            // Owner had already imported this customer — just link the user_id
            await supabaseAdmin
              .from('customers')
              .update({ user_id: user.id, is_active: true })
              .eq('id', existing.id);
          } else if (!existing) {
            // Brand-new customer — create the record
            const { data: prof } = await supabaseAdmin
              .from('profiles')
              .select('full_name, email, phone')
              .eq('id', user.id)
              .maybeSingle();

            await supabaseAdmin.from('customers').insert({
              business_id: business.id,
              user_id:     user.id,
              full_name:   (prof?.full_name) || metadata.full_name || 'Cliente',
              email:       user.email || '',
              phone:       (prof?.phone) || metadata.phone || null,
              source:      'online',
              is_active:   true,
            });
          }
        }
      } catch (e) {
        console.error('[Callback] Errore creazione customer:', e);
        // Non-critical: procedi comunque con il redirect
      }
    }

    // Ritorna la response con sessione nei cookie
    response.headers.set('Location', new URL(next, request.url).toString());
    return response;
  }

  return NextResponse.redirect(new URL(next, request.url));
}
