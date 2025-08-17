import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

import { IOrderHistory } from 'src/types/order';

// ----------------------------------------------------------------------

type Props = {
  currentOrder: any;
};

export default function OrderDetailsHistory({ currentOrder }: Props) {
  const renderSummary = (
    <Stack
      spacing={2}
      component={Paper}
      variant="outlined"
      sx={{
        p: 2.5,
        minWidth: 260,
        flexShrink: 0,
        borderRadius: 2,
        typography: 'body2',
        borderStyle: 'dashed',
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Besteldatum</Box>
        {fDateTime(currentOrder?.ordered_date)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Betalingsdatum</Box>
        {fDateTime(currentOrder?.payment_date)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Verzenddatum</Box>
        {fDateTime(currentOrder?.shipped_date)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Afleverdatum</Box>
        {fDateTime(currentOrder?.delivered_date)}
      </Stack>
    </Stack>
  );

  const renderTimeline = (
    <Timeline
      sx={{
        p: 0,
        m: 0,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {(() => {
        console.log('currentOrder:', currentOrder);
        console.log('currentOrder.history:', currentOrder?.history);
        console.log('typeof currentOrder.history:', typeof currentOrder?.history);
        console.log('Array.isArray(currentOrder.history):', Array.isArray(currentOrder?.history));

        const historyArray = Array.isArray(currentOrder?.history) ? currentOrder.history : [];

        return historyArray.map((item: any, index: number) => {
          const firstTimeline = index === 0;

          const lastTimeline = index === historyArray.length - 1;

          return (
            <TimelineItem key={item.date}>
              <TimelineSeparator>
                <TimelineDot color={(firstTimeline && 'primary') || 'grey'} />
                {lastTimeline ? null : <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Typography variant="subtitle2">{item.event}</Typography>

                <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                  {fDateTime(item.date)}
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        });
      })()}
    </Timeline>
  );

  return (
    <Card>
      <CardHeader title="Geschiedenis" />
      <Stack
        spacing={3}
        alignItems={{ md: 'flex-start' }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderTimeline}

        {renderSummary}
      </Stack>
    </Card>
  );
}
