import { useCallback } from 'react';
import orderBy from 'lodash/orderBy';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';

import { fDateTime } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ColorPicker } from 'src/components/color-utils';

import { ICalendarEvent, ICalendarFilters, ICalendarFilterValue } from 'src/types/calendar';

// ----------------------------------------------------------------------

type Props = {
  //
  filters: ICalendarFilters;
  onFilters: (name: string, value: ICalendarFilterValue) => void;
  //
  canReset: boolean;
  onResetFilters: VoidFunction;
  //
  dateError: boolean;
  //
  open: boolean;
  onClose: VoidFunction;
  //
  events: ICalendarEvent[];
  colorOptions: string[];
  onClickEvent: (eventId: string) => void;
};

export default function CalendarFilters({
  open,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  dateError,
  //
  events,
  colorOptions,
  onClickEvent,
}: Props) {
  const selectedEventColors = events
    .filter((event) => filters.colors.includes(event.color))
    .map((event) => event.color);

  const handleFilterColors = useCallback(
    (colors: string[]) => {
      onFilters('colors', colors);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  const renderDateFilter = (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Date Range</Typography>
      <DatePicker
        value={filters.startDate}
        onChange={(newValue) => {
          onFilters('startDate', newValue);
        }}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />

      <DatePicker
        value={filters.endDate}
        onChange={(newValue) => {
          onFilters('endDate', newValue);
        }}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
    </Stack>
  );

  const renderColorFilter = (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Colors</Typography>
      <ColorPicker
        selected={selectedEventColors}
        onSelectColor={handleFilterColors}
        colors={colorOptions}
      />
    </Stack>
  );

  const renderEventList = (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Events ({events.length})</Typography>

      <Stack spacing={1}>
        {events.map((event) => {
          const selected = filters.colors.includes(event.color);

          const timestamp = event.start ? new Date(Number(event.start)).getTime() : 0;

          return (
            <Stack
              key={event.id}
              spacing={1}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'background.neutral',
                },
                ...(selected && {
                  bgcolor: 'background.neutral',
                }),
              }}
            >
              <ListItemButton
                onClick={() => onClickEvent(event.id)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Typography variant="subtitle2" sx={{ color: event.color }}>
                  {event.title}
                </Typography>

                {timestamp > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fDateTime(timestamp)}
                  </Typography>
                )}
              </ListItemButton>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pl: 2, pr: 1, py: 2 }}
      >
        <Typography variant="h6">Filters</Typography>

        <Stack direction="row" spacing={1}>
          {canReset && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={onResetFilters}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              Clear
            </Button>
          )}

          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </Stack>

      <Divider />

      <Scrollbar sx={{ px: 2, py: 3 }}>
        <Stack spacing={3}>
          {renderDateFilter}
          {renderColorFilter}
          {renderEventList}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
