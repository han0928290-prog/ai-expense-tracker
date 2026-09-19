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
