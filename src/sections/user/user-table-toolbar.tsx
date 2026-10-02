import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useTranslate } from 'src/locales';

import { MAP_USER_COLORS } from 'src/constants/colors';

import Iconify from 'src/components/iconify';

import { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';

// ----------------------------------------------------------------------

const SEARCH_DELAY = 400;

const SITE_OPTIONS = [
  { value: 'all', label: 'Alle sites' },
  { value: 'kooptop.com', label: 'Kooptop' },
  { value: 'europowerbv.com', label: 'Europower' },
];

type Props = {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  onResetFilters: VoidFunction;
  canReset: boolean;
  results: number;
  //
  roleOptions: {
    value: string;
    label: string;
  }[];
};

export default function UserTableToolbar({
  filters,
  onFilters,
  onResetFilters,
  canReset,
  results,
  //
  roleOptions,
}: Props) {
  const { t } = useTranslate();

  const [query, setQuery] = useState(filters.name);
  const committed = useRef(filters.name);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Follow filter changes made elsewhere (reset, deep links).
  useEffect(() => {
    if (filters.name !== committed.current) {
      committed.current = filters.name;
      setQuery(filters.name);
    }
  }, [filters.name]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      committed.current = value.trim();
      onFilters('name', value.trim());
    }, SEARCH_DELAY);
  };

  const site = filters.site[0] || 'all';
  const role = filters.role[0] || '';

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ p: 2 }}>
      <TextField
        size="small"
        value={query}
        onChange={handleQuery}
        placeholder="Zoek op naam, e-mail, relatiecode, KvK of adres"
        inputProps={{ 'aria-label': t('search') }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: '1 1 300px' }}
      />

      <ToggleButtonGroup
        exclusive
        size="small"
        value={site}
        onChange={(_, value) => value && onFilters('site', value === 'all' ? [] : [value])}
        aria-label="Site"
        sx={{ height: 40 }}
      >
        {SITE_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value} sx={{ px: 1.5, whiteSpace: 'nowrap' }}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Select
        size="small"
        displayEmpty
        value={role}
        onChange={(event) => onFilters('role', event.target.value ? [event.target.value] : [])}
        inputProps={{ 'aria-label': 'Type' }}
        renderValue={(value) =>
          `Type: ${roleOptions.find((option) => option.value === value)?.label || 'alle'}`
        }
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Alle types</MenuItem>
        {roleOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      <Select
        multiple
        size="small"
        displayEmpty
        value={filters.colors}
        onChange={(event) =>
          onFilters(
            'colors',
            typeof event.target.value === 'string'
              ? event.target.value.split(',')
              : event.target.value
          )
        }
        inputProps={{ 'aria-label': t('color') }}
        renderValue={(selected) =>
          selected.length ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <span>Kleur:</span>
              {selected.map((value) => (
                <ColorDot key={value} color={value} />
              ))}
            </Stack>
          ) : (
            'Kleur: alle'
          )
        }
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
        sx={{ minWidth: 130 }}
      >
        {MAP_USER_COLORS.map((option) => (
          <MenuItem key={option.value} value={option.color}>
            <Checkbox disableRipple size="small" checked={filters.colors.includes(option.color)} />
            <ColorDot color={option.color} sx={{ mr: 1 }} />
            {option.labelNL}
          </MenuItem>
        ))}
      </Select>

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
  );
}

// ----------------------------------------------------------------------

export function ColorDot({ color, sx }: { color: string; sx?: object }) {
  return (
    <Box
      component="span"
      sx={{
        width: 16,
        height: 16,
        flexShrink: 0,
        display: 'inline-block',
        borderRadius: '50%',
        bgcolor: color,
        border: (theme) => `solid 1px ${theme.palette.divider}`,
        ...sx,
      }}
    />
  );
}
