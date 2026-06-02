// ============================================================================
// AEGIS SUITE - AVAILABILITY ENGINE (v2 — with fallbacks)
// File: packages/core/src/lib/availability.ts
//
// Pure availability logic — no DB calls, no side effects.
// Works for ALL verticals (beauty, sport, health, etc.)
//
// FALLBACKS (critical for real-world usage):
//   - Staff without staff_hours → uses business hours
//   - Staff without staff_services mapping → can do ALL services
//   - No staff configured at all → ignore staff constraints entirely
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface DayHours {
  dayOfWeek: string;
  isOpen: boolean;
  openTime1: string | null;
  closeTime1: string | null;
  openTime2: string | null;
  closeTime2: string | null;
}

export interface StaffDayHours {
  staffId: string;
  dayOfWeek: string;
  isWorking: boolean;
  startTime1: string | null;
  endTime1: string | null;
  startTime2: string | null;
  endTime2: string | null;
}

export interface ExistingAppointment {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface ClosureInfo {
  date: string;
  reason?: string;
}

export interface StaffTimeOff {
  staffId: string;
  startDate: string;
  endDate: string;
  isFullDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface AvailabilityConfig {
  date: string;
  serviceDurationMinutes: number;
  businessHours: DayHours[];
  workstations: number;
  existingAppointments: ExistingAppointment[];
  closures: ClosureInfo[];
  slotInterval?: number;
  bufferMinutes?: number;
  staffConfig?: {
    /** All active staff IDs for this business */
    allStaffIds: string[];
    /** Custom staff hours (may be empty — staff without entries follow business hours) */
    staffHours: StaffDayHours[];
    /** Specific staff ID to filter (null = any available) */
    specificStaffId: string | null;
    staffTimeOff?: StaffTimeOff[];
    /** Map staffId -> serviceIds. Empty map or missing staff = can do ALL services */
    staffServices?: Record<string, string[]>;
    serviceId?: string;
  };
}

export interface AvailableSlot {
  time: string;
  endTime: string;
  availableStaffIds: string[];
  freeWorkstations: number;
  totalWorkstations: number;
  isDuringBreak: boolean;
}

export interface SlotCheckResult {
  available: boolean;
  reason?: string;
  availableStaffIds: string[];
  freeWorkstations: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Statuses that occupy a staff member / workstation.
 * Single source of truth shared by the availability engine, the server-side
 * validator (booking-validation.ts) and the booking RPC. Keep them in sync.
 */
export const BUSY_STATUSES = ['confirmed', 'pending', 'in_progress'] as const;
const ACTIVE_STATUSES: readonly string[] = BUSY_STATUSES;
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// ============================================================================
// HELPERS
// ============================================================================

export function timeToMinutes(time: string | null): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return DAY_NAMES[date.getDay()];
}

function extractTime(timeStr: string): string {
  if (timeStr.includes('T')) {
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return timeStr;
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

/**
 * Get working time ranges from hours config.
 * Returns array of [startMin, endMin] for each working period.
 */
function getWorkingRanges(hours: {
  isOpen?: boolean;
  isWorking?: boolean;
  openTime1?: string | null;
  closeTime1?: string | null;
  openTime2?: string | null;
  closeTime2?: string | null;
  startTime1?: string | null;
  endTime1?: string | null;
  startTime2?: string | null;
  endTime2?: string | null;
}): [number, number][] {
  const isActive = hours.isOpen ?? hours.isWorking ?? false;
  if (!isActive) return [];

  const ranges: [number, number][] = [];
  const open1 = hours.openTime1 ?? hours.startTime1;
  const close1 = hours.closeTime1 ?? hours.endTime1;
  const open2 = hours.openTime2 ?? hours.startTime2;
  const close2 = hours.closeTime2 ?? hours.endTime2;

  if (open2 && close2) {
    if (open1 && close1) ranges.push([timeToMinutes(open1), timeToMinutes(close1)]);
    ranges.push([timeToMinutes(open2), timeToMinutes(close2)]);
  } else if (open1 && close1) {
    ranges.push([timeToMinutes(open1), timeToMinutes(close1)]);
  } else if (open1 && close2) {
    ranges.push([timeToMinutes(open1), timeToMinutes(close2)]);
  }

  return ranges;
}

function isTimeInRanges(timeMinutes: number, endMinutes: number, ranges: [number, number][]): boolean {
  return ranges.some(([start, end]) => timeMinutes >= start && endMinutes <= end);
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

export function isDateClosed(config: Pick<AvailabilityConfig, 'date' | 'businessHours' | 'closures'>): {
  closed: boolean;
  reason?: string;
} {
  const { date, businessHours, closures } = config;

  const closure = closures.find(c => c.date === date);
  if (closure) return { closed: true, reason: closure.reason || 'Chiusura straordinaria' };

  const dayName = getDayName(date);
  const dayHours = businessHours.find(bh => bh.dayOfWeek === dayName);
  if (!dayHours || !dayHours.isOpen) return { closed: true, reason: 'Giorno di chiusura' };

  return { closed: false };
}

function getActiveAppointments(
  existingAppointments: ExistingAppointment[],
): Array<{ staffId: string; startMin: number; endMin: number }> {
  return existingAppointments
    .filter(a => ACTIVE_STATUSES.includes(a.status))
    .map(a => ({
      staffId: a.staffId,
      startMin: timeToMinutes(extractTime(a.startTime)),
      endMin: timeToMinutes(extractTime(a.endTime)),
    }));
}

export function getOccupiedWorkstations(
  slotStart: number,
  slotEnd: number,
  activeAppointments: Array<{ startMin: number; endMin: number }>,
  bufferMinutes = 0,
): number {
  // Consecutive appointments on the same chair need a `bufferMinutes` gap
  // (cleanup/turnaround). Treat each occupied range as extended by the buffer.
  return activeAppointments.filter(
    a => slotStart < a.endMin + bufferMinutes && a.startMin < slotEnd + bufferMinutes
  ).length;
}

function isStaffFree(
  staffId: string,
  slotStart: number,
  slotEnd: number,
  activeAppointments: Array<{ staffId: string; startMin: number; endMin: number }>,
  bufferMinutes = 0,
): boolean {
  return !activeAppointments.some(
    a => a.staffId === staffId &&
      slotStart < a.endMin + bufferMinutes && a.startMin < slotEnd + bufferMinutes
  );
}

function isStaffOnTimeOff(
  staffId: string,
  date: string,
  slotStartMin: number,
  slotEndMin: number,
  timeOffs: StaffTimeOff[] | undefined,
): boolean {
  if (!timeOffs) return false;
  return timeOffs.some(to => {
    if (to.staffId !== staffId) return false;
    if (date < to.startDate || date > to.endDate) return false;
    if (to.isFullDay) return true;
    if (to.startTime && to.endTime) {
      return rangesOverlap(slotStartMin, slotEndMin, timeToMinutes(to.startTime), timeToMinutes(to.endTime));
    }
    return true;
  });
}

/**
 * Get available staff for a specific time slot.
 *
 * FALLBACK LOGIC:
 * 1. If no staffConfig at all → return ['__any__'] (no staff constraint)
 * 2. If no allStaffIds → return ['__any__']
 * 3. For each staff member:
 *    a. Check if they have custom staff_hours for this day
 *       - YES → use their custom hours
 *       - NO → FALLBACK: use business hours (they follow the salon schedule)
 *    b. Check if staffServices mapping exists for this staff
 *       - YES and has entries → check if serviceId is in their list
 *       - NO or empty → FALLBACK: they can do ALL services
 *    c. Check they're not already booked
 *    d. Check they're not on time off
 */
function getAvailableStaffForSlot(
  date: string,
  slotStart: number,
  slotEnd: number,
  activeAppointments: Array<{ staffId: string; startMin: number; endMin: number }>,
  businessHoursForDay: [number, number][], // business working ranges for this day
  staffConfig?: AvailabilityConfig['staffConfig'],
  bufferMinutes = 0,
): string[] {
  // No staff config at all → no constraint
  if (!staffConfig) return ['__any__'];

  const { allStaffIds, staffHours, specificStaffId, staffTimeOff, staffServices, serviceId } = staffConfig;

  // No staff registered → no constraint
  if (!allStaffIds || allStaffIds.length === 0) return ['__any__'];

  const dayName = getDayName(date);

  // Start with all active staff (or specific one)
  let candidates = specificStaffId
    ? allStaffIds.filter(id => id === specificStaffId)
    : [...allStaffIds];

  // Filter by service capability (with fallback)
  if (staffServices && serviceId) {
    // Check if ANY staff has mappings at all
    const anyStaffHasMappings = Object.keys(staffServices).length > 0;

    if (anyStaffHasMappings) {
      candidates = candidates.filter(id => {
        const services = staffServices[id];
        // FALLBACK: if this staff has NO mappings at all, they can do everything
        if (!services || services.length === 0) return true;
        // If they have mappings, check if our service is included
        return services.includes(serviceId);
      });
    }
    // If no staff has any mappings → everyone can do everything (skip filter)
  }

  // Filter by working hours + free time + time off
  return candidates.filter(staffId => {
    // Get this staff's working ranges for today
    let workingRanges: [number, number][];

    // Check if staff has CUSTOM hours for this day
    const customHours = staffHours.find(h =>
      h.staffId === staffId &&
      h.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    if (customHours) {
      // Staff has custom hours → use them
      if (!customHours.isWorking) return false; // explicitly marked as not working
      workingRanges = getWorkingRanges(customHours);
    } else {
      // FALLBACK: no custom hours → staff follows business hours
      workingRanges = businessHoursForDay;
    }

    // Check if slot fits within working ranges
    if (workingRanges.length === 0) return false;
    if (!isTimeInRanges(slotStart, slotEnd, workingRanges)) return false;

    // Check time off
    if (isStaffOnTimeOff(staffId, date, slotStart, slotEnd, staffTimeOff)) return false;

    // Check not already booked (buffer enforces spacing between appointments)
    if (!isStaffFree(staffId, slotStart, slotEnd, activeAppointments, bufferMinutes)) return false;

    return true;
  });
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Get all available time slots for a given date.
 */
export function getAvailableSlots(config: AvailabilityConfig): AvailableSlot[] {
  const {
    date,
    serviceDurationMinutes,
    businessHours,
    workstations,
    existingAppointments,
    closures,
    slotInterval = 15,
    bufferMinutes = 0,
    staffConfig,
  } = config;

  // 1. Date closed?
  const closedCheck = isDateClosed({ date, businessHours, closures });
  if (closedCheck.closed) return [];

  // 2. Business hours for this day
  const dayName = getDayName(date);
  const dayHours = businessHours.find(bh => bh.dayOfWeek === dayName);
  if (!dayHours || !dayHours.isOpen) return [];

  const businessRanges = getWorkingRanges(dayHours);
  if (businessRanges.length === 0) return [];

  const activeAppts = getActiveAppointments(existingAppointments);

  // Break range for UI
  let breakStart = -1;
  let breakEnd = -1;
  if (businessRanges.length === 2) {
    breakStart = businessRanges[0][1];
    breakEnd = businessRanges[1][0];
  }

  // 3. Generate slots
  const slots: AvailableSlot[] = [];
  const globalStart = businessRanges[0][0];
  const globalEnd = businessRanges[businessRanges.length - 1][1];

  for (let slotStart = globalStart; slotStart < globalEnd; slotStart += slotInterval) {
    const serviceEnd = slotStart + serviceDurationMinutes;

    // The appointment itself must fit within a working range
    // (the cleanup buffer may extend past closing time — that's fine).
    if (!isTimeInRanges(slotStart, serviceEnd, businessRanges)) continue;

    // Workstations check (buffer enforces spacing between consecutive appointments)
    const occupied = getOccupiedWorkstations(slotStart, serviceEnd, activeAppts, bufferMinutes);
    const freeWorkstations = workstations - occupied;
    if (freeWorkstations <= 0) continue;

    // Staff check (with fallbacks)
    const availableStaff = getAvailableStaffForSlot(
      date, slotStart, serviceEnd, activeAppts, businessRanges, staffConfig, bufferMinutes
    );
    if (availableStaff.length === 0) continue;

    const isDuringBreak = breakStart >= 0 && rangesOverlap(slotStart, serviceEnd, breakStart, breakEnd);

    slots.push({
      time: minutesToTime(slotStart),
      endTime: minutesToTime(serviceEnd),
      availableStaffIds: availableStaff,
      freeWorkstations,
      totalWorkstations: workstations,
      isDuringBreak,
    });
  }

  return slots;
}

/**
 * Check if a SPECIFIC slot is available (validation before booking).
 */
export function checkSlotAvailability(
  config: AvailabilityConfig & { time: string },
): SlotCheckResult {
  const { date, time, serviceDurationMinutes, businessHours, workstations,
          existingAppointments, closures, bufferMinutes = 0, staffConfig } = config;

  const closedCheck = isDateClosed({ date, businessHours, closures });
  if (closedCheck.closed) {
    return { available: false, reason: closedCheck.reason, availableStaffIds: [], freeWorkstations: 0 };
  }

  const dayName = getDayName(date);
  const dayHours = businessHours.find(bh => bh.dayOfWeek === dayName);
  if (!dayHours || !dayHours.isOpen) {
    return { available: false, reason: 'Giorno di chiusura', availableStaffIds: [], freeWorkstations: 0 };
  }

  const businessRanges = getWorkingRanges(dayHours);
  const slotStart = timeToMinutes(time);
  const serviceEnd = slotStart + serviceDurationMinutes;

  // The appointment itself must fit within working hours (buffer may run past close).
  if (!isTimeInRanges(slotStart, serviceEnd, businessRanges)) {
    return { available: false, reason: 'Fuori orario di apertura', availableStaffIds: [], freeWorkstations: 0 };
  }

  const activeAppts = getActiveAppointments(existingAppointments);
  const occupied = getOccupiedWorkstations(slotStart, serviceEnd, activeAppts, bufferMinutes);
  const freeWorkstations = workstations - occupied;
  if (freeWorkstations <= 0) {
    return { available: false, reason: 'Tutte le postazioni occupate', availableStaffIds: [], freeWorkstations: 0 };
  }

  const availableStaff = getAvailableStaffForSlot(
    date, slotStart, serviceEnd, activeAppts, businessRanges, staffConfig, bufferMinutes
  );
  if (availableStaff.length === 0) {
    const reason = staffConfig?.specificStaffId
      ? 'Operatore non disponibile in questo orario'
      : 'Nessun operatore disponibile';
    return { available: false, reason, availableStaffIds: [], freeWorkstations };
  }

  return { available: true, availableStaffIds: availableStaff, freeWorkstations };
}

/**
 * Get workstation usage for a full day (calendar heatmap).
 */
export function getDayOccupancy(
  date: string,
  businessHours: DayHours[],
  existingAppointments: ExistingAppointment[],
  workstations: number,
  interval: number = 15,
): Array<{ time: string; occupied: number; total: number; percentage: number }> {
  const dayName = getDayName(date);
  const dayHours = businessHours.find(bh => bh.dayOfWeek === dayName);
  if (!dayHours || !dayHours.isOpen) return [];

  const ranges = getWorkingRanges(dayHours);
  if (ranges.length === 0) return [];

  const activeAppts = getActiveAppointments(existingAppointments);
  const result: Array<{ time: string; occupied: number; total: number; percentage: number }> = [];

  const globalStart = ranges[0][0];
  const globalEnd = ranges[ranges.length - 1][1];

  for (let t = globalStart; t < globalEnd; t += interval) {
    const occupied = getOccupiedWorkstations(t, t + interval, activeAppts);
    result.push({
      time: minutesToTime(t),
      occupied,
      total: workstations,
      percentage: Math.round((occupied / workstations) * 100),
    });
  }

  return result;
}

/**
 * Compute column layout for overlapping calendar events.
 */
export function computeEventColumns<T extends { startTime: Date | string; endTime: Date | string }>(
  events: T[],
): Array<T & { column: number; totalColumns: number }> {
  if (events.length === 0) return [];
  if (events.length === 1) return [{ ...events[0], column: 0, totalColumns: 1 }];

  const items = events.map(e => {
    const startDate = new Date(e.startTime);
    const endDate = new Date(e.endTime);
    return {
      ...e,
      _startMin: startDate.getHours() * 60 + startDate.getMinutes(),
      _endMin: endDate.getHours() * 60 + endDate.getMinutes(),
      column: 0,
      totalColumns: 1,
    };
  });

  items.sort((a, b) => a._startMin - b._startMin || (b._endMin - b._startMin) - (a._endMin - a._startMin));

  const columnEnds: number[] = [];
  for (const item of items) {
    let placed = false;
    for (let col = 0; col < columnEnds.length; col++) {
      if (item._startMin >= columnEnds[col]) {
        item.column = col;
        columnEnds[col] = item._endMin;
        placed = true;
        break;
      }
    }
    if (!placed) {
      item.column = columnEnds.length;
      columnEnds.push(item._endMin);
    }
  }

  for (const item of items) {
    const overlapping = items.filter(other =>
      rangesOverlap(item._startMin, item._endMin, other._startMin, other._endMin)
    );
    const maxCol = Math.max(...overlapping.map(o => o.column)) + 1;
    for (const o of overlapping) {
      o.totalColumns = Math.max(o.totalColumns, maxCol);
    }
  }

  return items.map(({ _startMin, _endMin, ...rest }) => rest as T & { column: number; totalColumns: number });
}