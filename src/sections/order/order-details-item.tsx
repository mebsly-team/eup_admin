import React, { useState, useEffect } from 'react';

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

export default function OrderDetailsItems({ currentOrder, updateOrder }) {
  const { cart } = currentOrder;
  console.log('cart', cart);

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
  const getProductDetails = async (eanSearch: string) => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`);
      if (response.status === 200) {
        const product = response.data?.[0];
        if (product) {
          const newItem = {
            id: product.id,
            product,
            quantity: 1,
            completed: false,
          };
          setEditedCart((prev: { items: any }) => ({ ...prev, items: [...prev.items, newItem] }));
          setEan('');
        }
      } else {
        console.error('Failed to fetch product, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleVariantChange = async (item, variantId) => {
    try {
      const response = await axiosInstance.get(`/products/${variantId}/`);
      if (response.status === 200) {
        const product = response.data;
        if (product) {
          const newItem = {
            id: product.id,
            product,
            quantity: 1,
            completed: false,
          };
          const updatedItems = editedCart.items.filter((i) => item.id !== i.id);
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
  const handleItemChange = (id, key, value) => {
    const updatedItems = editedCart.items.map((item) =>
      item.id === id ? { ...item, [key]: value } : item
    );
    setEditedCart({ ...editedCart, items: updatedItems });
  };

  const handleDeleteItem = (id) => {
    const updatedItems = editedCart.items.filter((item) => item.id !== id);
    setEditedCart({ ...editedCart, items: updatedItems });
  };

  const calculateSubtotal = () =>
    editedCart?.items.reduce((acc, item) => acc + item.product.price_per_unit_vat * item.quantity, 0);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = Number(editedCart?.shipping_fee) || 0;
    const transactionFee = Number(editedCart?.transaction_fee) || 0;
    const discount = Number(editedCart?.cart_discount) || 0;
    return subtotal + shippingFee + transactionFee - discount;
  };

  const handleSave = () => {
    const changes = [];
    const newHistory = [...currentOrder.history]; // Clone the existing history

    // Check for changes in items
    editedCart.items.forEach((editedItem) => {
      const originalItem = cart.items.find((item) => item.id === editedItem.id);
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
    cart.items.forEach((originalItem) => {
      if (!editedCart.items.find((editedItem) => editedItem.id === originalItem.id)) {
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
        event: `Bestelling bijgewerkt door ${
          currentOrder?.shipping_address?.email || currentOrder?.user?.email
        }: ${changes.join(', ')}`,
      });
    }

    // Update the order with the edited cart and calculated totals
    updateOrder(currentOrder.id, {
      sub_total: calculateSubtotal().toFixed(2),
      total: calculateTotal().toFixed(2),
      cart: { ...editedCart, total_price: calculateSubtotal().toFixed(2) },
      history: newHistory,
    });

    toggleEditMode();
  };

  const handleCancel = () => {
    // Reset changes and toggle edit mode
    setEditedCart(cart);
    toggleEditMode();
  };

  const handleFeeChange = (key, value) => {
    setEditedCart({ ...editedCart, [key]: parseFloat(value).toFixed(2) || 0 });
  };

  const handleCheckboxChange = (id) => {
    const updatedItems = editedCart.items.map((item) =>
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
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Subtotaal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>
          {fCurrency(calculateSubtotal()) || '-'}
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Verzendkosten</Box>
        {isEditing ? (
          <TextField
            type="number"
            value={editedCart?.shipping_fee || 0}
            onChange={(e) => handleFeeChange('shipping_fee', e.target.value)}
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
            type="number"
            value={editedCart?.transaction_fee || 0}
            onChange={(e) => handleFeeChange('transaction_fee', e.target.value)}
            sx={{ width: 160 }}
          />
        ) : (
          <Box sx={{ width: 160 }}>{fCurrency(editedCart?.transaction_fee) || '-'}</Box>
        )}
      </Stack>

      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Korting</Box>
        {isEditing ? (
          <TextField
            type="number"
            value={editedCart?.cart_discount || 0}
            onChange={(e) => handleFeeChange('cart_discount', e.target.value)}
            sx={{ width: 160 }}
          />
        ) : (
          <Box sx={{ width: 160, mr: '0.5rem' }}>{fCurrency(editedCart?.cart_discount) || '-'}</Box>
        )}
      </Stack>

      <Stack
        direction="row"
        sx={{ typography: 'subtitle1' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box sx={{ width: 160, mr: '0.5rem' }}>Totaal</Box>
        <Box sx={{ width: 160 }}>{fCurrency(calculateTotal()) || '-'}</Box>
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
          {editedCart?.items.map((item) => (
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
                primary={item.product.title}
                secondary={item.product.article_code}
                primaryTypographyProps={{ typography: 'body2' }}
                secondaryTypographyProps={{ component: 'span', color: 'text.disabled', mt: 0.5 }}
              />

              {isEditing ? (
                <>
                  <Select
                    value={item.product.id}
                    onChange={(e) => handleVariantChange(item, e.target.value)}
                    label=""
                  >
                    <MenuItem value={item.product.id}>{item.product.unit}</MenuItem>
                    {item?.product?.variants.map((v, i) => (
                      <MenuItem key={i} value={v.id}>
                        {v.unit}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, 'quantity', parseInt(e.target.value))
                    }
                    sx={{ width: 60, mr: 2 }}
                  />
                  <TextField
                    type="number"
                    value={item.product.price_per_unit_vat}
                    onChange={(e) =>
                      handleItemChange(item.id, 'price_per_unit_vat', parseFloat(e.target.value))
                    }
                    sx={{ width: 80, mr: 2, textAlign: 'right' }}
                  />
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Box sx={{ typography: 'body2' }}>x{item.quantity}</Box>
                  <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                    {fCurrency(item.product.price_per_unit_vat)}
                  </Box>
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
            <Button variant="contained" onClick={() => getProductDetails(ean)}>
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
