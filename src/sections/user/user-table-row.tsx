import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { MAP_USER_COLORS } from 'src/constants/colors';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IUserItem } from 'src/types/user';

import { ColorDot } from './user-table-toolbar';

// ----------------------------------------------------------------------

export const USER_TABLE_COLUMNS = 9;

// Columns leave in two steps as the window narrows; what they showed moves
// under the customer name.
export const HIDE_BELOW_LG = { display: { xs: 'none', lg: 'table-cell' } };
export const HIDE_BELOW_MD = { display: { xs: 'none', md: 'table-cell' } };

const ACTIVE_EDITORS = [
  'info@europowerbv.com',
  'm.sahin@europowerbv.nl',
  'hatice.sahin@europowerbv.nl',
];

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onActiveChange: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onActiveChange,
}: Props) {
  const {
    id,
    relation_code,
    fullname,
    business_name,
    kvk,
    vat,
    type,
    is_active,
    email,
    phone_number,
    site_source,
    customer_color,
    classification,
  } = row as any;

  const { t } = useTranslate();
  const [isActive, setIsActive] = useState(is_active);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canToggle = ACTIVE_EDITORS.includes(currentUser?.email);

  const confirm = useBoolean();
  const popover = usePopover();

  const handleActiveSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canToggle) return;
    const response = await axiosInstance.patch(`/users/${id}/`, {
      is_active: event.target.checked,
    });
    setIsActive(response?.data?.is_active ?? isActive);
    onActiveChange();
  };

  const name = business_name || fullname || email;
  const site = site_source === 'europowerbv.com' ? 'europowerbv.com' : 'kooptop.com';
  const colorLabel = MAP_USER_COLORS.find((c) => c.color === customer_color)?.labelNL;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ 'aria-label': `Selecteer ${name}` }}
          />
        </TableCell>

        <TableCell sx={{ px: 1, fontVariantNumeric: 'tabular-nums', ...HIDE_BELOW_MD }}>
          {relation_code || '—'}
        </TableCell>

        <TableCell sx={{ px: 1, maxWidth: { xs: '42vw', md: 320 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Link
              component={RouterLink}
              href={paths.dashboard.user.edit(id)}
              variant="subtitle2"
              color="inherit"
              noWrap
              title={name}
            >
              {name}
            </Link>
            <Tooltip title={site}>
              <img
                style={{ height: 16, width: 16, flexShrink: 0 }}
                src={`/assets/icons/home/${site === 'europowerbv.com' ? 'europowerbv.png' : 'kooptop.png'}`}
                alt={site}
              />
            </Tooltip>
          </Stack>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {t(type)}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: 'text.secondary', display: { xs: 'block', md: 'none' } }}
          >
            {relation_code ? `${relation_code} · ` : ''}
            {email}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 1, maxWidth: 260, ...HIDE_BELOW_MD }}>
          <Typography variant="body2" noWrap title={email}>
            {email}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {phone_number || '—'}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap', ...HIDE_BELOW_LG }}>
          <Typography variant="body2">{kvk || '—'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {vat}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap', ...HIDE_BELOW_MD }}>
          {customer_color ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <ColorDot color={customer_color} />
              <Typography variant="body2">{colorLabel || customer_color}</Typography>
            </Stack>
          ) : (
            <Box component="span" sx={{ color: 'text.disabled' }}>
              —
            </Box>
          )}
        </TableCell>

        <TableCell sx={{ px: 1, ...HIDE_BELOW_LG, ...(!classification && { color: 'text.disabled' }) }}>
          {classification || '—'}
        </TableCell>

        <TableCell sx={{ px: 1 }}>
          <Switch
            name="is_active"
            checked={isActive}
            disabled={!canToggle}
            onChange={handleActiveSwitchChange}
            inputProps={{ 'aria-label': `Actief: ${name}` }}
          />
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
