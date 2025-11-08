import { useState } from 'react';

import Box from '@mui/material/Box';
import { Switch } from '@mui/material';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { MAP_USER_COLORS } from 'src/constants/colors';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IUserItem } from 'src/types/user';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const {
    id,
    relation_code,
    fullname,
    business_name,
    last_login,
    kvk,
    vat,
    type,
    is_active,
    email,
    phone_number,
    contact_person_phone_number,
    contact_person_name,
    contact_person_email,
    site_source,
    customer_color,
    classification
  } = row;
  const { t, onChangeLang } = useTranslate();
  const [isActive, setIsActive] = useState(is_active);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const allowedEmails = ['info@europowerbv.com', 'm.sahin@europowerbv.nl'];
  const canToggle = allowedEmails.includes(currentUser?.email);

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();
  const handleActiveSwitchChange = async (e: { target: { checked: any } }) => {
    if (!canToggle) return;
    const response = await axiosInstance.patch(`/users/${id}/`, {
      is_active: e.target.checked,
    });
    setIsActive(response?.data?.is_active ?? isActive);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={`ID: ${relation_code || '-'} `}
            secondary={<img style={{ height: 16, width: 16 }} src={`/assets/icons/home/${site_source === "europowerbv.com" ? "europowerbv.png" : "kooptop.png"}`} alt="icon" />}
            // secondary={`Relaticode: ${relation_code || '-'}`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          {/* <Avatar alt={name} src={avatarUrl} sx={{ mr: 2 }} /> */}

          <ListItemText
            primary={business_name || fullname}
            secondary={t(type)}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={email}
            secondary={`Tel: ${phone_number}`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={contact_person_name || '-'}
            secondary={contact_person_phone_number}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={kvk || '-'}
            secondary={vat}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          {customer_color ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: customer_color,
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}
              />
              <Box component="span" sx={{ typography: 'body2' }}>
                {MAP_USER_COLORS.find((c) => c.color === customer_color)?.labelNL || customer_color}
              </Box>
            </Box>
          ) : (
            <Box component="span" sx={{ typography: 'body2', color: 'text.disabled' }}>
              -
            </Box>
          )}
        </TableCell>

        <TableCell>
          <Box component="span" sx={{ typography: 'body2' }}>
            {classification || '-'}
          </Box>
        </TableCell>

        <TableCell>
          <Switch name="is_active" checked={isActive} disabled={!canToggle} onChange={handleActiveSwitchChange} />
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

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

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
