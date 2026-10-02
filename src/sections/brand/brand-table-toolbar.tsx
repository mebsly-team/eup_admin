import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const SEARCH_DELAY = 400;

type Props = {
  name: string;
  onSearch: (value: string) => void;
  onReset: VoidFunction;
  canReset: boolean;
  results: number;
};

export default function BrandTableToolbar({ name, onSearch, onReset, canReset, results }: Props) {
  const { t } = useTranslate();

  const [query, setQuery] = useState(name);
  const committed = useRef(name);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Follow filter changes made elsewhere (reset, deep links).
  useEffect(() => {
    if (name !== committed.current) {
      committed.current = name;
      setQuery(name);
    }
  }, [name]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      committed.current = value.trim();
      onSearch(value.trim());
    }, SEARCH_DELAY);
  };

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ p: 2 }}>
      <TextField
        size="small"
        value={query}
        onChange={handleQuery}
        placeholder="Zoek op naam of beschrijving"
        inputProps={{ 'aria-label': t('search') }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: '1 1 300px', maxWidth: { md: 420 } }}
      />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          <Box component="strong" sx={{ color: 'text.primary' }}>
            {results}
          </Box>{' '}
          {results === 1 ? 'merk' : 'merken'}
        </Typography>

        {canReset && (
          <Button size="small" color="error" onClick={onReset}>
            Filters wissen
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
