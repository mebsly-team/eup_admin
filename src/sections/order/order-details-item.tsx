import React, { useState, useEffect } from 'react';
import Link from '@mui/material/Link';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import axiosInstance from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';

export default function OrderDetailsItems({ currentOrder, updateOrder }) {
  const { cart } = currentOrder;
  console.log('cart', cart);
  const { enqueueSnackbar } = useSnackbar();

  const [isEditing, setIsEditing] = useState(false);
  const [editedCart, setEditedCart] = useState(currentOrder.cart);
  console.log('editedCart', editedCart);
  const [ean, setEan] = useState(''); // New state for EAN

  useEffect(() => {
    if (cart) setEditedCart(cart);
  }, [cart]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Fetch product details using EAN
  const handleAddProduct = async (eanSearch: string) => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`);
      if (response.status === 200) {
        const product = response.data?.[0];
        if (product) {
          // Get klantpercentage (customer_percentage) from currentOrder.user or default to 10
          const klantpercentage = currentOrder?.user?.customer_percentage ?? 0;
          const discountFactor = 1 - (Number(klantpercentage) / 100);
          const discountedPricePerUnit = Number((Number(product.price_per_unit) * discountFactor).toFixed(2));
          const discountedPricePerUnitVat = Number((Number(product.price_per_unit_vat) * discountFactor).toFixed(2));
          const newItem = {
            id: product.id,
            product,
            quantity: 1,
            completed: false,
            single_product_discounted_price_per_unit: discountedPricePerUnit,
            single_product_discounted_price_per_unit_vat: discountedPricePerUnitVat,
          };
          setEditedCart((prev: { items: any }) => ({ ...prev, items: [...prev.items, newItem] }));
          setEan('');
          enqueueSnackbar('Product succesvol toegevoegd', { variant: 'success' });
        } else {
          enqueueSnackbar('Product niet gevonden', { variant: 'error' });
        }
      } else {
        console.error('Failed to fetch product, status code:', response.status);
        enqueueSnackbar(`API fout: ${response.status}`, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      enqueueSnackbar('Fout bij toevoegen van product', { variant: 'error' });
    }
  };

  const handleVariantChange = async (item: any, variantId: any) => {
    try {
      const response = await axiosInstance.get(`/products/${variantId}/?nocache=true`);
      if (response.status === 200) {
        const product = response.data;
        if (product) {
          const newItem = {
            id: product.id,
            product,
            quantity: 1,
            completed: false,
            single_product_discounted_price_per_unit: product.price_per_unit,
            single_product_discounted_price_per_unit_vat: product.price_per_unit_vat,
          };
          const updatedItems = editedCart.items.filter((i: any) => item.id !== i.id);
          console.log('updatedItems', updatedItems)
          setEditedCart({ ...editedCart, items: [...updatedItems, newItem] });
        }
      } else {
        console.error('Failed to fetch product, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };
  const handleItemChange = (id: any, key: string, value: any) => {
    const updatedItems = editedCart.items.map((item: any) => {
      if (item.id === id) {
        // If changing quantity, validate against free_stock
        if (key === 'quantity') {
          const maxQuantity = item.product.free_stock || 1;
          const validatedValue = Math.min(Math.max(1, value), maxQuantity);
          return { ...item, [key]: validatedValue };
        }
        return { ...item, [key]: value };
      }
      return item;
    });
    setEditedCart({ ...editedCart, items: updatedItems });
  };

  const handleDeleteItem = (id: any) => {
    const updatedItems = editedCart.items.filter((item: any) => item.id !== id);
    setEditedCart({ ...editedCart, items: updatedItems });
  };

  const calculateVatTotals = () => {
    const vatTotals = {
      btw0: 0,
      btw9: 0,
      btw21: 0,
      vatAmount0: 0,
      vatAmount9: 0,
      vatAmount21: 0
    };
    editedCart?.items.forEach((item: any) => {
      const quantity = item.quantity;
      const priceExclVat = Number(item.single_product_discounted_price_per_unit || 0);
      const priceInclVat = Number(item.single_product_discounted_price_per_unit_vat || 0);
      const vatAmount = priceInclVat - priceExclVat;
      const vatRate = item.product.vat / 100; // Convert percentage to decimal

      // Use the explicit VAT rate from the product
      switch (item.product.vat) {
        case 0:
          vatTotals.btw0 += priceExclVat * quantity;
          vatTotals.vatAmount0 += 0;
          break;
        case 9:
          vatTotals.btw9 += priceExclVat * quantity;
          vatTotals.vatAmount9 += vatAmount * quantity;
          break;
        case 21:
          vatTotals.btw21 += priceExclVat * quantity;
          vatTotals.vatAmount21 += vatAmount * quantity;
          break;
        default:
          // Default to 21% if VAT rate is not recognized
          vatTotals.btw21 += priceExclVat * quantity;
          vatTotals.vatAmount21 += vatAmount * quantity;
      }
    });

    return vatTotals;
  };

  const calculateSubtotalExclVat = () => {
    const vatTotals = calculateVatTotals();
    const total = vatTotals.btw0 + vatTotals.btw9 + vatTotals.btw21;
    console.log('Subtotal excl VAT:', total);
    return total;
  };

  const calculateSubtotal = () => {
    const vatTotals = calculateVatTotals();
    const subtotalExclVat = vatTotals.btw0 + vatTotals.btw9 + vatTotals.btw21;
    const totalVat = vatTotals.vatAmount0 + vatTotals.vatAmount9 + vatTotals.vatAmount21;
    const total = subtotalExclVat + totalVat;
    console.log('Subtotal excl VAT:', subtotalExclVat);
    console.log('Total VAT:', totalVat);
    console.log('Subtotal incl VAT:', total);
    return currentOrder?.user?.is_vat_document_printed ? subtotalExclVat : total;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = Number(editedCart?.shipping_fee) || 0;
    const transactionFee = Number(editedCart?.transaction_fee) || 0;
    const discount = Number(editedCart?.cart_discount) || 0;
    return subtotal + shippingFee + transactionFee - discount;
  };

  const handleSave = async () => {
    const changes = [];
    const newHistory = [...currentOrder.history]; // Clone the existing history

    // Check for changes in items
    editedCart.items.forEach((editedItem: any) => {
      const originalItem = cart.items.find((item: any) => item.id === editedItem.id);
      if (!originalItem) {
        changes.push(`Toegevoegd item: ${editedItem.product.title}`);
        return;
      }

      if (editedItem.quantity !== originalItem.quantity) {
        changes.push(
          `Bijgewerkte hoeveelheid van ${editedItem.product.title} van ${originalItem.quantity} naar ${editedItem.quantity}`
        );
      }

      if (editedItem.product.price_per_unit_vat !== originalItem.product.price_per_unit_vat) {
        changes.push(
          `Prijs van ${editedItem.product.title} bijgewerkt van ${fCurrency(
            originalItem.product.price_per_unit_vat
          )} naar ${fCurrency(editedItem.product.price_per_unit_vat)}`
        );
      }

      if (editedItem.completed !== originalItem.completed) {
        changes.push(
          `${editedItem.completed ? 'Klaar' : 'Onklaar'} item: ${editedItem.product.title}`
        );
      }
    });

    // Check for deleted items
    cart.items.forEach((originalItem: any) => {
      if (!editedCart.items.find((editedItem: any) => editedItem.id === originalItem.id)) {
        changes.push(`Verwijderd item: ${originalItem.product.title}`);
      }
    });
    // Check for changes in fees and discounts
    if (editedCart.shipping_fee !== cart.shipping_fee) {
      changes.push(
        `Verzendkosten bijgewerkt van ${fCurrency(cart.shipping_fee)} naar  ${fCurrency(
          editedCart.shipping_fee
        )}`
      );
    }

    if (editedCart.transaction_fee !== cart.transaction_fee) {
      changes.push(
        `Transactiekosten bijgewerkt van ${fCurrency(cart.transaction_fee)} naar ${fCurrency(
          editedCart.transaction_fee
        )}`
      );
    }

    if (editedCart.cart_discount !== cart.cart_discount) {
      changes.push(
        `Korting bijgewerkt van ${fCurrency(cart.cart_discount)} naar ${fCurrency(
          editedCart.cart_discount
        )}`
      );
    }

    // Only update the history if there are changes
    if (changes.length > 0) {
      newHistory.push({
        date: new Date(),
        event: `Bestelling bijgewerkt door ${currentOrder?.shipping_address?.email || currentOrder?.user?.email
          }: ${changes.join(', ')}`,
      });
    }

    try {
      // Update the order with the edited cart and calculated totals
      await updateOrder(currentOrder.id, {
        sub_total: calculateSubtotal().toFixed(2),
        total: calculateTotal().toFixed(2),
        cart: {
          ...editedCart,
          cart_total_price_vat: calculateSubtotal().toFixed(2),
          cart_total_price: calculateTotal().toFixed(2),
        },
        history: newHistory,
      });

      enqueueSnackbar('Bestelling succesvol bijgewerkt', { variant: 'success' });
      toggleEditMode();
    } catch (error) {
      console.error('Error saving order:', error);
      enqueueSnackbar('Fout bij bijwerken van bestelling', { variant: 'error' });
    }
  };

  const handleCancel = () => {
    // Reset changes and toggle edit mode
    setEditedCart(cart);
    toggleEditMode();
  };

  const handleFeeChange = (key: string, value: any) => {
    // Only allow numbers and decimal points
    const sanitizedValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    // Allow empty string or valid number
    if (sanitizedValue === '' || !isNaN(parseFloat(sanitizedValue))) {
      setEditedCart({ ...editedCart, [key]: sanitizedValue });
    }
  };

  const handleFeeBlur = (key: string, value: any) => {
    // If empty or invalid, set to empty string
    if (!value || value === '' || isNaN(parseFloat(value))) {
      setEditedCart({ ...editedCart, [key]: '' });
      return;
    }

    // Format valid number to 2 decimal places
    const formattedValue = parseFloat(value).toFixed(2);
    setEditedCart({ ...editedCart, [key]: formattedValue });
  };

  const handleCheckboxChange = (id: any) => {
    const updatedItems = editedCart.items.map((item: any) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setEditedCart({ ...editedCart, items: updatedItems });
  };
  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ my: 3, textAlign: 'right', typography: 'body2' }}
    >
      {(() => {
        const vatTotals = calculateVatTotals();
        return (
          <>
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>BTW 0%</Box>
              <Box sx={{ width: 160, typography: 'subtitle2' }}>
                {fCurrency(vatTotals.vatAmount0) || "-"}
              </Box>
            </Stack>
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>BTW 9%</Box>
              <Box sx={{ width: 160, typography: 'subtitle2' }}>
                {fCurrency(vatTotals.vatAmount9) || "-"}
              </Box>
            </Stack>
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>BTW 21%</Box>
              <Box sx={{ width: 160, typography: 'subtitle2' }}>
                {fCurrency(vatTotals.vatAmount21) || "-"}
              </Box>
            </Stack>
          </>
        );
      })()}
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Subtotaal (excl BTW)</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>
          {fCurrency(calculateSubtotalExclVat()) || '-'}
        </Box>
      </Stack>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Subtotaal (incl BTW)</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>
          {fCurrency(calculateSubtotal()) || '-'}
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Verzendkosten</Box>
        {isEditing ? (
          <TextField
            type="text"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*'
            }}
            value={editedCart?.shipping_fee ?? ''}
            onChange={(e) => handleFeeChange('shipping_fee', e.target.value)}
            onBlur={(e) => handleFeeBlur('shipping_fee', e.target.value)}
            sx={{ width: 160 }}
          />
        ) : (
          <Box sx={{ width: 160 }}>{fCurrency(editedCart?.shipping_fee) || '-'}</Box>
        )}
      </Stack>

      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Transactiekosten</Box>
        {isEditing ? (
          <TextField
            type="text"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*'
            }}
            value={editedCart?.transaction_fee ?? ''}
            onChange={(e) => handleFeeChange('transaction_fee', e.target.value)}
            onBlur={(e) => handleFeeBlur('transaction_fee', e.target.value)}
            sx={{ width: 160 }}
          />
        ) : (
          <Box sx={{ width: 160 }}>{fCurrency(editedCart?.transaction_fee) || '-'}</Box>
        )}
      </Stack>

      {/* <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Korting</Box>
        {isEditing ? (
          <TextField
            type="text"
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*'
            }}
            value={editedCart?.cart_discount ?? ''}
            onChange={(e) => handleFeeChange('cart_discount', e.target.value)}
            onBlur={(e) => handleFeeBlur('cart_discount', e.target.value)}
            sx={{ width: 160 }}
          />
        ) : (
          <Box sx={{ width: 160, mr: '0.5rem' }}>{fCurrency(editedCart?.cart_discount) || '-'}</Box>
        )}
      </Stack> */}

      <Stack
        direction="row"
        sx={{ typography: 'subtitle1' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box sx={{ width: 160, mr: '0.5rem' }}>Totaal</Box>
        <Box sx={{ width: 160 }}>{fCurrency(calculateTotal()) || '-'}</Box>
      </Stack>
      <Stack
        direction="row"
        sx={{ typography: 'body2', color: 'text.disabled' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box sx={{ width: 160, mr: '0.5rem' }}>Klant totaal om te betalen:</Box>
        <Box sx={{ width: 160 }}>{fCurrency(currentOrder?.total) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Card>
      <CardHeader
        title="Details"
        action={
          <IconButton onClick={toggleEditMode}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />

      <Stack sx={{ px: 3 }}>
        <Scrollbar>
          {editedCart?.items.map((item: any) => (
            <Stack
              key={item.id}
              direction="row"
              alignItems="center"
              sx={{
                py: 3,
                borderBottom: (theme) => `dashed 2px ${theme.palette.background.neutral}`,
              }}
            >
              <Checkbox
                checked={item.completed || false}
                onChange={() => handleCheckboxChange(item.id)}
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
                    {item.product.ean ? <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}>
                      EAN: {item.product.ean}
                    </Box> : null}
                    {item.product.free_stock ? <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}>
                      Vrije voorraad: {item.product.free_stock}
                    </Box> : null}
                    {item.product.price_per_piece ? <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled', mt: 0.5 }}>
                      Prijs per stuk (exc BTW): {fCurrency(item.product.price_per_piece)}
                    </Box> : null}
                    {item.product.price_per_piece_vat ? <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled', mt: 0.5 }}>
                      Prijs per stuk (incl BTW): {fCurrency(item.product.price_per_piece_vat)}
                    </Box> : null}
                    {item.product.price_per_piece_vat ? <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled', mt: 0.5 }}>
                      ----
                    </Box> : null}
                    <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}>
                      Prijs (exc BTW): {fCurrency(item.product.price_per_unit)}
                    </Box>
                    <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}>
                      Prijs (incl BTW): {fCurrency(item.product.price_per_unit_vat)}
                    </Box>
                    ----
                    <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}>
                      Met korting (exc BTW): {fCurrency(item.single_product_discounted_price_per_unit)}
                    </Box>
                    <Box component="span" sx={{ typography: 'caption', display: 'block', color: 'text.disabled' }}>
                      Met korting (incl BTW): {fCurrency(item.single_product_discounted_price_per_unit_vat)}
                    </Box>

                  </>
                }
                primaryTypographyProps={{ typography: 'body2' }}
                secondaryTypographyProps={{ component: 'div', color: 'text.disabled', mt: 0.5 }}
              />

              {isEditing ? (
                <>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, 'quantity', parseInt(e.target.value))
                    }
                    inputProps={{
                      min: 1,
                      max: item.product.free_stock || 1
                    }}
                    sx={{ width: 60, mr: 2 }}
                  />
                  <Stack spacing={0.5}>
                    <TextField
                      type="number"
                      value={item.single_product_discounted_price_per_unit_vat}
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value);
                        handleItemChange(item.id, 'single_product_discounted_price_per_unit_vat', newPrice);
                        handleItemChange(item.id, 'product_item_total_price_vat', newPrice * item.quantity);
                      }}
                      sx={{ width: 100, textAlign: 'right' }}
                      label="Prijs incl. BTW"
                    />
                    <Box sx={{ typography: 'caption', color: 'text.disabled', textAlign: 'right' }}>
                      Totaal: {fCurrency(item.single_product_discounted_price_per_unit_vat * item.quantity)}
                    </Box>
                  </Stack>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Stack spacing={0.5} sx={{ minWidth: 120 }}>
                    <Box sx={{ typography: 'caption', textAlign: 'right' }}>
                      (excl BTW) {item.quantity} x {fCurrency(item.single_product_discounted_price_per_unit)}
                    </Box>
                    <Box sx={{ typography: 'caption', textAlign: 'right' }}>
                      (incl BTW) {item.quantity} x {fCurrency(item.single_product_discounted_price_per_unit_vat)}
                    </Box>
                    <Box sx={{ typography: 'subtitle2', textAlign: 'right' }}>
                      Totaal: {fCurrency(item.single_product_discounted_price_per_unit_vat * item.quantity)}
                    </Box>
                  </Stack>
                </>
              )}
            </Stack>
          ))}
        </Scrollbar>
        {isEditing && (
          <Stack direction="row" spacing={2} sx={{ my: 2 }}>
            <TextField
              label="EAN"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
              sx={{ width: 200 }}
            />
            <Button variant="contained" onClick={() => handleAddProduct(ean)}>
              Product toevoegen
            </Button>
          </Stack>
        )}
        {renderTotal}

        {isEditing && (
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Annuleren
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Opslaan
            </Button>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
