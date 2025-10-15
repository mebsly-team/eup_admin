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
import { HOST_API, IMAGE_FOLDER_PATH } from 'src/config-global';

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
  onToggleVisibility: VoidFunction;
};
const hostUrl = HOST_API.includes('kooptop') ? 'kooptop.com' : '52.28.100.129:3000';

export default function ProductTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onEditStock,
  handleLightBoxSlides,
  onToggleVisibility,
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
    is_visible_particular,
    is_visible_B2B,
    siblings_count
  } = row;
  const { enqueueSnackbar } = useSnackbar();

  const [isActive, setIsActive] = useState(is_visible_particular);
  const [isActiveB2B, setIsActiveB2B] = useState(is_visible_B2B);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const allowedEmails = ['info@europowerbv.com', 'm.sahin@europowerbv.nl'];
  const canToggle = allowedEmails.includes(currentUser?.email);
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

    if (!canToggle) {
      return; // Do nothing if not superuser
    }

    try {
      const response = await axiosInstance.put(`/products/${id}/`, {
        is_visible_particular: e.target.checked,
        title,
      });
      setIsActive(response?.data?.is_visible_particular ?? isActive);
    } catch (error) {
      console.error('Missing Fields:', error);
      const missingFields = Object.values(error)?.[0] || [];
      missingFields.forEach((element) => {
        enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
      });
    }
  };
  const handleActiveSwitchChange2 = async (e) => {
    e.stopPropagation(); // Stop event propagation

    if (!canToggle) {
      return; // Do nothing if not superuser
    }

    try {
      const response = await axiosInstance.put(`/products/${id}/`, {
        is_visible_B2B: e.target.checked,
        title,
      });
      setIsActiveB2B(response?.data?.is_visible_B2B ?? isActiveB2B);
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
      <style>
        {`
          .links {
            display: none;
          }
          .has-links:hover .links {
            display: inline;
          }
        `}
      </style>
      <TableRow sx={{ cursor: 'pointer' }} hover selected={selected} onClick={() => onEditRow()}>
        <TableCell padding="checkbox" sx={{ p: 1, whiteSpace: 'wrap' }}>
          <Checkbox checked={selected} onClick={onSelectRowClick} />
        </TableCell>

        <TableCell
          sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={handleImageClick}
        >
          <Image
            alt={title}
            src={`${IMAGE_FOLDER_PATH}${images?.[0]}`}
            sxImg={{ width: 'auto', height: 'auto', maxWidth: '75px', maxHeight: '50px' }}
          />
        </TableCell>

        <TableCell sx={{ p: 1, ...styles.hideOnMd, whiteSpace: 'wrap' }} className="has-links">
          <ListItemText
            primary={title}
            secondary={description}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
          <span className="links">
            {is_visible_particular && (
              <a
                target="_blank"
                href={`https://kooptop.com/product/${id}/${slug}`}
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                WEB
              </a>
            )}
            {'  '}
            {is_visible_B2B && (
              <a
                target="_blank"
                href={`https://europowerbv.com/product/${id}/${slug}`}
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                B2B
              </a>
            )}
          </span>
        </TableCell>
        <TableCell sx={{ p: 1, whiteSpace: 'nowrap' }}>{price_per_piece}</TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnSm, whiteSpace: 'nowrap' }}>
          {variants_count || '-'}
        </TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnSm, whiteSpace: 'nowrap' }}>
          {siblings_count || '-'}
        </TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnSm, whiteSpace: 'nowrap' }}>{ean}</TableCell>
        <TableCell sx={{ p: 1, ...styles.hideOnMd, whiteSpace: 'nowrap' }}>
          {free_stock}/{overall_stock}
        </TableCell>

        <TableCell
          sx={{ p: 1, whiteSpace: 'nowrap', pointerEvents: is_product_active ? 'auto' : 'none' }}
        >
          <div onClick={(e) => e.stopPropagation()} tabIndex={0}>
            <Switch
              name="is_visible_particular"
              checked={isActive}
              disabled={!canToggle || !is_product_active}
              onChange={handleActiveSwitchChange}
            />
          </div>
        </TableCell>
        <TableCell
          sx={{ p: 1, whiteSpace: 'nowrap', pointerEvents: is_product_active ? 'auto' : 'none' }}
        >
          <div onClick={(e) => e.stopPropagation()} tabIndex={0}>
            <Switch
              name="is_visible_B2B"
              checked={isActiveB2B}
              disabled={!canToggle || !is_product_active}
              onChange={handleActiveSwitchChange2}
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
            onToggleVisibility();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon={is_product_active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
          {is_product_active ? t('hide') : t('show')}
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
