import { differenceInCalendarDays } from 'date-fns';

import { fDate } from 'src/utils/format-time';

import { LabelColor } from 'src/components/label';

import { ICampaignItem, ICampaignStatus } from 'src/types/campaign';

// ----------------------------------------------------------------------

export const CAMPAIGN_STATUS: Record<ICampaignStatus, { label: string; color: LabelColor }> = {
  active: { label: 'Actief', color: 'success' },
  scheduled: { label: 'Gepland', color: 'info' },
  expired: { label: 'Verlopen', color: 'warning' },
  off: { label: 'Uit', color: 'default' },
};

export const CAMPAIGN_STATUS_ORDER: ICampaignStatus[] = ['active', 'scheduled', 'expired', 'off'];

// Same rule as the API (Campaign.status), for the form's live status.
export function campaignStatus(
  isActive: boolean,
  start: Date | null,
  end: Date | null,
  now = new Date()
): ICampaignStatus {
  if (!isActive) return 'off';
  if (end && end < now) return 'expired';
  if (start && start > now) return 'scheduled';
  return 'active';
}

const days = (count: number) => (count === 1 ? '1 dag' : `${count} dagen`);

export function campaignPeriod(row: Pick<ICampaignItem, 'start_date' | 'end_date'>) {
  const start = fDate(row.start_date, 'dd MMM yyyy');
  return row.end_date ? `${start} – ${fDate(row.end_date, 'dd MMM yyyy')}` : `Vanaf ${start}`;
}

export function campaignPeriodHint(row: Pick<ICampaignItem, 'start_date' | 'end_date'>) {
  const now = new Date();
  const start = new Date(row.start_date);
  const end = row.end_date ? new Date(row.end_date) : null;

  if (end && end < now) return `${days(differenceInCalendarDays(now, end))} geleden verlopen`;
  if (start > now) {
    const until = differenceInCalendarDays(start, now);
    return until === 0 ? 'Start vandaag' : `Start over ${days(until)}`;
  }
  if (!end) return 'Geen einddatum';
  const left = differenceInCalendarDays(end, now);
  return left === 0 ? 'Eindigt vandaag' : `Nog ${days(left)}`;
}

// Mirrors the storefront hero: with three or more running campaigns the last two
// are the side banners, the others rotate in the carousel.
export function heroSlots(liveIds: number[]) {
  const slots: Record<number, string> = {};
  const sideFrom = liveIds.length >= 3 ? liveIds.length - 2 : liveIds.length;
  liveIds.forEach((id, index) => {
    slots[id] = index < sideFrom ? `Carousel ${index + 1}` : `Zijbanner ${index - sideFrom + 1}`;
  });
  return slots;
}

export const discountLabel = (value: ICampaignItem['discount_percentage']) => {
  const number = Number(value);
  return number > 0 ? `${number}%` : null;
};
