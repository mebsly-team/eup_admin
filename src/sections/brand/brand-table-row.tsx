import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IBrandItem } from 'src/types/brand';

// ----------------------------------------------------------------------

export const BRAND_TABLE_COLUMNS = 4;

type Props = {
  row: IBrandItem;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditRow: (id: number) => void;
  onDeleteRow: (id: number) => Promise<void> | void;
};

export default function BrandTableRow({ row, selected, onSelectRow, onEditRow, onDeleteRow }: Props) {
  const { logo, name, description } = row;
  const id = row.id as number;
  const { t } = useTranslate();
  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ 'aria-label': `${name} selecteren` }}
          />
        </TableCell>

        <TableCell sx={{ px: 1, maxWidth: { xs: '56vw', md: 560 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 72,
                height: 44,
                p: 0.5,
                flexShrink: 0,
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
                color: 'text.disabled',
              }}
            >
              {logo ? (
                <Box
                  component="img"
                  alt=""
                  loading="lazy"
                  src={`${IMAGE_FOLDER_PATH}${logo}`}
                  sx={{ width: 1, height: 1, objectFit: 'contain' }}
                />
              ) : (
                <Iconify icon="solar:gallery-bold" width={20} />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Link
                component={RouterLink}
                href={paths.dashboard.brand.edit(String(id))}
                variant="subtitle2"
                color="inherit"
                noWrap
                title={name}
                sx={{ display: 'block' }}
              >
                {name}
              </Link>
              {description && (
                <Typography
                  variant="caption"
                  noWrap
                  title={description}
                  sx={{ color: 'text.secondary', display: 'block' }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>

        <TableCell
          sx={{
            px: 1,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            display: { xs: 'none', sm: 'table-cell' },
          }}
        >
          {id}
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            aria-label={`Acties voor ${name}`}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow(id);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('view_edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('delete')}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={
          <>
            {t('sure_delete')}
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              {name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
              De producten van dit merk worden ook verwijderd.
            </Typography>
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await onDeleteRow(id);
              confirm.onFalse();
            }}
          >
            {t('delete')}
          </Button>
        }
      />
    </>
  );
}
