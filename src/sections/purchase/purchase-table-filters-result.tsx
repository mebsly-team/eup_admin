import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { IPurchaseTableFilters, IPurchaseTableFilterValue } from 'src/types/purchase';

// ----------------------------------------------------------------------

type Props = {
    filters: IPurchaseTableFilters;
    onFilters: (name: string, value: IPurchaseTableFilterValue) => void;
    //
    onResetFilters: VoidFunction;
    //
    results: number;
};

export default function PurchaseTableFiltersResult({
    filters,
    onFilters,
    onResetFilters,
    results,
}: Props) {
    const { t } = useTranslate();

    const handleRemoveStatus = (value: string) => {
        const newValue = filters.status.filter((item) => item !== value);
        onFilters('status', newValue);
    };

    return (
        <Stack spacing={1.5} sx={{ p: 3 }}>
            <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
                {filters.status.map((item) => (
                    <Chip
                        key={item}
                        label={t(item)}
                        size="small"
                        onDelete={() => handleRemoveStatus(item)}
                    />
                ))}

                {filters.name && (
                    <Chip
                        label={`${t('name')}: ${filters.name}`}
                        size="small"
                        onDelete={() => onFilters('name', '')}
                    />
                )}

                <Button
                    color="error"
                    onClick={onResetFilters}
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                >
                    {t('clear')}
                </Button>
            </Stack>

            <Box sx={{ typography: 'body2' }}>
                <strong>{results}</strong>
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
                    {t('results_found')}
                </Box>
            </Box>
        </Stack>
    );
} 