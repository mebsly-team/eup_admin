import { useState } from 'react';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { ICategoryItem } from 'src/types/category';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ICategoryItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function CategoryTableRow({ row, onEditRow, onDeleteRow, table }: Props) {
  const { name, image, parent_category, sub_categories } = row;
  const { t, onChangeLang } = useTranslate();
  const selected = table?.selected?.includes(row.id);
  const onSelectRow = () => table?.onSelectRow(row.id);
  const confirm = useBoolean();
  const router = useRouter();

  const quickEdit = useBoolean();

  const popover = usePopover();
  const [isSubCategoriesOpen, setSubCategoriesOpen] = useState(false);

  // Define a variable to determine whether the row is a subcategory
  const isSubcategory = !!parent_category;

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{ background: isSubcategory ? 'rgba(145, 158, 171, 0.08)' : 'none' }}
      >
        <TableCell align="center">{row.id}</TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          {image ? <Image alt={name} src={image} maxWidth={100} /> : '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{name}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{parent_category || '-'}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {sub_categories?.length || 0}{' '}
          {sub_categories?.length ? (
            <Iconify
              sx={{ cursor: 'pointer' }}
              width={16}
              className="arrow"
              icon="eva:arrow-ios-downward-fill"
              onClick={() => setSubCategoriesOpen(!isSubCategoriesOpen)}
            />
          ) : null}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip> */}

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      {/* <CategoryQuickEditForm currentCategory={row} open={quickEdit.value} onClose={quickEdit.onFalse} /> */}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow(row.id);
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
        content={t('sure_delete')}
        action={
          <Button variant="contained" color="error" onClick={() => onDeleteRow(row.id)}>
            {t('delete')}
          </Button>
        }
      />

      {isSubCategoriesOpen && (
        <>
          {sub_categories.map((row) => (
            <CategoryTableRow
              key={row.id}
              row={row}
              table={table}
              onDeleteRow={onDeleteRow}
              onEditRow={onEditRow}
            />
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(paths.dashboard.category.new)}
          >
            {t('add')}
          </Button>
        </>
      )}
    </>
  );
}
