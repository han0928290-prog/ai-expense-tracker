export function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toMonthKey(d: Date): string {
  return toDateKey(d).slice(0, 7);
}

export function formatShortDate(dateKey: string): string {
  const [, m, d] = dateKey.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const datePart = `${d.getMonth() + 1}月${d.getDate()}日`;
  const timePart = d.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart} ${timePart}`;
}

export function wasEdited(createdAt?: string, updatedAt?: string): boolean {
  return Boolean(createdAt && updatedAt && createdAt !== updatedAt);
}

// A project only counts expenses inside its own period — narrow any queried
// [start, end] range (inclusive, YYYY-MM-DD strings) down to that period.
export function clampToProject(
  start: string,
  end: string,
  project?: { startDate?: string; endDate?: string } | null
): { start: string; end: string } {
  let lo = start;
  let hi = end;
  if (project?.startDate && lo < project.startDate) lo = project.startDate;
  if (project?.endDate && hi > project.endDate) hi = project.endDate;
  return { start: lo, end: hi };
}
