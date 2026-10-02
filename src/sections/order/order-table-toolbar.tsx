import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';

import { IOrderTableFilters } from 'src/types/order';

// ----------------------------------------------------------------------

type SearchScope = 'name' | 'orderId' | 'ean';

const SEARCH_SCOPES: { value: SearchScope; label: string; placeholder: string }[] = [
  { value: 'name', label: 'Alles', placeholder: 'Zoek op klant, e-mail, relatiecode of Snelstart-nr.' },
  { value: 'orderId', label: 'Order-ID', placeholder: 'Order-ID' },
  { value: 'ean', label: 'EAN', placeholder: 'Product EAN' },
];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: 'paid', label: 'Betaald' },
  { value: 'unpaid', label: 'Onbetaald' },
];

const SEARCH_DELAY = 400;

type Props = {
  filters: IOrderTableFilters;
  onApplyFilters: (patch: Partial<IOrderTableFilters>) => void;
  onResetFilters: VoidFunction;
  canReset: boolean;
  results: number;
  //
  dateError: boolean;
};

export default function OrderTableToolbar({
  filters,
  onApplyFilters,
  onResetFilters,
  canReset,
  results,
  dateError,
}: Props) {
  // Order ID, EAN and the free-text search are separate backend filters, but
  // only one of them is active at a time, so they share a single field.
  const activeScope: SearchScope =
    (filters.orderId && 'orderId') || (filters.ean && 'ean') || 'name';
  const activeValue = filters[activeScope] || '';

  const [scope, setScope] = useState<SearchScope>(activeScope);
  const [query, setQuery] = useState<string>(activeValue);
  const committed = useRef<string>(activeValue);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);

  // Follow filter changes made elsewhere (browser back, reset, deep links).
  useEffect(() => {
    if (activeValue !== committed.current) {
      committed.current = activeValue;
      setQuery(activeValue);
      setScope(activeScope);
    }
  }, [activeScope, activeValue]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const commitSearch = useCallback(
    (nextScope: SearchScope, value: string) => {
      committed.current = value;
      onApplyFilters({ name: '', orderId: '', ean: '', [nextScope]: value });
    },
    [onApplyFilters]
  );

  const handleQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = scope === 'orderId' ? raw.replace(/\D/g, '') : raw;
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commitSearch(scope, value.trim()), SEARCH_DELAY);
  };

  const handleScope = (nextScope: SearchScope) => {
    const value = nextScope === 'orderId' ? query.replace(/\D/g, '') : query.trim();
    setScope(nextScope);
    setQuery(value);
    clearTimeout(timer.current);
    if (value || activeValue) commitSearch(nextScope, value);
  };

  const dateLabel =
    (filters.startDate &&
      filters.endDate &&
      `${fDate(filters.startDate)} – ${fDate(filters.endDate)}`) ||
    (filters.startDate && `Vanaf ${fDate(filters.startDate)}`) ||
    (filters.endDate && `T/m ${fDate(filters.endDate)}`) ||
    'Periode: alle datums';
  const hasDate = !!filters.startDate || !!filters.endDate;

  const uninvoiced = filters.status === 'uninvoiced';
  const placeholder = SEARCH_SCOPES.find((option) => option.value === scope)?.placeholder;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        spacing={1.5}
        sx={{ p: 2 }}
      >
        <TextField
          size="small"
          value={query}
          onChange={handleQuery}
          placeholder={placeholder}
          inputProps={{
            'aria-label': 'Zoeken',
            ...(scope === 'orderId' && { inputMode: 'numeric' }),
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Select
                  variant="standard"
                  disableUnderline
                  value={scope}
                  onChange={(event) => handleScope(event.target.value as SearchScope)}
                  inputProps={{ 'aria-label': 'Zoeken in' }}
                  sx={{ typography: 'body2', color: 'text.secondary' }}
                >
                  {SEARCH_SCOPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </InputAdornment>
            ),
          }}
          sx={{ flex: '1 1 320px' }}
        />

        <Button
          variant="outlined"
          color={hasDate ? 'primary' : 'inherit'}
          onClick={(event) => setDateAnchor(event.currentTarget)}
          startIcon={<Iconify icon="solar:calendar-linear" />}
          sx={{ height: 40, whiteSpace: 'nowrap', fontWeight: hasDate ? 600 : 400 }}
        >
          {dateLabel}
        </Button>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={filters.paymentStatus}
          onChange={(_, value) => value && onApplyFilters({ paymentStatus: value })}
          aria-label="Betaalstatus"
          sx={{ height: 40 }}
        >
          {PAYMENT_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value} sx={{ px: 1.5 }}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Button
          variant={uninvoiced ? 'soft' : 'outlined'}
          color={uninvoiced ? 'primary' : 'inherit'}
          aria-pressed={uninvoiced}
          onClick={() => onApplyFilters({ status: uninvoiced ? 'all' : 'uninvoiced' })}
          startIcon={<Iconify icon="solar:bill-list-linear" />}
          sx={{ height: 40, whiteSpace: 'nowrap', fontWeight: uninvoiced ? 600 : 400 }}
        >
          Zonder factuur
        </Button>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            <Box component="strong" sx={{ color: 'text.primary' }}>
              {results}
            </Box>{' '}
            {results === 1 ? 'resultaat' : 'resultaten'}
          </Typography>

          {canReset && (
            <Button size="small" color="error" onClick={onResetFilters}>
              Filters wissen
            </Button>
          )}
        </Stack>
      </Stack>

      <Popover
        open={!!dateAnchor}
        anchorEl={dateAnchor}
        onClose={() => setDateAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, mt: 0.5, width: 280 } } }}
      >
        <Stack spacing={2}>
          <DatePicker
            label="Begindatum"
            value={filters.startDate || null}
            onChange={(value: Date | null) => onApplyFilters({ startDate: value })}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />

          <DatePicker
            label="Einddatum"
            value={filters.endDate || null}
            onChange={(value: Date | null) => onApplyFilters({ endDate: value })}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: dateError,
                helperText: dateError && 'Einddatum moet later zijn dan begindatum',
              },
            }}
          />

          <Stack direction="row" justifyContent="space-between">
            <Button
              size="small"
              color="inherit"
              disabled={!hasDate}
              onClick={() => onApplyFilters({ startDate: null, endDate: null })}
            >
              Wissen
            </Button>
            <Button size="small" variant="contained" onClick={() => setDateAnchor(null)}>
              Klaar
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
