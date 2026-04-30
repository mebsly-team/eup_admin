import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import { useTranslate } from 'src/locales';

import { MAP_USER_COLORS } from 'src/constants/colors';

import Iconify from 'src/components/iconify';

import { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function UserTableFiltersResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}: Props) {
  const { t, onChangeLang } = useTranslate();

  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveStatus = useCallback(() => {
    onFilters('status', 'all');
  }, [onFilters]);

  const handleRemoveRole = useCallback(
    (inputValue: string) => {
      const newValue = filters.role.filter((item) => item !== inputValue);

      onFilters('role', newValue);
    },
    [filters.role, onFilters]
  );

  const handleRemoveColor = useCallback(
    (inputValue: string) => {
      const newValue = filters.colors.filter((item) => item !== inputValue);

      onFilters('colors', newValue);
    },
    [filters.colors, onFilters]
  );

  const handleRemoveSite = useCallback(
    (inputValue: string) => {
      const newValue = filters.site.filter((item) => item !== inputValue);

      onFilters('site', newValue);
    },
    [filters.site, onFilters]
  );

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>{' '}
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultaten gevonden
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.status !== 'all' && (
          <Block label="Status:">
            <Chip size="small" label={t(filters.status)} onDelete={handleRemoveStatus} />
          </Block>
        )}

        {!!filters.role.length && (
          <Block label="Role:">
            {filters.role.map((item) => (
              <Chip
                key={item}
                label={t(item)}
                size="small"
                onDelete={() => handleRemoveRole(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.colors.length && (
          <Block label={`${t('color')}:`}>
            {filters.colors.map((item) => (
              <Chip
                key={item}
                label={MAP_USER_COLORS.find((c) => c.value === item)?.labelNL || item}
                size="small"
                onDelete={() => handleRemoveColor(item)}
                icon={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: MAP_USER_COLORS.find((c) => c.value === item)?.color,
                      ml: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  />
                }
              />
            ))}
          </Block>
        )}

        {!!filters.site.length && (
          <Block label="Site:">
            {filters.site.map((item) => (
              <Chip
                key={item}
                label={t(item)}
                size="small"
                onDelete={() => handleRemoveSite(item)}
              />
            ))}
          </Block>
        )}

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
