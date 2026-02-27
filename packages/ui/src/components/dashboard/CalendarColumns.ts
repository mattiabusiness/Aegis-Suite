// ============================================================================
// AEGIS SUITE - CALENDAR COLUMN COMPUTATION
// File: packages/ui/src/components/dashboard/CalendarColumns.ts
//
// Computes column layout for overlapping calendar events.
// Given a list of events, assigns each a column index and total columns
// so they render side-by-side without visual overlap.
// ============================================================================

// ============================================================================
// HELPERS
// ============================================================================

function rangesOverlap(
  startA: number, endA: number,
  startB: number, endB: number,
): boolean {
  return startA < endB && startB < endA;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Compute column layout for overlapping calendar events.
 *
 * @param events — Array of events with startTime and endTime (Date or string)
 * @returns Same events augmented with `column` (0-based) and `totalColumns`
 *
 * Example: 3 overlapping events → each gets column 0, 1, 2 with totalColumns = 3
 * Example: 2 events that don't overlap → each gets column 0 with totalColumns = 1
 */
export function computeEventColumns<T extends { startTime: Date | string; endTime: Date | string }>(
  events: T[],
): Array<T & { column: number; totalColumns: number }> {
  if (events.length === 0) return [];
  if (events.length === 1) {
    return [{ ...events[0], column: 0, totalColumns: 1 }];
  }

  // Convert to sortable format with minute values
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

  // Sort by start time, then by duration (longer first for better visual layout)
  items.sort((a, b) => a._startMin - b._startMin || (b._endMin - b._startMin) - (a._endMin - a._startMin));

  // Greedy column assignment
  // columns[i] = end time of the last event placed in column i
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

  // Determine totalColumns for each overlap group
  // An overlap group is a set of events where each event overlaps with at least one other
  // We use a sweep to find connected groups

  for (const item of items) {
    // Find all items that overlap with this one
    const overlapping = items.filter(other =>
      rangesOverlap(item._startMin, item._endMin, other._startMin, other._endMin)
    );
    const maxCol = Math.max(...overlapping.map(o => o.column)) + 1;

    // Set totalColumns for all events in this overlap group
    for (const o of overlapping) {
      o.totalColumns = Math.max(o.totalColumns, maxCol);
    }
  }

  // Return without internal fields
  return items.map(({ _startMin, _endMin, ...rest }) => rest as T & { column: number; totalColumns: number });
}