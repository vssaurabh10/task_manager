export function formatDate(value?: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function label(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
}

export function isOverdue(date: string, status?: string) {
  return status !== "DONE" && new Date(date).getTime() < Date.now();
}
