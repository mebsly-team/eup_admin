import { useState } from 'react';

import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
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
  handleLightBoxSlides: VoidFunction;
};

export default function ProductTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onEditStock,
  handleLightBoxSlides,
}: Props) {
  const {
    id,
    images,
    title,
    description,
    ean,
    is_product_active,
    price_per_piece,
    overall_stock,
    free_stock,
    variants,
    variants_count,
    slug,
  } = row;
  const { enqueueSnackbar } = useSnackbar();

  const [isActive, setIsActive] = useState(is_product_active);
  const theme = useTheme();
  const styles = {
    hideOnSm: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    hideOnMd: {
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
  };
  const { t, onChangeLang } = useTranslate();

  const confirm = useBoolean();

  const popover = usePopover();
  const popoverClick = (e: any) => {
    e.stopPropagation();
    popover.onOpen(e);
  };
  const onSelectRowClick = (e: any) => {
    e.stopPropagation();
    onSelectRow();
  };
  const handleActiveSwitchChange = async (e) => {
    e.stopPropagation(); // Stop event propagation

    try {
      const response = await axiosInstance.put(`/products/${id}/`, {
        is_product_active: e.target.checked,
        title,
      });
      setIsActive(response?.data?.is_product_active ?? isActive);
    } catch (error) {
      console.error('Missing Fields:', error);
      const missingFields = Object.values(error)?.[0] || [];
      missingFields.forEach((element) => {
        enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
      });
    }
  };
  const handleImageClick = (e) => {
    e.stopPropagation();
    handleLightBoxSlides(images);
  };
  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }} hover selected={selected} onClick={() => onEditRow()}>
        <TableCell padding="checkbox" sx={{ p: 1, ...styles.hideOnMd, whiteSpace: 'wrap' }}>
          <Checkbox checked={selected} onClick={onSelectRowClick} />
        </TableCell>

        <TableCell
          sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={handleImageClick}
        >
          <Image
            alt={title}
            src={`https://eup-data.s3.amazonaws.com/eup/uploads/${images?.[0]}`}
            sxImg={{ width: 'auto', height: 'auto', maxWidth: '75px', maxHeight: '50px' }}
          />
        </TableCell>

        <TableCell sx={{ p: 1, ...styles.hideOnMd, whiteSpace: 'wrap' }}>
          <ListItemText
            primary={
              <a
                target="_blank"
                href={`http://kooptop.com/nl/product/${id}/${slug}`}
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
        <TableCell sx={{ p: 1, whiteSpace: 'nowrap' }}>{price_per_piece}</TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnSm, whiteSpace: 'nowrap' }}>
          {variants_count || '-'}
        </TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnSm, whiteSpace: 'nowrap' }}>{ean}</TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnMd, whiteSpace: 'nowrap' }}>
          {free_stock}/{overall_stock}
        </TableCell>
        <TableCell sx={{ p: 1, whiteSpace: 'nowrap' }}>
          <div onClick={(e) => e.stopPropagation()} tabIndex={0}>
            <Switch
              name="is_product_active"
              checked={isActive}
              onChange={handleActiveSwitchChange}
            />
          </div>
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
