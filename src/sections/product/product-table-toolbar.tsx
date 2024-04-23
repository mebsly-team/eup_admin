import debounce from 'lodash.debounce';
import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react'; // Import debounce function

import Stack from '@mui/material/Stack';
import { Autocomplete } from '@mui/material';
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

import { IProductItem, IProductTableFilters, IProductTableFilterValue } from 'src/types/product';

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
  const [categoryList, setCategoryList] = useState<IProductItem[]>([]);
  const [value, setValue] = useState<string | null>();
  console.log('value', value);

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false); // State for the spinner

  const [searchQuery, setSearchQuery] = useState<string>('');

  const getAllCategories = async () => {
    setIsCategoriesLoading(true);
    const { data } = await axiosInstance.get(`/categories/`);
    setCategoryList(data || []);
    setIsCategoriesLoading(false);
  };
  // Debounce the search filter function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilters('name', value);
    }, 500), // Adjust the debounce delay as needed
    [onFilters]
  );

  // Handle changes in the search field
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchQuery(value);
    debouncedSearch(value); // Apply debounce for filtering
  };

  const handleFilterActive = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters('is_product_active', event.target.value);
    },
    [onFilters]
  );
  const handleFilterCategory = useCallback(
    (selected: { id: IProductTableFilterValue }) => {
      onFilters('category', selected?.id);
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
        {categoryList?.length > 0 && (
          <Autocomplete
            onClick={() => getAllCategories()}
            fullWidth
            options={categoryList}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label={t('category')} margin="none" />}
            renderOption={(props, option) => (
              <li {...props} key={option.name}>
                {option.name}
              </li>
            )}
            onChange={(event: any, newValue: any) => {
              console.log('newValue', newValue);
              setValue(newValue);
              handleFilterCategory(newValue);
            }}
          />
        )}
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange} // Change to the debounced handler
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
