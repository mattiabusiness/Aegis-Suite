// ============================================================================
// AEGIS BEAUTY - AVAILABILITY API
// File: apps/aegis-beauty/app/api/availability/route.ts
//
// GET /api/availability?date=YYYY-MM-DD&serviceId=xxx&staffId=xxx&businessId=xxx
//
// Returns available time slots for a given date, service, and optionally staff.
// Uses the core availability engine.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';

import type {
  AvailabilityConfig,
  AvailabilityDayHours,
  StaffDayHours,
  ExistingAppointment,
  ClosureInfo,
  StaffTimeOff as StaffTimeOffType,
} from '@aegis/core';
import { getAvailableSlots, checkSlotAvailability } from '@aegis/core';

// ============================================================================
// GET - Fetch available slots
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const staffId = searchParams.get('staffId');
    const businessId = searchParams.get('businessId');

    if (!date || !serviceId || !businessId) {
      return NextResponse.json(
        { error: 'Parametri mancanti: date, serviceId, businessId sono obbligatori' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Formato data non valido. Usa YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // ========================================================================
    // PRE-FETCH: Get active staff IDs (needed for staff_hours query)
    // ========================================================================

    const { data: activeStaffRows } = await supabase
      .from('staff')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true);

    const activeStaffIds = (activeStaffRows || []).map((s: { id: string }) => s.id);

    // ========================================================================
    // FETCH ALL REQUIRED DATA IN PARALLEL
    // ========================================================================

    const [
      businessResult,
      serviceResult,
      businessHoursResult,
      closuresResult,
      staffHoursResult,
      staffServicesResult,
      appointmentsResult,
      staffTimeOffResult,
    ] = await Promise.all([
      supabase
        .from('businesses')
        .select('workstations, booking_advance_min, booking_advance_max')
        .eq('id', businessId)
        .single(),

      supabase
        .from('services')
        .select('id, duration_minutes, name')
        .eq('id', serviceId)
        .single(),

      supabase
        .from('business_hours')
        .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
        .eq('business_id', businessId),

      supabase
        .from('business_closures')
        .select('start_date, end_date, title, is_recurring_yearly')
        .eq('business_id', businessId),

      activeStaffIds.length > 0
        ? supabase
            .from('staff_hours')
            .select('staff_id, day_of_week, is_working, start_time_1, end_time_1, start_time_2, end_time_2')
            .in('staff_id', activeStaffIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),

      supabase
        .from('staff_services')
        .select('staff_id, service_id')
        .eq('service_id', serviceId),

      supabase
        .from('appointments')
        .select('id, staff_id, start_time, end_time, status')
        .eq('business_id', businessId)
        .gte('start_time', `${date}T00:00:00`)
        .lte('start_time', `${date}T23:59:59`)
        .in('status', ['confirmed', 'pending', 'in_progress']),

      supabase
        .from('staff_time_off')
        .select('staff_id, start_date, end_date, is_full_day, start_time, end_time')
        .lte('start_date', date)
        .gte('end_date', date),
    ]);

    // ========================================================================
    // VALIDATE RESPONSES
    // ========================================================================

    if ((businessResult as any).error || !(businessResult as any).data) {
      return NextResponse.json({ error: 'Business non trovato' }, { status: 404 });
    }

    if ((serviceResult as any).error || !(serviceResult as any).data) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    const business = (businessResult as any).data as { workstations: number; booking_advance_min: number; booking_advance_max: number };
    const service = (serviceResult as any).data as { id: string; duration_minutes: number; name: string };

    // ========================================================================
    // TRANSFORM DATA FOR AVAILABILITY ENGINE
    // ========================================================================

    const businessHours: AvailabilityDayHours[] = ((businessHoursResult.data || []) as Record<string, unknown>[]).map((bh) => ({
      dayOfWeek: bh.day_of_week as string,
      isOpen: bh.is_open as boolean,
      openTime1: bh.open_time_1 as string | null,
      closeTime1: bh.close_time_1 as string | null,
      openTime2: bh.open_time_2 as string | null,
      closeTime2: bh.close_time_2 as string | null,
    }));

    const closures: ClosureInfo[] = [];
    for (const c of ((closuresResult.data || []) as Record<string, unknown>[])) {
      const startDate = c.start_date as string;
      const endDate = c.end_date as string;
      const isRecurring = c.is_recurring_yearly as boolean;
      const title = c.title as string;

      if (isRecurring) {
        const reqMonth = date.substring(5, 7);
        const reqDay = date.substring(8, 10);
        const startMD = startDate.substring(5);
        const endMD = endDate.substring(5);
        if (reqMonth + '-' + reqDay >= startMD && reqMonth + '-' + reqDay <= endMD) {
          closures.push({ date, reason: title });
        }
      } else {
        if (date >= startDate && date <= endDate) {
          closures.push({ date, reason: title });
        }
      }
    }

    const staffHours: StaffDayHours[] = ((staffHoursResult.data || []) as Record<string, unknown>[]).map((sh) => ({
      staffId: sh.staff_id as string,
      dayOfWeek: sh.day_of_week as string,
      isWorking: sh.is_working as boolean,
      startTime1: sh.start_time_1 as string | null,
      endTime1: sh.end_time_1 as string | null,
      startTime2: sh.start_time_2 as string | null,
      endTime2: sh.end_time_2 as string | null,
    }));

    const staffServicesMap: Record<string, string[]> = {};
    for (const ss of ((staffServicesResult.data || []) as Record<string, string>[])) {
      if (!staffServicesMap[ss.staff_id]) staffServicesMap[ss.staff_id] = [];
      staffServicesMap[ss.staff_id].push(ss.service_id);
    }

    const existingAppointments: ExistingAppointment[] = ((appointmentsResult.data || []) as Record<string, unknown>[]).map((a) => ({
      id: a.id as string,
      staffId: a.staff_id as string,
      startTime: a.start_time as string,
      endTime: a.end_time as string,
      status: a.status as string,
    }));

    const staffTimeOff: StaffTimeOffType[] = ((staffTimeOffResult.data || []) as Record<string, unknown>[]).map((to) => ({
      staffId: to.staff_id as string,
      startDate: to.start_date as string,
      endDate: to.end_date as string,
      isFullDay: to.is_full_day as boolean,
      startTime: to.start_time as string | null,
      endTime: to.end_time as string | null,
    }));

    // ========================================================================
    // COMPUTE AVAILABLE SLOTS
    // ========================================================================

    const availabilityConfig: AvailabilityConfig = {
      date,
      serviceDurationMinutes: service.duration_minutes,
      businessHours,
      workstations: business.workstations || 1,
      existingAppointments,
      closures,
      slotInterval: 15,
      bufferMinutes: 0,
      staffConfig: {
        allStaffIds: activeStaffIds,
        staffHours,
        specificStaffId: staffId || null,
        staffTimeOff,
        staffServices: staffServicesMap,
        serviceId,
      },
    };

    const slots = getAvailableSlots(availabilityConfig);

    return NextResponse.json({
      date,
      service: { id: service.id, name: service.name, duration: service.duration_minutes },
      staffId: staffId || null,
      workstations: business.workstations || 1,
      totalSlots: slots.length,
      slots,
    });
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Errore nel calcolo della disponibilità' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Validate a specific slot before booking
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, serviceId, staffId, businessId } = body;

    if (!date || !time || !serviceId || !businessId) {
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const [businessResult, serviceResult, businessHoursResult, closuresResult, appointmentsResult] =
      await Promise.all([
        supabase.from('businesses').select('workstations').eq('id', businessId).single(),
        supabase.from('services').select('duration_minutes').eq('id', serviceId).single(),
        supabase.from('business_hours').select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2').eq('business_id', businessId),
        supabase.from('business_closures').select('start_date, end_date, title').eq('business_id', businessId),
        supabase.from('appointments').select('id, staff_id, start_time, end_time, status')
          .eq('business_id', businessId)
          .gte('start_time', `${date}T00:00:00`)
          .lte('start_time', `${date}T23:59:59`)
          .in('status', ['confirmed', 'pending', 'in_progress']),
      ]);

    if (!(businessResult as any).data || !(serviceResult as any).data) {
      return NextResponse.json({ error: 'Dati non trovati' }, { status: 404 });
    }

    const business = (businessResult as any).data as { workstations: number };
    const service = (serviceResult as any).data as { duration_minutes: number };

    const businessHours: AvailabilityDayHours[] = ((businessHoursResult.data || []) as Record<string, unknown>[]).map((bh) => ({
      dayOfWeek: bh.day_of_week as string,
      isOpen: bh.is_open as boolean,
      openTime1: bh.open_time_1 as string | null,
      closeTime1: bh.close_time_1 as string | null,
      openTime2: bh.open_time_2 as string | null,
      closeTime2: bh.close_time_2 as string | null,
    }));

    const closures: ClosureInfo[] = [];
    for (const c of ((closuresResult.data || []) as Record<string, unknown>[])) {
      if (date >= (c.start_date as string) && date <= (c.end_date as string)) {
        closures.push({ date, reason: c.title as string });
      }
    }

    const existingAppointments: ExistingAppointment[] = ((appointmentsResult.data || []) as Record<string, unknown>[]).map((a) => ({
      id: a.id as string,
      staffId: a.staff_id as string,
      startTime: a.start_time as string,
      endTime: a.end_time as string,
      status: a.status as string,
    }));

    const result = checkSlotAvailability({
      date,
      time,
      serviceDurationMinutes: service.duration_minutes,
      businessHours,
      workstations: business.workstations || 1,
      existingAppointments,
      closures,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Slot validation error:', error);
    return NextResponse.json(
      { error: 'Errore nella validazione' },
      { status: 500 }
    );
  }
}