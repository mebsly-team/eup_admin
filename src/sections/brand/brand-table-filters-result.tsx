import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from 'src/components/iconify';

import { IBrandTableFilters, IBrandTableFilterValue } from 'src/types/brand';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IBrandTableFilters;
  onFilters: (name: string, value: IBrandTableFilterValue) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function BrandTableFiltersResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}: Props) {
  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveRole = useCallback(
    (inputValue: string) => {
      const newValue = filters.role.filter((item) => item !== inputValue);

      onFilters('role', newValue);
    },
    [filters.role, onFilters]
  );

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultaten gevonden
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.name && (
          <Block label="Keyword:">
            <Chip label={filters.name} size="small" onDelete={handleRemoveKeyword} />
          </Block>
        )}
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
