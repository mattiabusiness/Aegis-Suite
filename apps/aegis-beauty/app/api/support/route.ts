// ============================================================================
// AEGIS BEAUTY - SUPPORT API ROUTE
// File: apps/aegis-beauty/app/api/support/route.ts
//
// Saves support requests to the support_tickets table.
// No external email service required.
//
// Future: add RESEND_API_KEY or SENDGRID_API_KEY to enable email
// notifications to SUPPORT_EMAIL (default: support@aegis.app)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

// ============================================================================
// TYPES
// ============================================================================

interface SupportRequestBody {
  category: string;
  message: string;
  userName: string;
  userEmail: string;
  businessName: string;
}

// ============================================================================
// CATEGORY LABELS
// ============================================================================

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Problema tecnico',
  feature: 'Richiesta funzionalità',
  billing: 'Abbonamento e pagamenti',
  account: 'Account e accesso',
  other: 'Altro',
};

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Verify user is authenticated
    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Parse body
    const body: SupportRequestBody = await request.json();
    const { category, message, userName, userEmail, businessName } = body;

    // Validate
    if (!category || !message?.trim()) {
      return NextResponse.json(
        { error: 'Categoria e messaggio sono obbligatori' },
        { status: 400 }
      );
    }

    if (message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Il messaggio deve essere di almeno 10 caratteri' },
        { status: 400 }
      );
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Messaggio troppo lungo (max 2000 caratteri)' }, { status: 400 });
    }
    if (category.length > 100) {
      return NextResponse.json({ error: 'Categoria non valida' }, { status: 400 });
    }
    if (userName && userName.length > 200) {
      return NextResponse.json({ error: 'Nome troppo lungo' }, { status: 400 });
    }
    if (businessName && businessName.length > 200) {
      return NextResponse.json({ error: 'Nome business troppo lungo' }, { status: 400 });
    }

    // Get user's business_id
    const { data: businessMember } = await supabase
      .from('business_members')
      .select('business_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single() as { data: { business_id: string } | null };

    // Save support ticket to DB
    const { error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        business_id: businessMember?.business_id || null,
        category,
        category_label: CATEGORY_LABELS[category] || category,
        message: message.trim(),
        user_name: userName,
        user_email: userEmail,
        business_name: businessName || null,
        status: 'open',
      } as never);

    if (insertError) {
      console.error('Error saving support ticket:', JSON.stringify(insertError));
      return NextResponse.json(
        { error: `Errore DB: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Richiesta inviata con successo',
    });

  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'invio della richiesta' },
      { status: 500 }
    );
  }
}