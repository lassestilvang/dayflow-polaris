export function startOfWeek(date: Date, weekStartsOn: 1 | 0 = 1): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = weekStartsOn === 1
    ? (day === 0 ? -6 : 1 - day)
    : -day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

export function endOfWeek(date: Date, weekStartsOn: 1 | 0 = 1): Date {
  const start = startOfWeek(date, weekStartsOn);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}

export function getWeekId(date: Date): string {
  const year = date.getUTCFullYear();
  const oneJan = new Date(Date.UTC(year, 0, 1));
  const msInDay = 24 * 60 * 60 * 1000;
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(oneJan.getUTCFullYear(), oneJan.getUTCMonth(), oneJan.getUTCDate())) /
      msInDay
  ) + 1;

  const week = Math.ceil(dayOfYear / 7);
  const weekStr = String(week).padStart(2, "0");
  return `${year}-W${weekStr}`;
}

export function getWeekRangeFromWeekId(
  weekId: string
): { start: Date; end: Date } {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekId);
  if (!match) {
    const now = new Date();
    return {
      start: startOfWeek(now),
      end: endOfWeek(now)
    };
  }

  const [, yearStr, weekStr] = match;
  const year = Number(yearStr);
  const week = Number(weekStr);

  if (!Number.isFinite(year) || !Number.isFinite(week) || week < 1 || week > 53) {
    const now = new Date();
    return {
      start: startOfWeek(now),
      end: endOfWeek(now)
    };
  }

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const start = new Date(week1Start);
  start.setUTCDate(week1Start.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end };
}

export function getDayHours(): number[] {
  const hours: number[] = [];
  for (let h = 0; h < 24; h += 1) {
    hours.push(h);
  }
  return hours;
}