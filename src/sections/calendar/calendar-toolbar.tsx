import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import GoogleCalendarAuth from 'src/components/google-calendar/GoogleCalendarAuth';

import { ICalendarView } from 'src/types/calendar';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  {
    value: 'dayGridMonth',
    label: 'Month',
    icon: 'mingcute:calendar-month-line',
  },
  { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
  {
    value: 'listWeek',
    label: 'Agenda',
    icon: 'mingcute:calendar-schedule-line',
  },
] as const;

// ----------------------------------------------------------------------

type Props = {
  date: Date;
  view: ICalendarView;
  loading: boolean;
  onToday: VoidFunction;
  onNextDate: VoidFunction;
  onPrevDate: VoidFunction;
  onOpenFilters: VoidFunction;
  onChangeView: (newView: ICalendarView) => void;
};

export default function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  onNextDate,
  onPrevDate,
  onOpenFilters,
  onChangeView,
}: Props) {
  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  const popover = usePopover();

  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2.5,
          pr: 2,
          position: 'relative',
          borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        {smUp && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={onPrevDate}>
              <Iconify icon="mingcute:arrow-left-line" />
            </IconButton>

            <IconButton onClick={onNextDate}>
              <Iconify icon="mingcute:arrow-right-line" />
            </IconButton>
          </Stack>
        )}

        <Stack direction="row" alignItems="center">
          <Button
            variant="text"
            color="inherit"
            onClick={onToday}
            sx={{
              typography: 'h6',
              ...(smUp && { px: 3, py: 1 }),
            }}
          >
            {fDate(date)}
          </Button>

          {smUp && (
            <GoogleCalendarAuth />
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {smUp && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={selectedItem.icon} />}
              onClick={onOpenFilters}
            >
              {selectedItem.label}
            </Button>
          )}

          <IconButton onClick={onOpenFilters}>
            <Iconify icon="mingcute:filter-line" />
          </IconButton>
        </Stack>

        {loading && (
          <LinearProgress
            color="inherit"
            sx={{
              height: 2,
              width: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
          />
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-left"
        sx={{ width: 160 }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            selected={viewOption.value === view}
            onClick={() => {
              popover.onClose();
              onChangeView(viewOption.value);
            }}
          >
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
