import { format, getTime, formatDistanceToNow, parseISO } from 'date-fns';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy';

  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, fm);
}

export function fTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'p';

  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, fm);
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(dateObj, fm);
}

export function fTimestamp(date: InputValue) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return getTime(dateObj);
}

export function fToNow(date: InputValue) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
  });
}

export function isBetween(inputDate: Date | string | number, startDate: Date, endDate: Date) {
  const dateObj = typeof inputDate === 'string' ? parseISO(inputDate) : new Date(inputDate);

  const results =
    new Date(dateObj.toDateString()) >= new Date(startDate.toDateString()) &&
    new Date(dateObj.toDateString()) <= new Date(endDate.toDateString());

  return results;
}

export function isAfter(startDate: Date | null, endDate: Date | null) {
  if (!startDate || !endDate) return false;

  const startDateObj = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
  const endDateObj = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);

  return startDateObj.getTime() > endDateObj.getTime();
}
