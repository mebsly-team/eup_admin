import { useState, useEffect } from 'react';

import { Switch } from '@mui/material';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { ICampaignItem } from 'src/types/campaign';

import CampaignQuickEditForm from './campaign-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ICampaignItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function CampaignTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const {
    id,
    is_active,
    name,
    description,
    discount_percentage,
    start_date,
    end_date,
    images,
    products,
  } = row;
  const { t, onChangeLang } = useTranslate();
  const [isActive, setIsActive] = useState(is_active);

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();
  const handleActiveSwitchChange = async (e: { target: { checked: any } }) => {
    try {
      const response = await axiosInstance.patch(`/campaigns/${id}/`, {
        is_active: e.target.checked,
      });
      if (response?.data?.is_active !== undefined) {
        setIsActive(response.data.is_active);
      }
    } catch (error) {
      // Revert the switch state if the API call fails
      setIsActive(isActive);
      console.error('Failed to update campaign active status:', error);
    }
  };

  // Keep local state in sync with prop
  useEffect(() => {
    setIsActive(is_active);
  }, [is_active]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Image src={`${IMAGE_FOLDER_PATH}${images?.[0]}`} sx={{ width: '100px', height: '100px' }} />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={name}
            secondary={description}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>{discount_percentage}</TableCell>

        <TableCell>
          <Switch name="is_active" checked={isActive} onChange={handleActiveSwitchChange} />
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

      <CampaignQuickEditForm
        currentCampaign={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
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
