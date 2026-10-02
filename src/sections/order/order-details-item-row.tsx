
import { useState, useEffect, memo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import { alpha, Theme } from '@mui/material/styles';

import { fCurrency, roundToTwoDecimals } from 'src/utils/format-number';
import { IMAGE_FOLDER_PATH } from 'src/config-global';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// The product table follows the width of its card, not of the window: the card
// sits in a narrower column on desktop than the full width it gets on a phone.
const ITEMS_MEDIUM = '@container (max-width: 699px)';
const ITEMS_NARROW = '@container (max-width: 519px)';

export const ITEMS_HIDE_MEDIUM = { [ITEMS_MEDIUM]: { display: 'none' } };
export const ITEMS_HIDE_NARROW = { [ITEMS_NARROW]: { display: 'none' } };

export const itemsGridSx = (isVatDocumentPrinted: boolean) => ({
  display: 'grid',
  columnGap: 1.5,
  gridTemplateColumns: `42px minmax(0, 1fr) 76px 68px 52px 84px ${isVatDocumentPrinted ? '' : '84px '}96px`,
  [ITEMS_MEDIUM]: { gridTemplateColumns: '42px minmax(0, 1fr) 76px 68px 52px 96px' },
  [ITEMS_NARROW]: { columnGap: 1, gridTemplateColumns: '38px minmax(0, 1fr) 36px 84px' },
});

type Props = {
  item: any;
  isEditing: boolean;
  isVatDocumentPrinted: boolean;
  onUpdate: (id: string, key: string, value: any) => void;
  onDelete: (id: string) => void;
  onCheckboxChange: (id: string) => void;
  isNewItem?: boolean;
};

function OrderItemRow({
  item,
  isEditing,
  isVatDocumentPrinted,
  onUpdate,
  onDelete,
  onCheckboxChange,
  isNewItem,
}: Props) {
  const [priceInput, setPriceInput] = useState<string>('');

  useEffect(() => {
    // Reset price input when item price changes from outside or when entering/exiting edit mode
    setPriceInput(String(item.single_product_discounted_price_per_unit || ''));
  }, [item.single_product_discounted_price_per_unit, isEditing]);

  const getCurrentPriceInclVat = () => {
    const priceExclVat = parseFloat(priceInput) || 0;
    const vatRate = item.product.vat || 0;
    return roundToTwoDecimals(priceExclVat * (1 + vatRate / 100));
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    // Allow typing decimal numbers
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      setPriceInput(inputValue);
    }
  };

  const handlePriceBlur = () => {
    const priceExclVat = priceInput === '' ? 0 : parseFloat(priceInput) || 0;
    const vatRate = item.product.vat || 0;

    // Calculate price including VAT from excluding VAT
    const priceInclVat = priceExclVat * (1 + vatRate / 100);

    // Call onUpdate for all related fields
    // We can't batch these easily without changing the parent, so we'll call them sequentially
    // The parent should probably wrap these in a single update or use a reducer, 
    // but for now we follow the existing pattern.
    // Actually, to avoid 3 re-renders in parent, we might want to change the parent handler.
    // But since we are memoized, it might be fine. 
    // Optimization: The parent `handleItemChange` updates the `editedCart` state. 
    // Calling it 3 times will trigger 3 state updates. 
    // However, since we are blurring, the user is done typing, so a few re-renders are acceptable.
    // The critical part is *while typing*.

    onUpdate(item.id, 'single_product_discounted_price_per_unit', priceExclVat);
    onUpdate(item.id, 'single_product_discounted_price_per_unit_vat', priceInclVat);
    onUpdate(item.id, 'product_item_total_price_vat', priceInclVat * item.quantity);
  };

  const location = item.product?.location || item.location || '';
  const freeStock = item.product?.free_stock;
  const outOfStock = typeof freeStock === 'number' && freeStock <= 0;
  const listPrice = Number(item.product?.price_per_unit || 0);
  const hasDiscount =
    listPrice > 0 &&
    Math.abs(listPrice - Number(item.single_product_discounted_price_per_unit || 0)) > 0.005;

  const renderProduct = (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flexGrow: 1 }}>
      <Avatar
        src={`${IMAGE_FOLDER_PATH}${item.product.images?.[0]}`}
        variant="rounded"
        sx={{ width: 44, height: 44, ...ITEMS_HIDE_NARROW }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Link
          href={`/dashboard/product/${item.product.id}/edit?tab=0`}
          color="inherit"
          underline="hover"
          target="_blank"
          rel="noopener"
          variant="subtitle2"
          sx={{ display: 'block' }}
        >
          {item.product.title}
        </Link>
        {item.product.ean ? (
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>EAN: {item.product.ean}</Box>
        ) : null}
        {item.product.price_per_piece ? (
          <Box sx={{ typography: 'caption', color: 'text.disabled', ...ITEMS_HIDE_NARROW }}>
            Per stuk: {fCurrency(item.product.price_per_piece)} excl.
            {item.product.price_per_piece_vat
              ? ` · ${fCurrency(item.product.price_per_piece_vat)} incl.`
              : ''}
          </Box>
        ) : null}
        <Box
          sx={{
            display: 'none',
            typography: 'caption',
            color: outOfStock ? 'error.main' : 'text.secondary',
            [ITEMS_NARROW]: { display: 'block' },
          }}
        >
          {location ? `Locatie ${location} · ` : ''}voorraad {freeStock ?? '—'}
        </Box>
      </Box>
    </Stack>
  );

  const rowSx = {
    py: 1.5,
    px: { xs: 0, sm: 1 },
    alignItems: 'center',
    typography: 'body2',
    fontVariantNumeric: 'tabular-nums',
    borderBottom: (theme: Theme) => `solid 1px ${theme.palette.divider}`,
    ...(item.completed && {
      bgcolor: (theme: Theme) => alpha(theme.palette.success.main, 0.08),
    }),
    ...(isNewItem && {
      bgcolor: 'warning.lighter',
    }),
  };

  const renderCheckbox = (
    <Checkbox
      checked={item.completed || false}
      onChange={() => onCheckboxChange(item.id)}
      disabled={!isEditing}
      inputProps={{ 'aria-label': `Klaar: ${item.product.title}` }}
    />
  );

  if (isEditing) {
    return (
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={rowSx}>
        {renderCheckbox}
        <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>{renderProduct}</Box>
        <Stack spacing={0.5} sx={{ width: 100 }}>
          <TextField
            size="small"
            type="number"
            label="Aantal"
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value))}
            inputProps={{
              min: 1,
              max: item.product.free_stock || 1,
            }}
          />
          <Box sx={{ typography: 'caption', color: 'text.disabled' }}>
            Vrije voorraad: {item.product.free_stock}
          </Box>
        </Stack>
        <Stack spacing={0.5} sx={{ width: 130 }}>
          <TextField
            size="small"
            type="text"
            value={priceInput}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            label="Prijs excl. BTW"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*',
            }}
          />
          <Box sx={{ typography: 'caption', color: 'text.disabled', textAlign: 'right' }}>
            Totaal: {fCurrency(getCurrentPriceInclVat() * item.quantity)}
          </Box>
        </Stack>
        <IconButton onClick={() => onDelete(item.id)} aria-label={`Verwijder ${item.product.title}`}>
          <Iconify icon="eva:trash-2-outline" />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Box sx={{ ...itemsGridSx(isVatDocumentPrinted), ...rowSx }}>
      {renderCheckbox}
      {renderProduct}
      <Box sx={ITEMS_HIDE_NARROW}>{location || '—'}</Box>
      <Box
        sx={{
          textAlign: 'right',
          ...(outOfStock && { color: 'error.main', fontWeight: 600 }),
          ...ITEMS_HIDE_NARROW,
        }}
      >
        {freeStock ?? '—'}
      </Box>
      <Box sx={{ textAlign: 'right', fontWeight: 600 }}>{item.quantity}</Box>
      <Box sx={{ textAlign: 'right', ...ITEMS_HIDE_MEDIUM }}>
        {fCurrency(item.single_product_discounted_price_per_unit)}
        {hasDiscount && (
          <Box sx={{ typography: 'caption', color: 'text.disabled', textDecoration: 'line-through' }}>
            {fCurrency(listPrice)}
          </Box>
        )}
      </Box>
      {isVatDocumentPrinted ? null : (
        <Box sx={{ textAlign: 'right', color: 'text.secondary', ...ITEMS_HIDE_MEDIUM }}>
          {fCurrency(item.single_product_discounted_price_per_unit_vat)}
        </Box>
      )}
      <Box sx={{ textAlign: 'right', typography: 'subtitle2' }}>
        {fCurrency(
          (isVatDocumentPrinted
            ? item.single_product_discounted_price_per_unit
            : item.single_product_discounted_price_per_unit_vat) * item.quantity
        )}
      </Box>
    </Box>
  );
}

export default memo(OrderItemRow);
