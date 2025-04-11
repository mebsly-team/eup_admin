import { getYear, isSameDay, isSameMonth, parseISO } from 'date-fns';

import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function shortDateLabel(startDate: Date | string | null, endDate: Date | string | null) {
  const getCurrentYear = new Date().getFullYear();

  const startDateObj = startDate ? (typeof startDate === 'string' ? parseISO(startDate) : startDate) : null;
  const endDateObj = endDate ? (typeof endDate === 'string' ? parseISO(endDate) : endDate) : null;

  const startDateYear = startDateObj ? getYear(startDateObj) : null;
  const endDateYear = endDateObj ? getYear(endDateObj) : null;

  const currentYear = getCurrentYear === startDateYear && getCurrentYear === endDateYear;

  const sameDay = startDateObj && endDateObj ? isSameDay(startDateObj, endDateObj) : false;

  const sameMonth = startDateObj && endDateObj ? isSameMonth(startDateObj, endDateObj) : false;

  if (currentYear) {
    if (sameMonth) {
      if (sameDay) {
        return fDate(endDate, 'dd MMM yy');
      }
      return `${fDate(startDate, 'dd')} - ${fDate(endDate, 'dd MMM yy')}`;
    }
    return `${fDate(startDate, 'dd MMM')} - ${fDate(endDate, 'dd MMM yy')}`;
  }

  return `${fDate(startDate, 'dd MMM yy')} - ${fDate(endDate, 'dd MMM yy')}`;
}
