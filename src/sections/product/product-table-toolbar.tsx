import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IProductTableFilters, IProductTableFilterValue } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
  filters: IProductTableFilters;
  onFilters: (name: string, value: IProductTableFilterValue) => void;
  //
  roleOptions: string[];
};

export default function UserTableToolbar({
  filters,
  onFilters,
  //
  roleOptions,
}: Props) {
  const popover = usePopover();
  const { t, onChangeLang } = useTranslate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterActive = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters('is_product_active', event.target.value);
    },
    [onFilters]
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post('import/products/', formData);
      enqueueSnackbar(t('update_success'), {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('error'), {
        variant: 'error',
      });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get('export/products/', { responseType: 'blob' });
      console.log('response', response);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      // Handle errors as needed
    }
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel>Active?</InputLabel>
          <Select
            value={filters.is_product_active}
            onChange={handleFilterActive}
            input={<OutlinedInput label="Active?" />}
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="all">{t('all')}</MenuItem>
            <MenuItem value="active">{t('active')}</MenuItem>
            <MenuItem value="passive">{t('inactive')}</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder={t('search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem>
          <input
            type="file"
            accept=".csv"
            id="upload-file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <label htmlFor="upload-file">
              <Iconify icon="solar:import-bold" />
              {t('import')}
          </label>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <Iconify icon="solar:export-bold" />
          {t('export')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
