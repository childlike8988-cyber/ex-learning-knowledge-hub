export type CalendarQuarter = 1 | 2 | 3 | 4;

export function getCalendarQuarter(date: Date): CalendarQuarter {
  return (Math.floor(date.getMonth() / 3) + 1) as CalendarQuarter;
}

export function getQuarterKey(date: Date): string {
  return `${date.getFullYear()}-Q${getCalendarQuarter(date)}`;
}

export function getQuarterBounds(date: Date): { quarterKey: string; start: string; end: string } {
  const quarter = getCalendarQuarter(date);
  const year = date.getFullYear();
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  const format = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  return { quarterKey: getQuarterKey(date), start: format(start), end: format(end) };
}
