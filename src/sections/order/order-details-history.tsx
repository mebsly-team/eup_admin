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

export default function OrderDetailsHistory({ currentOrder }: Props) {
  const dates = [
    { label: 'Besteldatum', value: currentOrder?.ordered_date },
    { label: 'Betalingsdatum', value: currentOrder?.payment_date },
    { label: 'Verzenddatum', value: currentOrder?.shipped_date },
    { label: 'Afleverdatum', value: currentOrder?.delivered_date },
  ];

  const history: any[] = Array.isArray(currentOrder?.history) ? currentOrder.history : [];

  // Newest first: the latest change is what one comes here to check.
  const events = history.map((item, index) => ({ ...item, index })).reverse();

  return (
    <Card>
      <CardHeader title="Geschiedenis" />

      <Box
        sx={{
          mx: 3,
          mt: 2,
          p: 2,
          gap: 2,
          display: 'grid',
          borderRadius: 1,
          typography: 'body2',
          bgcolor: 'background.neutral',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
        }}
      >
        {dates.map((date) => (
          <Stack key={date.label} spacing={0.25}>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>{date.label}</Box>
            {fDateTime(date.value) || '—'}
          </Stack>
        ))}
      </Box>

      <Stack sx={{ p: 3 }}>
        {events.map((item, position) => (
          <Stack key={item.index} direction="row" spacing={1.5}>
            <Stack alignItems="center" sx={{ pt: 0.75 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: position === 0 ? 'primary.main' : 'grey.400',
                }}
              />
              {position < events.length - 1 && (
                <Box sx={{ width: '1px', flexGrow: 1, mt: 0.5, bgcolor: 'divider' }} />
              )}
            </Stack>

            <Box sx={{ pb: 2, minWidth: 0 }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {item.event}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {fDateTime(item.date)}
              </Typography>
            </Box>
          </Stack>
        ))}

        {events.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nog geen geschiedenis
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
