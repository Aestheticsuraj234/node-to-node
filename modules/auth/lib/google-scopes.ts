export const GOOGLE_CALENDAR_EVENTS_SCOPE =
  "https://www.googleapis.com/auth/calendar.events";

export const GOOGLE_CALENDAR_FULL_SCOPE =
  "https://www.googleapis.com/auth/calendar";

export function hasGoogleCalendarScope(scope?: string | null) {
  if (!scope) return false;

  const parts = scope.split(/[,\s]+/).filter(Boolean);
  return parts.some(
    (item) =>
      item === GOOGLE_CALENDAR_EVENTS_SCOPE || item === GOOGLE_CALENDAR_FULL_SCOPE,
  );
}
