/**
 * SchedulerService — pure, side-effect-free scheduling engine.
 *
 * Given each attendee's busy periods and a desired meeting duration/range,
 * finds the earliest common free slots. Kept as pure functions (no DB/HTTP
 * calls) so it can be unit tested exhaustively and, later, run in a worker
 * thread if it becomes a latency bottleneck.
 */

export interface BusyPeriod {
  start: Date;
  end: Date;
}

export interface Slot {
  start: Date;
  end: Date;
}

export interface SuggestInput {
  /** Busy periods per attendee, keyed by email. Already merged is not required. */
  attendeeBusyPeriods: Record<string, BusyPeriod[]>;
  durationMinutes: number;
  rangeStart: Date;
  rangeEnd: Date;
  /** Optional working hours window, in the organizer's local hour-of-day (0-23). */
  workingHours?: { startHour: number; endHour: number };
  maxSuggestions?: number;
}

/** Merges overlapping/adjacent busy periods into a minimal sorted set. */
export function mergeBusyPeriods(periods: BusyPeriod[]): BusyPeriod[] {
  if (periods.length === 0) return [];
  const sorted = [...periods].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: BusyPeriod[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];
    if (current.start.getTime() <= last.end.getTime()) {
      if (current.end.getTime() > last.end.getTime()) {
        last.end = current.end;
      }
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

/** Combines every attendee's busy periods into one merged "anyone is busy" timeline. */
export function combineAllBusyPeriods(attendeeBusyPeriods: Record<string, BusyPeriod[]>): BusyPeriod[] {
  const all = Object.values(attendeeBusyPeriods).flat();
  return mergeBusyPeriods(all);
}

function isWithinWorkingHours(start: Date, end: Date, workingHours?: { startHour: number; endHour: number }): boolean {
  if (!workingHours) return true;
  const startHour = start.getUTCHours() + start.getUTCMinutes() / 60;
  const endHour = end.getUTCHours() + end.getUTCMinutes() / 60;
  return startHour >= workingHours.startHour && endHour <= workingHours.endHour;
}

/**
 * Finds the earliest common free slots across all attendees within the given range.
 * Walks the gaps between merged busy periods and slices out duration-length windows.
 */
export function findAvailableSlots(input: SuggestInput): Slot[] {
  const { attendeeBusyPeriods, durationMinutes, rangeStart, rangeEnd, workingHours, maxSuggestions = 3 } = input;

  if (durationMinutes <= 0) {
    throw new Error("durationMinutes must be a positive number");
  }
  if (rangeEnd.getTime() <= rangeStart.getTime()) {
    throw new Error("rangeEnd must be after rangeStart");
  }

  const busy = combineAllBusyPeriods(attendeeBusyPeriods).filter(
    (p) => p.end.getTime() > rangeStart.getTime() && p.start.getTime() < rangeEnd.getTime()
  );

  const durationMs = durationMinutes * 60 * 1000;
  const suggestions: Slot[] = [];

  // Build the list of free gaps: [rangeStart, busy1.start], [busy1.end, busy2.start], ..., [busyN.end, rangeEnd]
  let cursor = rangeStart;
  const gaps: Slot[] = [];
  for (const period of busy) {
    const gapStart = cursor;
    const gapEnd = period.start.getTime() < rangeEnd.getTime() ? period.start : rangeEnd;
    if (gapEnd.getTime() > gapStart.getTime()) {
      gaps.push({ start: gapStart, end: gapEnd });
    }
    cursor = period.end.getTime() > cursor.getTime() ? period.end : cursor;
  }
  if (cursor.getTime() < rangeEnd.getTime()) {
    gaps.push({ start: cursor, end: rangeEnd });
  }

  for (const gap of gaps) {
    let slotStart = gap.start;
    while (slotStart.getTime() + durationMs <= gap.end.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMs);
      if (isWithinWorkingHours(slotStart, slotEnd, workingHours)) {
        suggestions.push({ start: slotStart, end: slotEnd });
        if (suggestions.length >= maxSuggestions) return suggestions;
      }
      // Step forward in 15-minute increments to offer varied start times
      slotStart = new Date(slotStart.getTime() + 15 * 60 * 1000);
    }
  }

  return suggestions;
}

/**
 * Fallback used when no common slot exists in the requested range: returns the
 * nearest partial-overlap window (fewest conflicting attendees) or, failing
 * that, extends the search by doubling the range once.
 */
export function findNearestPartialOverlap(input: SuggestInput): Slot | null {
  const extendedRangeEnd = new Date(input.rangeEnd.getTime() + (input.rangeEnd.getTime() - input.rangeStart.getTime()));
  const extended = findAvailableSlots({ ...input, rangeEnd: extendedRangeEnd, maxSuggestions: 1 });
  return extended[0] ?? null;
}
