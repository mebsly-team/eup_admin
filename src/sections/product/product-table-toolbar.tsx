import debounce from 'lodash.debounce';
import { useRef, useMemo, useState, useEffect } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { IProductTableFilters, IProductTableFilterValue } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
  filters: IProductTableFilters;
  onFilters: (name: string, value: IProductTableFilterValue) => void;
  onResetFilters: VoidFunction;
  canReset: boolean;
  results: number;
  //
  searchQuery: any;
  setSearchQuery: any;
  //
  showBundles: boolean;
  onToggleBundles: VoidFunction;
};

export default function ProductTableToolbar({
  filters,
  onFilters,
  onResetFilters,
  canReset,
  results,
  //
  searchQuery,
  setSearchQuery,
  //
  showBundles,
  onToggleBundles,
}: Props) {
  const { t } = useTranslate();
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [qrReaderOpen, setQRReaderOpen] = useState(false);

  useEffect(() => {
    let active = true;

    axiosInstance
      .get(`/categories/?short=true`)
      .then(({ data }) => {
        if (active) setCategoryList(data || []);
      })
      .catch((error) => console.error(error));

    return () => {
      active = false;
    };
  }, []);

  // onFilters changes on every render of the parent, so the debounced function reads it from a
  // ref and is created once. Recreating it per render left one pending timer per keystroke.
  const onFiltersRef = useRef(onFilters);
  onFiltersRef.current = onFilters;

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onFiltersRef.current('name', value);
      }, 750),
    []
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleScan = (data: string) => {
    if (data) {
      setSearchQuery(data);
      debouncedSearch(data);
      setQRReaderOpen(false);
    }
  };

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
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Zoek op titel, EAN, artikelcode, leverancier of locatie"
          inputProps={{ 'aria-label': t('search') }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  size="small"
                  aria-label="Barcode scannen"
                  onClick={() => setQRReaderOpen(true)}
                >
                  <Iconify icon="solar:scanner-linear" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flex: '1 1 320px' }}
        />

        <Autocomplete
          size="small"
          options={categoryList}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label={t('category')} margin="none" />}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          )}
          value={categoryList.find((category) => category?.id === Number(filters.category)) || null}
          onChange={(event: any, newValue: any) => onFilters('category', newValue?.id || '')}
          sx={{ flex: '0 1 260px', minWidth: 200 }}
        />

        <Button
          variant={showBundles ? 'soft' : 'outlined'}
          color={showBundles ? 'primary' : 'inherit'}
          aria-pressed={showBundles}
          onClick={onToggleBundles}
          startIcon={<Iconify icon="solar:layers-minimalistic-linear" />}
          sx={{ height: 40, whiteSpace: 'nowrap', fontWeight: showBundles ? 600 : 400 }}
        >
          Bundels tonen
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

      {qrReaderOpen && (
        <Dialog open onClose={() => setQRReaderOpen(false)}>
          <DialogTitle>Barcode scannen</DialogTitle>
          <DialogContent>
            <BarcodeScannerComponent
              onUpdate={(err, result) => {
                if (result) handleScan((result as any).text);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
