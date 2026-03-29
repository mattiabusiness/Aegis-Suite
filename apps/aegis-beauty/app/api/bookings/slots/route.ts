// ============================================================================
// AEGIS BEAUTY - BOOKING SLOTS API (Customer-facing)
// File: apps/aegis-beauty/app/api/bookings/slots/route.ts
//
// GET /api/bookings/slots?date=YYYY-MM-DD&serviceId=xxx&staffId=xxx&businessId=xxx
//
// Requires: authenticated customer session
// Returns: AvailableSlot[] via getAvailableSlots() from @aegis/core
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, getCurrentUser, getAvailableSlots } from '@aegis/core';
import type {
  AvailabilityConfig,
  AvailabilityDayHours,
  StaffDayHours,
  ExistingAppointment,
  ClosureInfo,
  StaffTimeOff as StaffTimeOffType,
} from '@aegis/core';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date       = searchParams.get('date');
    const serviceId  = searchParams.get('serviceId');
    const staffId    = searchParams.get('staffId');
    const businessId = searchParams.get('businessId');

    if (!date || !serviceId || !businessId) {
      return NextResponse.json(
        { error: 'Parametri mancanti: date, serviceId, businessId obbligatori' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Formato data non valido. Usa YYYY-MM-DD' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase    = createServerSupabaseClient(cookieStore);
    const user        = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Active staff IDs (needed for staff_hours / staff_services queries)
    const { data: activeStaffRows } = await supabase
      .from('staff')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .eq('accepts_bookings', true);

    const activeStaffIds = (activeStaffRows ?? []).map((s: { id: string }) => s.id);

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

      activeStaffIds.length > 0
        ? supabase
            .from('staff_services')
            .select('staff_id, service_id')
            .in('staff_id', activeStaffIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),

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

    if ((businessResult as { error?: unknown }).error || !(businessResult as { data?: unknown }).data) {
      return NextResponse.json({ error: 'Business non trovato' }, { status: 404 });
    }
    if ((serviceResult as { error?: unknown }).error || !(serviceResult as { data?: unknown }).data) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    const business = (businessResult as { data: { workstations: number } }).data;
    const service  = (serviceResult  as { data: { id: string; duration_minutes: number; name: string } }).data;

    const businessHours: AvailabilityDayHours[] = ((businessHoursResult.data ?? []) as Record<string, unknown>[]).map(bh => ({
      dayOfWeek:  bh.day_of_week  as string,
      isOpen:     bh.is_open      as boolean,
      openTime1:  bh.open_time_1  as string | null,
      closeTime1: bh.close_time_1 as string | null,
      openTime2:  bh.open_time_2  as string | null,
      closeTime2: bh.close_time_2 as string | null,
    }));

    const closures: ClosureInfo[] = [];
    for (const c of ((closuresResult.data ?? []) as Record<string, unknown>[])) {
      const isRecurring = c.is_recurring_yearly as boolean;
      const startDate   = c.start_date as string;
      const endDate     = c.end_date   as string;
      const title       = c.title      as string;
      if (isRecurring) {
        const reqMD   = date.substring(5);
        const startMD = startDate.substring(5);
        const endMD   = endDate.substring(5);
        if (reqMD >= startMD && reqMD <= endMD) closures.push({ date, reason: title });
      } else {
        if (date >= startDate && date <= endDate) closures.push({ date, reason: title });
      }
    }

    const staffHours: StaffDayHours[] = ((staffHoursResult.data ?? []) as Record<string, unknown>[]).map(sh => ({
      staffId:    sh.staff_id    as string,
      dayOfWeek:  sh.day_of_week as string,
      isWorking:  sh.is_working  as boolean,
      startTime1: sh.start_time_1 as string | null,
      endTime1:   sh.end_time_1   as string | null,
      startTime2: sh.start_time_2 as string | null,
      endTime2:   sh.end_time_2   as string | null,
    }));

    const staffServicesMap: Record<string, string[]> = {};
    for (const ss of ((staffServicesResult.data ?? []) as Record<string, string>[])) {
      if (!staffServicesMap[ss.staff_id]) staffServicesMap[ss.staff_id] = [];
      staffServicesMap[ss.staff_id].push(ss.service_id);
    }

    const existingAppointments: ExistingAppointment[] = ((appointmentsResult.data ?? []) as Record<string, unknown>[]).map(a => ({
      id:        a.id        as string,
      staffId:   a.staff_id  as string,
      startTime: a.start_time as string,
      endTime:   a.end_time   as string,
      status:    a.status     as string,
    }));

    const staffTimeOff: StaffTimeOffType[] = ((staffTimeOffResult.data ?? []) as Record<string, unknown>[]).map(to => ({
      staffId:   to.staff_id   as string,
      startDate: to.start_date as string,
      endDate:   to.end_date   as string,
      isFullDay: to.is_full_day as boolean,
      startTime: to.start_time  as string | null,
      endTime:   to.end_time    as string | null,
    }));

    const config: AvailabilityConfig = {
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

    const slots = getAvailableSlots(config);

    return NextResponse.json({ slots }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('[bookings/slots] error:', error);
    return NextResponse.json({ error: 'Errore nel calcolo disponibilità' }, { status: 500 });
  }
}
