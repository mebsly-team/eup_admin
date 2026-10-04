import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IProductItem, IProductSupplierSummary } from 'src/types/product';

// ----------------------------------------------------------------------

export const PRODUCT_TABLE_COLUMNS = 11;

// Below this share of the selling price the margin is shown as a warning.
const LOW_MARGIN_PCT = 15;

const VISIBILITY_EDITORS = [
  'info@europowerbv.com',
  'm.sahin@europowerbv.nl',
  'hatice.sahin@europowerbv.nl',
];

// Always two decimals: cost prices are compared at cent level.
const priceFormat = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IProductItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  handleLightBoxSlides: (images: string[]) => void;
  onToggleVisibility: VoidFunction;
  onVisibilityChange: VoidFunction;
};

export default function ProductTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleLightBoxSlides,
  onToggleVisibility,
  onVisibilityChange,
}: Props) {
  const {
    id,
    images,
    title,
    ean,
    is_product_active,
    price_per_piece,
    price_cost,
    overall_stock,
    free_stock,
    min_stock_value,
    variants_count,
    slug,
    is_visible_particular,
    is_visible_B2B,
    siblings_count,
    supplier,
    supplier_offers,
    vat,
  } = row as any;

  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const [isActive, setIsActive] = useState<boolean>(is_visible_particular);
  const [isActiveB2B, setIsActiveB2B] = useState<boolean>(is_visible_B2B);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canToggle = VISIBILITY_EDITORS.includes(currentUser?.email);

  const confirm = useBoolean();
  const popover = usePopover();

  const handleVisibility =
    (field: 'is_visible_particular' | 'is_visible_B2B') =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!canToggle) return;

      const [current, setCurrent] =
        field === 'is_visible_particular' ? [isActive, setIsActive] : [isActiveB2B, setIsActiveB2B];

      try {
        const response = await axiosInstance.put(`/products/${id}/`, {
          [field]: event.target.checked,
          title,
        });
        setCurrent(response?.data?.[field] ?? current);
        onVisibilityChange();
      } catch (error) {
        console.error('Missing Fields:', error);
        const missingFields: any = Object.values(error)?.[0] || [];
        missingFields.forEach((element: string) => {
          enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
        });
      }
    };

  const price = Number(price_per_piece) || 0;
  const cost = Number(price_cost) || 0;
  const marginPct = price > 0 && cost > 0 ? Math.round(((price - cost) / price) * 100) : null;

  const free = Number(free_stock) || 0;
  const overall = Number(overall_stock) || 0;
  const minStock = Number(min_stock_value) || 0;
  const outOfStock = free <= 0;
  const lowStock = !outOfStock && minStock > 0 && free <= minStock;
  const stockColor = (outOfStock && 'error') || (lowStock && 'warning') || 'success';

  const offers: IProductSupplierSummary[] = supplier_offers || [];

  const counts = [
    variants_count ? `${variants_count} ${variants_count === 1 ? 'bundel' : 'bundels'}` : '',
    siblings_count ? `${siblings_count} ${siblings_count === 1 ? 'variant' : 'varianten'}` : '',
  ].filter(Boolean);

  const shopLinks = [
    {
      show: is_product_active && isActive,
      host: 'kooptop.com',
      icon: 'kooptop.png',
    },
    {
      show: is_product_active && isActiveB2B,
      host: 'europowerbv.com',
      icon: 'europowerbv.png',
    },
  ].filter((shop) => shop.show);

  return (
    <>
      <TableRow hover selected={selected} onClick={onEditRow} sx={{ cursor: 'pointer' }}>
        <TableCell padding="checkbox" onClick={stopPropagation}>
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ 'aria-label': `Selecteer ${title}` }}
          />
        </TableCell>

        <TableCell sx={{ px: 1, maxWidth: 420 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Avatar
              alt={title}
              src={images?.[0] ? `${IMAGE_FOLDER_PATH}${images[0]}` : undefined}
              variant="rounded"
              onClick={(event) => {
                event.stopPropagation();
                handleLightBoxSlides(images || []);
              }}
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                bgcolor: 'background.neutral',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                '& img': { objectFit: 'contain' },
              }}
            >
              <Iconify icon="solar:box-linear" sx={{ color: 'text.disabled' }} />
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Link
                  component={RouterLink}
                  href={`${paths.dashboard.product.edit(String(id))}?tab=0`}
                  onClick={stopPropagation}
                  variant="subtitle2"
                  color="inherit"
                  noWrap
                  title={title}
                >
                  {title}
                </Link>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', mr: 0.5 }}
                >
                  {ean || '—'}
                </Typography>

                {shopLinks.map((shop) => (
                  <Tooltip key={shop.host} title={`Bekijk op ${shop.host}`}>
                    <Box
                      component="a"
                      href={`https://${shop.host}/product/${id}/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Bekijk op ${shop.host}`}
                      onClick={stopPropagation}
                      sx={{
                        width: 26,
                        height: 26,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 0.75,
                        border: (theme) => `solid 1px ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <img
                        src={`/assets/icons/home/${shop.icon}`}
                        alt=""
                        style={{ width: 16, height: 16 }}
                      />
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          </Stack>
        </TableCell>

        <TableCell sx={{ px: 1, maxWidth: 240 }}>
          {offers.length > 0 ? (
            <Stack spacing={0.5}>
              {offers.map((offer) => (
                <Tooltip
                  key={offer.supplier_id}
                  placement="left"
                  title={`Inkoopprijs ${
                    offer.purchase_price !== null ? fCurrency(offer.purchase_price) || '€ 0' : '—'
                  }${
                    offer.stock_updated_at
                      ? ` · voorraad bijgewerkt ${fDateTime(offer.stock_updated_at, 'dd-MM-yyyy HH:mm')}`
                      : ''
                  }`}
                >
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Link
                      component={RouterLink}
                      href={paths.dashboard.supplier.edit(String(offer.supplier_id))}
                      onClick={stopPropagation}
                      variant="body2"
                      color="inherit"
                      noWrap
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        ...(offer.supplier_id === supplier?.id && offers.length > 1 && { fontWeight: 600 }),
                      }}
                    >
                      {offer.supplier_name}
                    </Link>
                    <Typography
                      variant="caption"
                      sx={{
                        flexShrink: 0,
                        fontVariantNumeric: 'tabular-nums',
                        color: offer.stock_free > 0 ? 'info.dark' : 'text.disabled',
                      }}
                    >
                      {offer.stock_free} / {offer.stock_total}
                    </Typography>
                  </Stack>
                </Tooltip>
              ))}
            </Stack>
          ) : supplier?.id ? (
            <Link
              component={RouterLink}
              href={paths.dashboard.supplier.edit(String(supplier.id))}
              onClick={stopPropagation}
              variant="body2"
              color="inherit"
              noWrap
              sx={{ display: 'block' }}
            >
              {supplier.name || '—'}
            </Link>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        <TableCell
          align="right"
          sx={{ px: 1, pr: 2, typography: 'subtitle2', whiteSpace: 'nowrap' }}
        >
          {price > 0 ? priceFormat.format(price) : '—'}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, pr: 2, whiteSpace: 'nowrap' }}>
          <Typography variant="body2">{cost > 0 ? priceFormat.format(cost) : '—'}</Typography>
          {cost > 0 ? (
            marginPct !== null && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: marginPct < LOW_MARGIN_PCT ? 'error.main' : 'success.dark',
                }}
              >
                Marge {marginPct}%
              </Typography>
            )
          ) : (
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.dark' }}>
              Geen kostprijs
            </Typography>
          )}
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Typography
            variant="body2"
            sx={{ ...(!counts.length && { color: 'text.disabled' }) }}
          >
            {counts.join(' · ') || '—'}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>{vat}%</TableCell>

        <TableCell sx={{ px: 1, pr: 2, whiteSpace: 'nowrap' }}>
          <Typography
            variant="body2"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              ...(outOfStock && { color: 'error.main', fontWeight: 600 }),
              ...(lowStock && { color: 'warning.dark', fontWeight: 600 }),
            }}
          >
            {free} / {overall}
          </Typography>
          <LinearProgress
            variant="determinate"
            color={stockColor}
            value={overall > 0 ? Math.min(100, Math.max(0, (free / overall) * 100)) : 0}
            sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
          />
        </TableCell>

        <TableCell sx={{ px: 1 }} onClick={stopPropagation}>
          <Switch
            checked={isActive}
            disabled={!canToggle || !is_product_active}
            onChange={handleVisibility('is_visible_particular')}
            inputProps={{ 'aria-label': `Zichtbaar voor particulieren: ${title}` }}
          />
        </TableCell>

        <TableCell sx={{ px: 1 }} onClick={stopPropagation}>
          <Switch
            checked={isActiveB2B}
            disabled={!canToggle || !is_product_active}
            onChange={handleVisibility('is_visible_B2B')}
            inputProps={{ 'aria-label': `Zichtbaar voor B2B: ${title}` }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }} onClick={stopPropagation}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            aria-label={`Acties voor ${title}`}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top">
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
            onToggleVisibility();
            popover.onClose();
          }}
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
