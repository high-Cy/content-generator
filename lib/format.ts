// Shared display formatters. Timestamps are stored as UTC timestamptz; render them
// in AEST so the UI matches the owner's local time regardless of server timezone.

export const formatDateTime = (date: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  }).format(date);
