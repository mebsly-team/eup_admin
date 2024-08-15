import { Key, ReactNode, ReactPortal, ReactElement, JSXElementConstructor } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

type Props = {
  row: IOrderItem;
  selected: boolean;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function OrderTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const {
    cart,
    delivered_date,
    extra_note,
    id,
    invoice_address,
    is_invoice_address_same_with_shipping,
    is_paid,
    ordered_date,
    payment_reference,
    shipped_date,
    shipping_address,
    status,
    sub_total,
    total,
    user,
  } = row;
  const { t, onChangeLang } = useTranslate();
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
    hideOnLg: {
      [theme.breakpoints.down('lg')]: {
        display: 'none',
      },
    },
    hideOnXl: {
      [theme.breakpoints.down('xl')]: {
        display: 'none',
      },
    },
  };
  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell sx={{ padding: 0 }}>
        <Box
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {id}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center', width: '150px' }}>
        <ListItemText
          primary={user.email}
          secondary={`Relatie Code: ${user.relation_code}`}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>

      <TableCell sx={{ padding: 1, ...styles.hideOnMd, width: '80px' }}>
        <ListItemText
          primary={fDate(ordered_date)}
          secondary={fTime(delivered_date) || t('not_delivered')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            typography: 'body2',
            noWrap: true,
          }}
        />
      </TableCell>

      <TableCell align="center" sx={{ padding: 1 }}>
        {cart.items?.length}
      </TableCell>

      <TableCell sx={{ padding: 1 }}>
        <ListItemText
          primary={fCurrency(total)}
          secondary={
            <Link
              href={`https://my.mollie.com/dashboard/${'org_1065131'}/payments/${payment_reference}`}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ cursor: 'pointer' }}
            >
              <Label
                variant="soft"
                color={is_paid ? 'success' : 'error'}
                sx={{ cursor: 'pointer' }}
              >
                {t(is_paid ? 'paid' : 'unpaid')}
              </Label>
            </Link>
          }
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            typography: 'body2',
            noWrap: true,
          }}
        />
      </TableCell>

      <TableCell sx={{ width: 110, padding: 1 }}>
        <Label
          variant="soft"
          color={
            (status === 'delivered' && 'success') ||
            (status === 'pending_order' && 'warning') ||
            (status === 'pending_offer' && 'warning') ||
            (status === 'cancelled' && 'error') ||
            'default'
          }
        >
          {t(status)}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>
            {cart.items.map(
              (
                item: {
                  id: Key | null | undefined;
                  product: {
                    images: (string | undefined)[];
                    title:
                      | string
                      | number
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | ReactPortal
                      | null
                      | undefined;
                    article_code: any;
                    categories: { name: any }[];
                    location: any;
                    extra_location: any;
                    price_per_piece: string | number | null;
                    quantity_per_unit: any;
                    price_per_unit: string | number | null;
                  };
                  quantity: any;
                },
                i
              ) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  sx={{
                    p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                    '&:not(:last-of-type)': {
                      borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
                    },
                  }}
                >
                  <Avatar
                    src={`${IMAGE_FOLDER_PATH}${item?.product?.images?.[0]}`}
                    variant="rounded"
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />

                  <ListItemText
                    primary={item.product?.title}
                    secondary={`${t('article_code')}: ${item.product?.article_code}`}
                    primaryTypographyProps={{
                      typography: 'caption',
                      noWrap: false,
                      maxWidth: '175px',
                      overflow: 'hidden',
                      whiteSpace: 'pre-wrap',
                      textOverflow: 'ellipsis',
                    }}
                    secondaryTypographyProps={{
                      typography: 'caption',
                    }}
                  />

                  <ListItemText
                    sx={{ padding: 1, ...styles.hideOnLg }}
                    primary={t('categories')}
                    secondary={item.product?.categories
                      ?.map((cat: { name: any }) => cat.name)
                      .join(',')}
                    primaryTypographyProps={{
                      typography: 'caption',
                    }}
                    secondaryTypographyProps={{
                      typography: 'caption',
                      sx: {
                        maxWidth: 100,
                        wordBreak: 'break-all', // This is the correct CSS property to use
                      },
                    }}
                  />
                  <ListItemText
                    primary={`${t('location')}: ${item.product?.location}`}
                    secondary={`${t('location')}2: ${item.product?.extra_location}`}
                    primaryTypographyProps={{
                      typography: 'caption',
                    }}
                    secondaryTypographyProps={{
                      typography: 'caption',
                    }}
                  />

                  <ListItemText
                    primary={t('price_per_piece')}
                    secondary={fCurrency(item.product?.price_per_piece)}
                    primaryTypographyProps={{
                      typography: 'caption',
                    }}
                    secondaryTypographyProps={{
                      typography: 'caption',
                    }}
                  />
                  <ListItemText
                    primary={`${t('amount')}: x${item.quantity}`}
                    secondary={`${t('quantity_per_unit')}: ${item.product?.quantity_per_unit}`}
                    primaryTypographyProps={{
                      typography: 'caption',
                    }}
                    secondaryTypographyProps={{
                      typography: 'caption',
                    }}
                  />
                  <Box sx={{ width: 110, textAlign: 'right' }}>
                    {`${item.quantity} x ${fCurrency(item.product?.price_per_unit)}`}
                  </Box>
                </Stack>
              )
            )}
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Bekijk
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
