
import { useState, useEffect, memo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

import { fCurrency, roundToTwoDecimals } from 'src/utils/format-number';
import { IMAGE_FOLDER_PATH } from 'src/config-global';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  item: any;
  isEditing: boolean;
  isVatDocumentPrinted: boolean;
  onUpdate: (id: string, key: string, value: any) => void;
  onDelete: (id: string) => void;
  onCheckboxChange: (id: string) => void;
};

function OrderItemRow({
  item,
  isEditing,
  isVatDocumentPrinted,
  onUpdate,
  onDelete,
  onCheckboxChange,
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

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        py: 3,
        borderBottom: (theme) => `dashed 2px ${theme.palette.background.neutral}`,
      }}
    >
      <Checkbox
        checked={item.completed || false}
        onChange={() => onCheckboxChange(item.id)}
        disabled={!isEditing}
      />
      <Avatar
        src={`${IMAGE_FOLDER_PATH}${item.product.images?.[0]}`}
        variant="rounded"
        sx={{ width: 48, height: 48, mr: 2 }}
      />
      <ListItemText
        primary={
          <Link
            href={`/dashboard/product/${item.product.id}/edit?tab=0`}
            color="inherit"
            underline="hover"
            target="_blank"
            rel="noopener"
          >
            {item.product.title}
          </Link>
        }
        secondary={
          <>
            {item.product.ean ? (
              <Box
                component="span"
                sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}
              >
                EAN: {item.product.ean}
              </Box>
            ) : null}
            {item.product.price_per_piece ? (
              <Box
                component="span"
                sx={{
                  typography: 'caption',
                  display: 'block',
                  color: 'text.disabled',
                  mt: 0.5,
                }}
              >
                Prijs per stuk (exc BTW): {fCurrency(item.product.price_per_piece)}
              </Box>
            ) : null}
            {item.product.price_per_piece_vat ? (
              <Box
                component="span"
                sx={{
                  typography: 'caption',
                  display: 'block',
                  color: 'text.disabled',
                  mt: 0.5,
                }}
              >
                Prijs per stuk (incl BTW): {fCurrency(item.product.price_per_piece_vat)}
              </Box>
            ) : null}
            {item.product.price_per_piece_vat ? (
              <Box
                component="span"
                sx={{
                  typography: 'caption',
                  display: 'block',
                  color: 'text.disabled',
                  mt: 0.5,
                }}
              >
                ----
              </Box>
            ) : null}
            <Box
              component="span"
              sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}
            >
              Prijs (exc BTW): {fCurrency(item.product.price_per_unit)}
            </Box>
            <Box
              component="span"
              sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}
            >
              Prijs (incl BTW): {fCurrency(item.product.price_per_unit_vat)}
            </Box>
            ----
            <Box
              component="span"
              sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}
            >
              Met korting (exc BTW): {fCurrency(item.single_product_discounted_price_per_unit)}
            </Box>
            <Box
              component="span"
              sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}
            >
              Met korting (incl BTW):{' '}
              {fCurrency(item.single_product_discounted_price_per_unit_vat)}
            </Box>
          </>
        }
        primaryTypographyProps={{ typography: 'body2' }}
        secondaryTypographyProps={{ component: 'div', color: 'text.disabled', mt: 0.5 }}
      />

      {isEditing ? (
        <>
          <Stack spacing={0.5} sx={{ width: 100, mr: 3 }}>
            <TextField
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value))}
              inputProps={{
                min: 1,
                max: item.product.free_stock || 1,
              }}
            />
            {
              <Box sx={{ typography: 'caption', color: 'text.disabled', textAlign: 'left' }}>
                Vrije voorraad: {item.product.free_stock}
              </Box>
            }
          </Stack>
          <Stack spacing={0.5}>
            <TextField
              type="text"
              value={priceInput}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              sx={{ width: 100, textAlign: 'right' }}
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
          <IconButton onClick={() => onDelete(item.id)}>
            <Iconify icon="eva:trash-2-outline" />
          </IconButton>
        </>
      ) : (
        <>
          <Stack spacing={0.5} sx={{ minWidth: 120 }}>
            <Box sx={{ typography: 'caption', textAlign: 'right' }}>
              (excl BTW) {item.quantity} x {fCurrency(item.single_product_discounted_price_per_unit)}
            </Box>
            {isVatDocumentPrinted ? null : (
              <Box sx={{ typography: 'caption', textAlign: 'right' }}>
                (incl BTW) {item.quantity} x{' '}
                {fCurrency(item.single_product_discounted_price_per_unit_vat)}
              </Box>
            )}
            <Box sx={{ typography: 'subtitle2', textAlign: 'right' }}>
              Totaal:{' '}
              {fCurrency(
                (isVatDocumentPrinted
                  ? item.single_product_discounted_price_per_unit
                  : item.single_product_discounted_price_per_unit_vat) * item.quantity
              )}
            </Box>
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default memo(OrderItemRow);
