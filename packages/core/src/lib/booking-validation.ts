// ============================================================================
// AEGIS SUITE - BOOKING VALIDATION (server-side, shared)
// File: packages/core/src/lib/booking-validation.ts
//
// Single source of truth for "can this appointment be booked?".
//   - loadAvailabilityConfig(): fetches all DB data and builds the engine config.
//     Reused by the slot endpoints AND the validator so "slots shown" === "slots
//     bookable".
//   - validateAppointment(): validates one specific appointment before insert
//     (hours, closures, staff hours/time-off, service capability, accepts_bookings,
//     workstations) and resolves the staff member to assign.
//
// The atomic, race-sensitive part (staff overlap + workstation capacity at the
// exact moment of insert) is enforced by the Postgres RPC `create_appointment_safe`.
// This module is the rich, config-based gate that runs just before that RPC.
// ============================================================================

import {
  getAvailableSlots,
  checkSlotAvailability,
  BUSY_STATUSES,
} from './availability';
import type {
  AvailabilityConfig,
  DayHours as AvailabilityDayHours,
  StaffDayHours,
  ExistingAppointment,
  ClosureInfo,
  StaffTimeOff,
  AvailableSlot,
} from './availability';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

// Re-export so API routes can import the canonical busy-status set from one place.
export { BUSY_STATUSES };

// ============================================================================
// TIMEZONE
// ============================================================================

/**
 * Parse a `YYYY-MM-DD` + `HH:mm` pair as Europe/Rome local time and return the
 * correct UTC Date. Without this, a UTC server stores "10:00" as 10:00 UTC,
 * i.e. 2h ahead of the real Italian wall-clock time during DST.
 */
export function parseAsRomeTime(dateStr: string, timeStr: string): Date {
  const naive = new Date(`${dateStr}T${timeStr}:00.000Z`);
  const romeStr = naive.toLocaleString('en-US', { timeZone: 'Europe/Rome' });
  const romeAsUtcMs = new Date(romeStr).getTime();
  const offsetMs = naive.getTime() - romeAsUtcMs;
  return new Date(naive.getTime() + offsetMs);
}

/**
 * Format a UTC timestamp as Europe/Rome wall-clock "HH:MM".
 * The availability engine reasons in local wall-clock minutes (business hours
 * are stored as Rome local strings), so existing appointments — stored in UTC —
 * MUST be converted to Rome time before being handed to the engine. Otherwise a
 * 15:00 Rome appointment (13:00 UTC) would be treated as occupying 13:00, and
 * the operator would wrongly appear free at 15:00.
 */
function toRomeHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Customer booking window [earliest, latest] in epoch ms, derived from the
 * business advance settings. `0` means "no limit". The gestore flow is NOT
 * subject to this window (can book anytime, incl. retroactive walk-ins).
 */
export function customerBookingWindow(
  advanceMinHours: number,
  advanceMaxDays: number,
  nowMs: number = Date.now(),
): { earliest: number; latest: number } {
  const earliest = nowMs + Math.max(advanceMinHours, 0) * 3_600_000;
  const latest = advanceMaxDays > 0 ? nowMs + advanceMaxDays * 86_400_000 : Number.POSITIVE_INFINITY;
  return { earliest, latest };
}

// ============================================================================
// SHARED DATA LOADER
// ============================================================================

export interface LoadConfigParams {
  businessId: string;
  serviceId: string;
  /** Specific operator requested, or null for "any available". */
  staffId: string | null;
  /** Day to compute, `YYYY-MM-DD` (Rome local date). */
  date: string;
  /**
   * Customer flow → only staff with `accepts_bookings = true` are eligible.
   * Dashboard flow → any active staff (gestore can book non-online staff too).
   */
  onlineOnly: boolean;
}

export interface LoadedConfig {
  config: AvailabilityConfig;
  service: { id: string; name: string; duration_minutes: number; price: number };
  business: {
    workstations: number;
    bufferMinutes: number;
    /** Minimum advance the customer must book (hours). 0 = no limit. */
    advanceMinHours: number;
    /** Maximum advance the customer can book (days). 0 = no limit. */
    advanceMaxDays: number;
  };
}

export type LoadConfigResult =
  | { ok: true; data: LoadedConfig }
  | { ok: false; status: number; error: string };

/**
 * Fetch every input the availability engine needs and assemble an
 * `AvailabilityConfig`. Used by both the slot endpoints and the validator.
 */
export async function loadAvailabilityConfig(
  client: AnySupabaseClient,
  params: LoadConfigParams,
): Promise<LoadConfigResult> {
  const { businessId, serviceId, staffId, date, onlineOnly } = params;

  // Active (and, for the customer flow, bookable) staff IDs.
  let staffQuery = client
    .from('staff')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_active', true);
  if (onlineOnly) staffQuery = staffQuery.eq('accepts_bookings', true);
  const { data: activeStaffRows } = await staffQuery;
  const activeStaffIds: string[] = (activeStaffRows ?? []).map((s: { id: string }) => s.id);

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
    client
      .from('businesses')
      .select('workstations, booking_buffer_minutes, booking_advance_min, booking_advance_max, is_active')
      .eq('id', businessId)
      .single(),

    client
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('id', serviceId)
      .eq('business_id', businessId)
      .single(),

    client
      .from('business_hours')
      .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
      .eq('business_id', businessId),

    client
      .from('business_closures')
      .select('start_date, end_date, title, is_recurring_yearly')
      .eq('business_id', businessId),

    activeStaffIds.length > 0
      ? client
          .from('staff_hours')
          .select('staff_id, day_of_week, is_working, start_time_1, end_time_1, start_time_2, end_time_2')
          .in('staff_id', activeStaffIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),

    activeStaffIds.length > 0
      ? client
          .from('staff_services')
          .select('staff_id, service_id')
          .in('staff_id', activeStaffIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),

    // Appointments that START within the requested day (Rome day boundaries are
    // close enough to UTC for salon hours; long cross-midnight bookings are rare).
    client
      .from('appointments')
      .select('id, staff_id, start_time, end_time, status')
      .eq('business_id', businessId)
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`)
      .in('status', BUSY_STATUSES as unknown as string[]),

    client
      .from('staff_time_off')
      .select('staff_id, start_date, end_date, is_full_day, start_time, end_time')
      .lte('start_date', date)
      .gte('end_date', date),
  ]);

  if (businessResult.error || !businessResult.data) {
    return { ok: false, status: 404, error: 'Attività non disponibile' };
  }
  if (!businessResult.data.is_active) {
    return { ok: false, status: 404, error: 'Attività non disponibile' };
  }
  if (serviceResult.error || !serviceResult.data) {
    return { ok: false, status: 404, error: 'Servizio non trovato' };
  }

  const business = businessResult.data as {
    workstations: number;
    booking_buffer_minutes: number | null;
    booking_advance_min: number | null;
    booking_advance_max: number | null;
    is_active: boolean;
  };
  const service = serviceResult.data as {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
  };

  const businessHours: AvailabilityDayHours[] = ((businessHoursResult.data ?? []) as Record<string, unknown>[]).map(bh => ({
    dayOfWeek: bh.day_of_week as string,
    isOpen: bh.is_open as boolean,
    openTime1: bh.open_time_1 as string | null,
    closeTime1: bh.close_time_1 as string | null,
    openTime2: bh.open_time_2 as string | null,
    closeTime2: bh.close_time_2 as string | null,
  }));

  const closures: ClosureInfo[] = [];
  for (const c of ((closuresResult.data ?? []) as Record<string, unknown>[])) {
    const isRecurring = c.is_recurring_yearly as boolean;
    const startDate = c.start_date as string;
    const endDate = c.end_date as string;
    const title = c.title as string;
    if (isRecurring) {
      const reqMD = date.substring(5);
      const startMD = startDate.substring(5);
      const endMD = endDate.substring(5);
      if (reqMD >= startMD && reqMD <= endMD) closures.push({ date, reason: title });
    } else {
      if (date >= startDate && date <= endDate) closures.push({ date, reason: title });
    }
  }

  const staffHours: StaffDayHours[] = ((staffHoursResult.data ?? []) as Record<string, unknown>[]).map(sh => ({
    staffId: sh.staff_id as string,
    dayOfWeek: sh.day_of_week as string,
    isWorking: sh.is_working as boolean,
    startTime1: sh.start_time_1 as string | null,
    endTime1: sh.end_time_1 as string | null,
    startTime2: sh.start_time_2 as string | null,
    endTime2: sh.end_time_2 as string | null,
  }));

  const staffServicesMap: Record<string, string[]> = {};
  for (const ss of ((staffServicesResult.data ?? []) as Record<string, string>[])) {
    if (!staffServicesMap[ss.staff_id]) staffServicesMap[ss.staff_id] = [];
    staffServicesMap[ss.staff_id].push(ss.service_id);
  }

  const existingAppointments: ExistingAppointment[] = ((appointmentsResult.data ?? []) as Record<string, unknown>[]).map(a => ({
    id: a.id as string,
    staffId: a.staff_id as string,
    // Convert UTC -> Rome wall-clock so it lines up with the slot grid.
    startTime: toRomeHHMM(a.start_time as string),
    endTime: toRomeHHMM(a.end_time as string),
    status: a.status as string,
  }));

  const staffTimeOff: StaffTimeOff[] = ((staffTimeOffResult.data ?? []) as Record<string, unknown>[]).map(to => ({
    staffId: to.staff_id as string,
    startDate: to.start_date as string,
    endDate: to.end_date as string,
    isFullDay: to.is_full_day as boolean,
    startTime: to.start_time as string | null,
    endTime: to.end_time as string | null,
  }));

  const bufferMinutes = business.booking_buffer_minutes ?? 0;

  const config: AvailabilityConfig = {
    date,
    serviceDurationMinutes: service.duration_minutes,
    businessHours,
    workstations: business.workstations || 1,
    existingAppointments,
    closures,
    slotInterval: 15,
    bufferMinutes,
    staffConfig: {
      allStaffIds: activeStaffIds,
      staffHours,
      specificStaffId: staffId || null,
      staffTimeOff,
      staffServices: staffServicesMap,
      serviceId,
    },
  };

  return {
    ok: true,
    data: {
      config,
      service,
      business: {
        workstations: business.workstations || 1,
        bufferMinutes,
        advanceMinHours: Math.max(business.booking_advance_min ?? 0, 0),
        advanceMaxDays: Math.max(business.booking_advance_max ?? 0, 0),
      },
    },
  };
}

/** Convenience wrapper returning the bookable slots for a day. */
export async function getBookableSlots(
  client: AnySupabaseClient,
  params: LoadConfigParams,
): Promise<{ ok: true; slots: AvailableSlot[]; loaded: LoadedConfig } | { ok: false; status: number; error: string }> {
  const res = await loadAvailabilityConfig(client, params);
  if (!res.ok) return res;

  let slots = getAvailableSlots(res.data.config);

  // Customer flow: hide slots in the past and outside the min/max advance window.
  if (params.onlineOnly) {
    const now = Date.now();
    const { earliest, latest } = customerBookingWindow(
      res.data.business.advanceMinHours,
      res.data.business.advanceMaxDays,
      now,
    );
    slots = slots.filter(s => {
      const t = parseAsRomeTime(params.date, s.time).getTime();
      return t > now && t >= earliest && t <= latest;
    });
  }

  return { ok: true, slots, loaded: res.data };
}

// ============================================================================
// SINGLE-APPOINTMENT VALIDATION
// ============================================================================

export interface ValidateAppointmentParams {
  businessId: string;
  serviceId: string;
  staffId: string | null;
  /** Rome-local date `YYYY-MM-DD`. */
  date: string;
  /** Rome-local time `HH:mm`. */
  time: string;
  onlineOnly: boolean;
  /** Reschedule: ignore this appointment when checking conflicts (it's being moved). */
  excludeAppointmentId?: string | null;
}

export type ValidateAppointmentResult =
  | {
      ok: true;
      resolvedStaffId: string | null;
      service: { id: string; name: string; duration_minutes: number; price: number };
      bufferMinutes: number;
      startTime: Date;
      endTime: Date;
    }
  | { ok: false; status: number; code: string; reason: string };

/**
 * Validate a specific appointment request before creating it. Resolves which
 * staff member should be assigned (honouring an explicit choice or auto-assigning
 * the first eligible+free operator). Mirrors exactly what `getBookableSlots`
 * would show, so a request for a slot the UI offered will pass here.
 */
export async function validateAppointment(
  client: AnySupabaseClient,
  params: ValidateAppointmentParams,
): Promise<ValidateAppointmentResult> {
  const { businessId, serviceId, staffId, date, time, onlineOnly, excludeAppointmentId } = params;

  const loaded = await loadAvailabilityConfig(client, { businessId, serviceId, staffId, date, onlineOnly });
  if (!loaded.ok) {
    return { ok: false, status: loaded.status, code: 'NOT_FOUND', reason: loaded.error };
  }

  const { config, service, business } = loaded.data;

  // Reschedule: drop the appointment being moved so it doesn't conflict with itself.
  const existingAppointments = excludeAppointmentId
    ? config.existingAppointments.filter(a => a.id !== excludeAppointmentId)
    : config.existingAppointments;

  const check = checkSlotAvailability({ ...config, existingAppointments, time });

  if (!check.available) {
    return {
      ok: false,
      status: 409,
      code: 'SLOT_UNAVAILABLE',
      reason: check.reason || 'Orario non disponibile',
    };
  }

  // Resolve the staff member to assign.
  const realStaff = check.availableStaffIds.filter(id => id !== '__any__');
  let resolvedStaffId: string | null;
  if (staffId) {
    // checkSlotAvailability already proved this specific staff is available.
    resolvedStaffId = staffId;
  } else if (realStaff.length > 0) {
    resolvedStaffId = realStaff[0];
  } else if (config.staffConfig && config.staffConfig.allStaffIds.length === 0) {
    // Business has no staff configured at all → appointment without staff.
    resolvedStaffId = null;
  } else {
    return { ok: false, status: 409, code: 'NO_STAFF', reason: 'Nessuno staff disponibile' };
  }

  const startTime = parseAsRomeTime(date, time);
  if (isNaN(startTime.getTime())) {
    return { ok: false, status: 400, code: 'BAD_TIME', reason: 'Data o orario non valido' };
  }

  // Customer booking window: not in the past, and within the business's min/max
  // advance settings. The gestore is exempt (can book anytime / backfill walk-ins).
  if (onlineOnly) {
    const nowMs = Date.now();
    const t = startTime.getTime();
    if (t < nowMs) {
      return { ok: false, status: 409, code: 'PAST_SLOT', reason: 'Questo orario è già passato' };
    }
    const { earliest, latest } = customerBookingWindow(
      business.advanceMinHours,
      business.advanceMaxDays,
      nowMs,
    );
    if (t < earliest) {
      const h = business.advanceMinHours;
      return { ok: false, status: 409, code: 'TOO_SOON', reason: `Devi prenotare con almeno ${h} ${h === 1 ? 'ora' : 'ore'} di anticipo` };
    }
    if (t > latest) {
      return { ok: false, status: 409, code: 'TOO_FAR', reason: `Puoi prenotare al massimo ${business.advanceMaxDays} giorni in anticipo` };
    }
  }

  const endTime = new Date(startTime.getTime() + service.duration_minutes * 60000);

  return {
    ok: true,
    resolvedStaffId,
    service,
    bufferMinutes: business.bufferMinutes,
    startTime,
    endTime,
  };
}
