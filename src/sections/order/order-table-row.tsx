import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import Label, { LabelColor } from 'src/components/label';

import { IOrderItem } from 'src/types/order';

// ----------------------------------------------------------------------

export const ORDER_TABLE_COLUMNS = 10;

const STATUS_COLOR: Record<string, LabelColor> = {
  pending_order: 'warning',
  user_pending: 'error',
  werkbon: 'info',
  packing: 'secondary',
  shipped: 'primary',
  delivered: 'success',
  confirmed: 'success',
  cancelled: 'error',
};

const SOURCE_ICON: Record<string, string> = {
  'europowerbv.com': 'europowerbv.png',
  'bol.com': 'bol.ico',
};

const LINE_COLUMNS = 'minmax(220px, 1fr) 140px 110px 150px 150px 120px';

type Props = {
  row: IOrderItem;
  selected: boolean;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
};

export default function OrderTableRow({ row, selected, onViewRow, onSelectRow }: Props) {
  const {
    cart,
    extra_note,
    id,
    is_paid,
    ordered_date,
    payment_reference,
    status,
    total,
    user,
    source_host,
    is_sent_to_snelstart,
    snelstart_order_number,
  } = row as any;

  const { t } = useTranslate();

  const collapse = useBoolean();

  const items: any[] = cart?.items || [];

  const customerName =
    user?.business_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  const hasTime = typeof ordered_date === 'string' && ordered_date.includes('T');

  const paymentLabel = (
    <Label
      variant="soft"
      color={is_paid ? 'success' : 'error'}
      startIcon={
        <Box
          sx={{
            m: '4px',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'currentColor',
          }}
        />
      }
      sx={{ cursor: 'inherit' }}
    >
      {t(is_paid ? 'paid' : 'unpaid')}
    </Label>
  );

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ 'aria-label': `Selecteer bestelling ${id}` }}
        />
      </TableCell>

      <TableCell sx={{ px: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Link
            component="button"
            type="button"
            onClick={onViewRow}
            variant="subtitle2"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            #{id}
          </Link>
          <Tooltip title={source_host || 'kooptop.com'}>
            <img
              style={{ height: 16, width: 16 }}
              src={`/assets/icons/home/${SOURCE_ICON[source_host] || 'kooptop.png'}`}
              alt={source_host || 'kooptop.com'}
            />
          </Tooltip>
        </Stack>
      </TableCell>

      <TableCell sx={{ px: 1, maxWidth: 280 }}>
        <Typography variant="subtitle2" noWrap>
          {customerName || user?.email}
        </Typography>
        <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
          R.C. {user?.relation_code}
          {customerName ? ` · ${user?.email}` : ''}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{fDate(ordered_date)}</Typography>
        {hasTime && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fTime(ordered_date)}
          </Typography>
        )}
      </TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        {items.length}
      </TableCell>

      <TableCell
        align="right"
        sx={{ px: 1, pr: 2, typography: 'subtitle2', whiteSpace: 'nowrap' }}
      >
        {fCurrency(total || 0)}
      </TableCell>

      <TableCell sx={{ px: 1 }}>
        {payment_reference ? (
          <Link
            href={`https://my.mollie.com/dashboard/${'org_1065131'}/payments/${payment_reference}`}
            target="_blank"
            rel="noopener"
            underline="none"
          >
            {paymentLabel}
          </Link>
        ) : (
          paymentLabel
        )}
      </TableCell>

      <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Typography
          variant="body2"
          sx={{
            fontVariantNumeric: 'tabular-nums',
            ...(!snelstart_order_number && { color: 'text.disabled' }),
          }}
        >
          {snelstart_order_number || '—'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: is_sent_to_snelstart ? 'text.secondary' : 'warning.dark',
            fontWeight: is_sent_to_snelstart ? 400 : 600,
          }}
        >
          {is_sent_to_snelstart ? 'Verzonden' : 'Nog niet verzonden'}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 1 }}>
        {extra_note === 'offer' ? (
          <Label variant="soft" color="info">
            Offer
          </Label>
        ) : (
          <Label variant="soft" color={STATUS_COLOR[status] || 'default'}>
            {t(status)}
          </Label>
        )}
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          onClick={collapse.onToggle}
          aria-expanded={collapse.value}
          aria-label={`Toon producten van bestelling ${id}`}
          sx={{ ...(collapse.value && { bgcolor: 'action.hover' }) }}
        >
          <Iconify
            icon="eva:arrow-ios-downward-fill"
            sx={{ transition: 'transform 0.2s', ...(collapse.value && { transform: 'rotate(180deg)' }) }}
          />
        </IconButton>

        <IconButton onClick={onViewRow} aria-label={`Open bestelling ${id}`}>
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={ORDER_TABLE_COLUMNS}>
        <Collapse in={collapse.value} timeout="auto" unmountOnExit>
          <Box sx={{ pl: { xs: 2, md: 7 }, pr: 2, pt: 0.5, pb: 2, bgcolor: 'background.neutral' }}>
            <Box
              sx={{
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'background.paper',
                overflowX: 'auto',
              }}
            >
              <Box sx={{ minWidth: 900 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: LINE_COLUMNS,
                    columnGap: 1.5,
                    px: 1.5,
                    py: 1,
                    typography: 'overline',
                    color: 'text.secondary',
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Box>Product</Box>
                  <Box>EAN</Box>
                  <Box sx={{ textAlign: 'right' }}>{t('free_stock')}</Box>
                  <Box sx={{ textAlign: 'right' }}>Excl. BTW</Box>
                  <Box sx={{ textAlign: 'right' }}>Incl. BTW</Box>
                  <Box sx={{ textAlign: 'right' }}>Regeltotaal</Box>
                </Box>

                {items.map((item, index) => {
                  const freeStock = item.product?.free_stock;
                  const outOfStock = typeof freeStock === 'number' && freeStock <= 0;

                  return (
                    <Box
                      key={item.id ?? index}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: LINE_COLUMNS,
                        columnGap: 1.5,
                        alignItems: 'center',
                        px: 1.5,
                        py: 1,
                        typography: 'body2',
                        fontVariantNumeric: 'tabular-nums',
                        borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                        <Avatar
                          src={`${IMAGE_FOLDER_PATH}${item.product?.images?.[0]}`}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography variant="body2">{item.product?.title}</Typography>
                      </Stack>

                      <Box sx={{ color: 'text.secondary' }}>{item.product?.ean || '—'}</Box>

                      <Box
                        sx={{
                          textAlign: 'right',
                          ...(outOfStock && { color: 'error.main', fontWeight: 600 }),
                        }}
                      >
                        {freeStock ?? '—'}
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        {item.quantity} × {fCurrency(item.single_product_discounted_price_per_unit)}
                      </Box>

                      <Box sx={{ textAlign: 'right', color: 'text.secondary' }}>
                        {item.quantity} ×{' '}
                        {fCurrency(item.single_product_discounted_price_per_unit_vat)}
                      </Box>

                      <Box sx={{ textAlign: 'right', fontWeight: 600 }}>
                        {fCurrency(
                          item.product_item_total_price_vat ||
                            Number(item.single_product_discounted_price_per_unit_vat) *
                              item.quantity
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}
    </>
  );
}
