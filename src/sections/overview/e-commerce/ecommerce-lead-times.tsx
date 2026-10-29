import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatDuration } from 'src/sections/order/order-details-durations';

// ----------------------------------------------------------------------

export type LeadTimeSummary = {
  count: number;
  average: number | null;
  median: number | null;
  p90: number | null;
  min: number | null;
  max: number | null;
  total: number;
  within_24h_percent: number | null;
  slowest: { id: number; seconds: number }[];
};

type Props = {
  title: string;
  subheader: string;
  summary?: LeadTimeSummary;
};

const fSeconds = (seconds: number | null | undefined) =>
  seconds == null ? '—' : formatDuration(seconds * 1000);

export default function EcommerceLeadTimes({ title, subheader, summary }: Props) {
  const count = summary?.count || 0;

  const stats = [
    { label: 'Mediaan', value: fSeconds(summary?.median) },
    { label: '90% binnen', value: fSeconds(summary?.p90) },
    { label: 'Snelste', value: fSeconds(summary?.min) },
    { label: 'Traagste', value: fSeconds(summary?.max) },
    { label: 'Binnen 24 uur', value: count ? `${summary?.within_24h_percent ?? 0}%` : '—' },
    { label: 'Totaal', value: count ? fSeconds(summary?.total) : '—' },
  ];

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={2.5} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Gemiddeld
            </Typography>
            <Typography variant="h3">{fSeconds(summary?.average)}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right' }}>
            {count} {count === 1 ? 'order' : 'orders'} gemeten
          </Typography>
        </Stack>

        <Box
          sx={{
            gap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          }}
        >
          {stats.map((stat) => (
            <Box key={stat.label}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stat.label}
              </Typography>
              <Typography variant="subtitle1">{stat.value}</Typography>
            </Box>
          ))}
        </Box>

        {!!summary?.slowest?.length && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack spacing={1}>
              <Typography variant="subtitle2">Traagste orders</Typography>
              {summary.slowest.map((row) => (
                <Stack key={row.id} direction="row" justifyContent="space-between">
                  <Link
                    component={RouterLink}
                    href={paths.dashboard.order.details(String(row.id))}
                    variant="body2"
                  >
                    #{row.id}
                  </Link>
                  <Typography variant="body2">{fSeconds(row.seconds)}</Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );
}
