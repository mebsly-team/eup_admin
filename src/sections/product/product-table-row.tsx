import { useState } from 'react';

import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IProductItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditStock: VoidFunction;
};

export default function ProductTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onEditStock,
}: Props) {
  const {
    id,
    images,
    title,
    description,
    ean,
    is_product_active,
    discounted_price,
    overall_stock,
    free_stock,
    variants,
    slug,
  } = row;
  const [isActive, setIsActive] = useState(is_product_active);

  const { t, onChangeLang } = useTranslate();

  const confirm = useBoolean();

  const popover = usePopover();
  const popoverClick = (e: any) => {
    e.stopPropagation();
    popover.onOpen(e);
  };
  const handleActiveSwitchChange = async (e: { target: { checked: any } }) => {
    const response = await axiosInstance.patch(`/products/${id}/`, {
      is_product_active: e.target.checked,
    });
    setIsActive(response?.data?.is_product_active ?? isActive);
  };
  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }} hover selected={selected} onClick={() => onEditRow()}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Image alt={title} src={images?.[0]} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={
              <a
                target="_blank"
                href={`http://52.28.100.129:3000/nl/product/${id}/${slug}`}
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </a>
            }
            secondary={description}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{discounted_price}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{variants?.length || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ean}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {free_stock}/{overall_stock}
        </TableCell>
        <TableCell>
          <Switch name="is_product_active" checked={isActive} onChange={handleActiveSwitchChange} />
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip> */}

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popoverClick}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        // sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('view_edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEditStock();
            popover.onClose();
          }}
        >
          <Iconify icon="eva:cube-fill" />
          {t('stock_update_choices')}
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
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('delete')}
          </Button>
        }
      />
    </>
  );
}
