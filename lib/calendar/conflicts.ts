export type TimeRange = {
  start: Date;
  end: Date;
};

/**
 * Normalize a time range to ensure start <= end and strip sub-ms noise.
 */
function normalizeRange(range: TimeRange): TimeRange {
  const start = new Date(range.start);
  const end = new Date(range.end);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date in TimeRange");
  }
  if (end < start) {
    throw new Error("TimeRange end must be after start");
  }
  return { start, end };
}

/**
 * Checks whether two ranges overlap using [start, end) semantics.
 */
function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Returns true if the given range conflicts with any existing ranges.
 * Uses [start, end) semantics for scheduling.
 */
export function hasConflict(range: TimeRange, existing: TimeRange[]): boolean {
  const normalized = normalizeRange(range);
  for (const r of existing) {
    const n = normalizeRange(r);
    if (overlaps(normalized, n)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the list of existing ranges that conflict with the given range.
 * Uses [start, end) semantics for scheduling.
 */
export function findConflicts(
  range: TimeRange,
  existing: TimeRange[]
): TimeRange[] {
  const normalized = normalizeRange(range);
  const conflicts: TimeRange[] = [];
  for (const r of existing) {
    const n = normalizeRange(r);
    if (overlaps(normalized, n)) {
      conflicts.push(n);
    }
  }
  return conflicts;
}