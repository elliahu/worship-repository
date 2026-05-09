export function getNextSundayRange(now = new Date()) {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const day = date.getUTCDay(); // 0 = Sunday

  // If Sunday → 0 days ahead
  // Else → days until next Sunday
  const daysUntilSunday = day === 0 ? 0 : 7 - day;

  const start = new Date(date);
  start.setUTCDate(start.getUTCDate() + daysUntilSunday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1); // next day

  return { start, end };
}

export function isInRange(iso: string, start: Date, end: Date) {
  const d = new Date(iso);
  return d >= start && d < end;
}
