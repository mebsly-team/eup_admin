import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IPurchaseTableFilters, IPurchaseTableFilterValue } from 'src/types/purchase';

// ----------------------------------------------------------------------

type Props = {
    filters: IPurchaseTableFilters;
    onFilters: (name: string, value: IPurchaseTableFilterValue) => void;
    //
    statusOptions: string[];
};

export default function PurchaseTableToolbar({
    filters,
    onFilters,
    //
    statusOptions,
}: Props) {
    const { t } = useTranslate();

    const popover = usePopover();

    const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters('name', event.target.value);
    };

    const handleFilterStatus = (event: SelectChangeEvent<string[]>) => {
        onFilters('status', event.target.value);
    };

    return (
        <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
                xs: 'column',
                md: 'row',
            }}
            sx={{
                p: 2.5,
                pr: { xs: 2.5, md: 1 },
            }}
        >
            <FormControl
                sx={{
                    flexShrink: 0,
                    width: { xs: 1, md: 200 },
                }}
            >
                <InputLabel>{t('status')}</InputLabel>

                <Select
                    multiple
                    value={filters.status}
                    onChange={handleFilterStatus}
                    input={<OutlinedInput label={t('status')} />}
                    renderValue={(selected) => selected.map((value) => t(value)).join(', ')}
                >
                    {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {t(option)}
                        </MenuItem>
                    ))}
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
            </Stack>
        </Stack>
    );
} 