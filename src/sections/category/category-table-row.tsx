import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export const CATEGORY_TABLE_COLUMNS = 4;

const HIDE_BELOW_SM = { display: { xs: 'none', sm: 'table-cell' } };

// All categories below this one, at any depth.
const countDescendants = (row: any): number =>
  (row.sub_categories || []).reduce(
    (total: number, sub: any) => total + 1 + countDescendants(sub),
    0
  );

type Props = {
  row: any;
  depth?: number;
  onEditRow: (id: string) => void;
  onDeleteRow: (id: string) => Promise<void> | void;
  onAddSubCategoryRow: (id: string) => void;
};

export default function CategoryTableRow({
  row,
  depth = 0,
  onEditRow,
  onDeleteRow,
  onAddSubCategoryRow,
}: Props) {
  const { id, name, image, slug, sub_categories } = row;
  const { t } = useTranslate();
  const confirm = useBoolean();
  const popover = usePopover();
  const [isOpen, setOpen] = useState(false);

  const subCount = sub_categories?.length || 0;
  const totalCount = countDescendants(row);

  const download = async (url: string, filename: string) => {
    try {
      const response = await axiosInstance.get(url, { responseType: 'blob' });
      const href = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <>
      <TableRow hover sx={depth ? { bgcolor: 'background.neutral' } : undefined}>
        <TableCell sx={{ px: 1, pl: 2, maxWidth: { xs: '56vw', md: 480 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ minWidth: 0, pl: depth * 3.5 }}
          >
            {subCount ? (
              <IconButton
                size="small"
                onClick={() => setOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? 'Verberg' : 'Toon'} subcategorieën van ${name}`}
              >
                <Iconify
                  width={18}
                  icon={isOpen ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                />
              </IconButton>
            ) : (
              <Box sx={{ width: 28, flexShrink: 0 }} />
            )}

            {depth === 0 && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
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
                {image ? (
                  <Box
                    component="img"
                    alt=""
                    loading="lazy"
                    src={`${IMAGE_FOLDER_PATH}${image}`}
                    sx={{ width: 1, height: 1, objectFit: 'cover' }}
                  />
                ) : (
                  <Iconify icon="solar:gallery-bold" width={20} />
                )}
              </Box>
            )}

            <Box sx={{ minWidth: 0 }}>
              <Link
                component={RouterLink}
                href={paths.dashboard.category.edit(id)}
                variant={depth ? 'body2' : 'subtitle2'}
                color="inherit"
                noWrap
                title={name}
                sx={{ display: 'block' }}
              >
                {name}
              </Link>
              {slug && (
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: 'text.secondary', display: 'block' }}
                >
                  /{slug}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {subCount ? (
            <Button
              size="small"
              color="inherit"
              onClick={() => setOpen(!isOpen)}
              sx={{ fontWeight: 400, minWidth: 0 }}
            >
              <Box component="strong" sx={{ mr: 0.5 }}>
                {subCount}
              </Box>
              {totalCount > subCount && (
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }}
                >
                  ({totalCount} totaal)
                </Box>
              )}
            </Button>
          ) : (
            <Box component="span" sx={{ color: 'text.disabled', px: 1 }}>
              —
            </Box>
          )}
        </TableCell>

        <TableCell
          sx={{ px: 1, color: 'text.secondary', fontVariantNumeric: 'tabular-nums', ...HIDE_BELOW_SM }}
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
        sx={{ width: 220 }}
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
            onAddSubCategoryRow(id);
            popover.onClose();
          }}
        >
          <Iconify icon="mingcute:add-line" />
          Subcategorie toevoegen
        </MenuItem>
        <MenuItem
          onClick={() => {
            download(`/export/products/?category_id=${id}`, `products_category_${name}.csv`);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Producten exporteren
        </MenuItem>
        <MenuItem
          onClick={() => {
            download(
              `/export/products/kort/?category_id=${id}`,
              `products_category_kort_${name}.csv`
            );
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Producten exporteren (kort)
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

      {isOpen &&
        sub_categories.map((sub: any) => (
          <CategoryTableRow
            key={sub.id}
            row={sub}
            depth={depth + 1}
            onEditRow={onEditRow}
            onDeleteRow={onDeleteRow}
            onAddSubCategoryRow={onAddSubCategoryRow}
          />
        ))}
    </>
  );
}
