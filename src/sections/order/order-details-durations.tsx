import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  currentOrder: any;
};

// History events are free text written by the admin. Status names go through
// t(), so match both the Dutch label and the untranslated key.
const WERKBON_EVENTS = ['Status gewijzigd in Orderpicker', 'Status gewijzigd in werkbon'];
const INVOICE_EVENTS = ['Invoice gedownload'];
// Downloading the invoice also sets the status to confirmed (without a status event).
const CONFIRMED_EVENTS = [
  'Status gewijzigd in Bevestigd',
  'Status gewijzigd in confirmed',
  ...INVOICE_EVENTS,
];

function firstEventDate(history: any[], needles: string[]): Date | null {
  const dates = history
    .filter((item) => typeof item?.event === 'string' && needles.some((n) => item.event.includes(n)))
    .map((item) => new Date(item.date))
    .filter((date) => !Number.isNaN(date.getTime()));
  return dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
}

export function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days) return `${days} d ${hours} u`;
  if (hours) return `${hours} u ${mins} min`;
  return `${mins} min`;
}

type RowProps = {
  label: string;
  fromLabel: string;
  toLabel: string;
  from: Date | null;
  to: Date | null;
  missing: string;
};

function DurationRow({ label, fromLabel, toLabel, from, to, missing }: RowProps) {
  const done = from && to && to >= from;

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography
          variant="subtitle1"
          sx={{ whiteSpace: 'nowrap', color: done ? 'text.primary' : 'text.disabled' }}
        >
          {done ? formatDuration(to.getTime() - from.getTime()) : '—'}
        </Typography>
      </Stack>

      <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
        {fromLabel}: {from ? fDateTime(from) : '—'}
        <br />
        {toLabel}: {to ? fDateTime(to) : missing}
      </Box>
    </Stack>
  );
}

export default function OrderDetailsDurations({ currentOrder }: Props) {
  const history: any[] = Array.isArray(currentOrder?.history) ? currentOrder.history : [];

  const orderedAt = currentOrder?.ordered_date ? new Date(currentOrder.ordered_date) : null;
  const confirmedAt = firstEventDate(history, CONFIRMED_EVENTS);
  const werkbonAt = firstEventDate(history, WERKBON_EVENTS);
  const invoiceAt = firstEventDate(history, INVOICE_EVENTS);

  return (
    <Card>
      <CardHeader title="Doorlooptijd" />

      <Stack spacing={2.5} sx={{ p: 3 }}>
        <DurationRow
          label="Totale ordertijd"
          fromLabel="Besteld"
          toLabel="Bevestigd"
          from={orderedAt}
          to={confirmedAt}
          missing="nog niet bevestigd"
        />

        <DurationRow
          label="Voorbereidingstijd"
          fromLabel="Werkbon geprint"
          toLabel="Factuur geprint"
          from={werkbonAt}
          to={invoiceAt}
          missing="nog niet geprint"
        />
      </Stack>
    </Card>
  );
}
