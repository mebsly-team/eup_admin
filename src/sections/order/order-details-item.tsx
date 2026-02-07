
import React, { useState, useEffect, useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import axiosInstance from 'src/utils/axios';
import { fCurrency, roundToTwoDecimals } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks/use-router';
import { useLocation } from 'react-router-dom';

import OrderItemRow from './order-details-item-row';

export default function OrderDetailsItems({ currentOrder, updateOrder }: { currentOrder: any; updateOrder: any }) {
  const { cart } = currentOrder;
  console.log('cart', cart);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const router = useRouter();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCart, setEditedCart] = useState(currentOrder.cart);
  console.log('editedCart', editedCart);
  const [ean, setEan] = useState(''); // New state for EAN
  const isEditingRef = useRef(false);
  const editedCartRef = useRef(currentOrder.cart);

  // Sorting state
  const queryParams = new URLSearchParams(location.search);
  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || 'title');
  const [sortOrder, setSortOrder] = useState(queryParams.get('sortOrder') || 'asc');

  // Initialize editedCart when component mounts
  useEffect(() => {
    if (cart) {
      editedCartRef.current = cart;
      setEditedCart(cart);
    }
  }, []);

  // Handle cart updates from parent, but don't override when editing
  useEffect(() => {
    if (cart && !isEditingRef.current) {
      editedCartRef.current = cart;
      setEditedCart(cart);
    }
  }, [cart]);

  // Update URL parameters when sorting changes
  const updateSortParams = (newSortBy: string, newSortOrder: string) => {
    const params = new URLSearchParams(location.search);
    params.set('sortBy', newSortBy);
    params.set('sortOrder', newSortOrder);
    router.replace(`${location.pathname}?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateSortParams(newSortBy, newSortOrder);
  };

  // Sort items based on current sort settings
  const getSortedItems = (items: any[]) => {
    if (!items || items.length === 0) return items;

    return [...items].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'ean':
          aValue = a.product?.ean || '';
          bValue = b.product?.ean || '';
          break;
        case 'location':
          aValue = a.location || '';
          bValue = b.location || '';
          break;
        case 'title':
        default:
          aValue = a.product?.title || '';
          bValue = b.product?.title || '';
          break;
      }

      // Convert to strings for comparison if needed
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortOrder === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  };

  const toggleEditMode = () => {
    const newEditingState = !isEditing;
    setIsEditing(newEditingState);
    isEditingRef.current = newEditingState;
  };

  // Fetch product details using EAN
  const handleAddProduct = async (eanSearch: string) => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`);
      if (response.status === 200) {
        const products = response.data;
        if (Array.isArray(products) && products.length > 0) {
          // Get klantpercentage (customer_percentage) from currentOrder.user or default to 10
          const klantpercentage = currentOrder?.user?.customer_percentage ?? 0;
          const discountFactor = 1 - (Number(klantpercentage) / 100);
          // Helper to create new item from product
          const createNewItem = (product: any) => ({
            id: product.id,
            product,
            quantity: 1,
            completed: false,
            single_product_discounted_price_per_unit: Number((Number(product.price_per_unit) * discountFactor).toFixed(2)),
            single_product_discounted_price_per_unit_vat: Number((Number(product.price_per_unit_vat) * discountFactor).toFixed(2)),
          });
          // Collect all products and their variants recursively
          const collectProductsAndVariants = (product: any): any[] => {
            const items: any[] = [createNewItem(product)];
            if (Array.isArray(product.variants)) {
              product.variants.forEach((variant: any) => {
                // If variant has full product info (not just id/slug), add as direct variant
                if (variant.price_per_unit !== undefined) {
                  items.push(createNewItem(variant));
                }
              });
            }
            return items;
          };
          let newItems: any[] = [];

          products.forEach((product: any) => {
            newItems.push(...collectProductsAndVariants(product));
          });

          // Remove duplicates based on product ID
          const seenIds = new Set();
          newItems = newItems.filter((item) => {
            if (seenIds.has(item.id)) {
              return false;
            }
            seenIds.add(item.id);
            return true;
          });

          console.log('New items being added:', newItems);
          setEditedCart((prev: any) => ({ ...prev, items: [...prev.items, ...newItems] }));
          setEan('');
          enqueueSnackbar('Producten succesvol toegevoegd', { variant: 'success' });
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

  const handleItemChange = useCallback((id: any, key: string, value: any) => {
    setEditedCart((prevEditedCart: any) => {
      const updatedItems = prevEditedCart.items.map((item: any) => {
        if (item.id === id) {
          return { ...item, [key]: value };
        }
        return item;
      });
      const newEditedCart = { ...prevEditedCart, items: updatedItems };
      editedCartRef.current = newEditedCart;
      return newEditedCart;
    });
  }, []);

  const handleDeleteItem = useCallback((id: any) => {
    setEditedCart((prevEditedCart: any) => {
      const updatedItems = prevEditedCart.items.filter((item: any) => item.id !== id);
      return { ...prevEditedCart, items: updatedItems };
    });
  }, []);

  const handleCheckboxChange = useCallback((id: any) => {
    setEditedCart((prevEditedCart: any) => {
      const updatedItems = prevEditedCart.items.map((item: any) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      return { ...prevEditedCart, items: updatedItems };
    });
  }, []);

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
      const vatRate = item.product.vat; // VAT percentage
      const vatAmount = roundToTwoDecimals(priceInclVat - priceExclVat);

      // Use the explicit VAT rate from the product
      switch (vatRate) {
        case 0:
          vatTotals.btw0 += roundToTwoDecimals(priceExclVat) * quantity;
          vatTotals.vatAmount0 += 0;
          break;
        case 9:
          vatTotals.btw9 += roundToTwoDecimals(priceExclVat) * quantity;
          vatTotals.vatAmount9 += roundToTwoDecimals(vatAmount * quantity);
          break;
        case 21:
          vatTotals.btw21 += roundToTwoDecimals(priceExclVat) * quantity;
          vatTotals.vatAmount21 += roundToTwoDecimals(vatAmount * quantity);
          break;
        default:
          // Default to 21% if VAT rate is not recognized
          vatTotals.btw21 += roundToTwoDecimals(priceExclVat) * quantity;
          vatTotals.vatAmount21 += roundToTwoDecimals(vatAmount * quantity);
      }
    });

    // Final rounding of accumulated totals
    return {
      btw0: roundToTwoDecimals(vatTotals.btw0),
      btw9: roundToTwoDecimals(vatTotals.btw9),
      btw21: roundToTwoDecimals(vatTotals.btw21),
      vatAmount0: roundToTwoDecimals(vatTotals.vatAmount0),
      vatAmount9: roundToTwoDecimals(vatTotals.vatAmount9),
      vatAmount21: roundToTwoDecimals(vatTotals.vatAmount21),
    };
  };

  const calculateSubtotalExclVat = () => {
    const vatTotals = calculateVatTotals();
    const total = vatTotals.btw0 + vatTotals.btw9 + vatTotals.btw21;
    console.log('Subtotal excl VAT:', total);
    return roundToTwoDecimals(total);
  };

  const calculateSubtotal = () => {
    const vatTotals = calculateVatTotals();
    console.log("🚀 ~ calculateSubtotal ~ vatTotals:", vatTotals)
    const subtotalExclVat = vatTotals.btw0 + vatTotals.btw9 + vatTotals.btw21;
    const totalVat = vatTotals.vatAmount0 + vatTotals.vatAmount9 + vatTotals.vatAmount21;
    const total = roundToTwoDecimals(subtotalExclVat + totalVat);
    console.log('Subtotal excl VAT:', subtotalExclVat);
    console.log('Total VAT:', totalVat);
    console.log('Subtotal incl VAT:', total);
    return currentOrder?.user?.is_vat_document_printed ? subtotalExclVat : total;
  };

  const calculateSubtotalInclVat = () => {
    const vatTotals = calculateVatTotals();
    const subtotalExclVat = vatTotals.btw0 + vatTotals.btw9 + vatTotals.btw21;
    const totalVat = vatTotals.vatAmount0 + vatTotals.vatAmount9 + vatTotals.vatAmount21;
    return roundToTwoDecimals(subtotalExclVat + totalVat);
  };

  const calculateTotal = () => {
    const subtotal = currentOrder?.user?.is_vat_document_printed ? calculateSubtotal() : calculateSubtotalInclVat();
    const shippingFee = Number(editedCart?.shipping_fee) || 0;
    const transactionFee = Number(editedCart?.transaction_fee) || 0;
    const discount = Number(editedCart?.cart_discount) || 0;
    return roundToTwoDecimals(subtotal + shippingFee + transactionFee - discount);
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
        event: `Bestelling bijgewerkt door ${user?.email}: ${changes.join(', ')}`,
      });
    }

    try {
      // Recalculate all cart item prices to ensure consistency
      const updatedCartItems = editedCart.items.map((item: any) => {
        const priceExclVat = Number(item.single_product_discounted_price_per_unit || 0);
        const priceInclVat = Number(item.single_product_discounted_price_per_unit_vat || 0);

        return {
          ...item,
          single_product_discounted_price_per_unit: priceExclVat,
          single_product_discounted_price_per_unit_vat: priceInclVat,
          product_item_total_price: (priceExclVat * item.quantity).toFixed(2),
          product_item_total_price_vat: (priceInclVat * item.quantity).toFixed(2),
        };
      });

      const updatedCart = {
        ...editedCart,
        items: updatedCartItems,
        cart_total_price_vat: calculateSubtotalInclVat().toFixed(2),
        cart_total_price: calculateSubtotalExclVat().toFixed(2),
      };

      // Update the order with the edited cart and calculated totals
      await updateOrder(currentOrder.id, {
        sub_total: calculateSubtotal().toFixed(2),
        total: calculateTotal().toFixed(2),
        cart: updatedCart,
        history: newHistory,
      });

      enqueueSnackbar('Bestelling succesvol bijgewerkt', { variant: 'success' });
      setIsEditing(false);
      isEditingRef.current = false;
    } catch (error) {
      console.error('Error saving order:', error);
      let errorShown = false;
      if (error.response && error.response.data) {
        const data = error.response.data;
        // Handle non_field_errors (array or string)
        if (data.non_field_errors) {
          if (Array.isArray(data.non_field_errors)) {
            data.non_field_errors.forEach((msg: string) => {
              enqueueSnackbar(msg, { variant: 'error' });
              errorShown = true;
            });
          } else if (typeof data.non_field_errors === 'string') {
            enqueueSnackbar(data.non_field_errors, { variant: 'error' });
            errorShown = true;
          }
        }
        // Handle field errors
        Object.entries(data).forEach(([field, errors]) => {
          if (field !== 'non_field_errors' && Array.isArray(errors)) {
            errors.forEach((msg: string) => {
              enqueueSnackbar(`${field}: ${msg}`, { variant: 'error' });
              errorShown = true;
            });
          }
        });
      }
      if (!errorShown) {
        enqueueSnackbar('Fout bij bijwerken van bestelling', { variant: 'error' });
      }
    }
  };

  const handleCancel = () => {
    // Reset changes and toggle edit mode
    setEditedCart(cart);
    setIsEditing(false);
    isEditingRef.current = false;
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

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ my: 3, textAlign: 'right', typography: 'body2' }}
    >
      {currentOrder?.user?.is_vat_document_printed ? null : (() => {
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
      {currentOrder?.user?.is_vat_document_printed ? null : <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>Subtotaal (incl BTW)</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>
          {fCurrency(calculateSubtotal()) || '-'}
        </Box>
      </Stack>}

      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>
          Verzendkosten ({currentOrder?.user?.is_vat_document_printed ? 'excl BTW' : 'incl BTW'})
        </Box>
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
        <Box sx={{ color: 'text.secondary', mr: '0.5rem' }}>
          Transactiekosten ({currentOrder?.user?.is_vat_document_printed ? 'excl BTW' : 'incl BTW'})
        </Box>
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
        <Box sx={{ width: 160, mr: '0.5rem' }}>Totaal ({currentOrder?.user?.is_vat_document_printed ? 'excl BTW' : 'incl BTW'})</Box>
        <Box sx={{ width: 160 }}>{fCurrency(calculateTotal()) || '-'}</Box>
      </Stack>
      <Stack
        direction="row"
        sx={{ typography: 'body2' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box sx={{ width: 160, mr: '0.5rem' }}>Klant totaal om te betalen: ({currentOrder?.user?.is_vat_document_printed ? 'excl BTW' : 'incl BTW'})</Box>
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
        {/* Total Validation Error */}
        {(() => {
          const subtotal = currentOrder?.user?.is_vat_document_printed ? calculateSubtotal() : calculateSubtotalInclVat();
          const calculatedTotal = roundToTwoDecimals(subtotal + (Number(editedCart?.shipping_fee) || 0) + (Number(editedCart?.transaction_fee) || 0) - (Number(editedCart?.cart_discount) || 0));
          const customerTotal = currentOrder?.total || 0;
          const totalMismatch = Math.abs(calculatedTotal - customerTotal) > 0.01 && customerTotal > 0;

          // Fix floating point comparison by using tolerance instead of strict equality
          const cartTotal = currentOrder?.user?.is_vat_document_printed ? (currentOrder?.cart?.cart_total_price || 0) : (currentOrder?.cart?.cart_total_price_vat || 0);
          const totalMismatch2 = Math.abs(subtotal - cartTotal) > 0.01;

          if (totalMismatch || totalMismatch2) {
            return (
              <Box sx={{
                p: 2,
                backgroundColor: 'error.lighter',
                border: '1px solid',
                borderColor: 'error.main',
                borderRadius: 1,
                mb: 2
              }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="eva:alert-triangle-fill" sx={{ color: 'error.main' }} />
                  <Box>
                    <Box sx={{ fontWeight: 600, color: 'error.main', typography: 'body1' }}>
                      Totalen komen niet overeen! Bewerk en sla op om dit te herstellen.
                    </Box>
                    <Box sx={{ color: 'error.main', typography: 'body2' }}>
                      Berekend totaal: {fCurrency(calculatedTotal)} ≠ Klant totaal om te betalen: {fCurrency(customerTotal)}
                    </Box>
                    {totalMismatch2 && <Box sx={{ color: 'error.main', typography: 'body2' }}>
                      Berekend subtotaal: {fCurrency(subtotal)} ≠ Cart subtotaal: {fCurrency(cartTotal)}
                    </Box>}
                  </Box>
                </Stack>
              </Box>
            );
          }
          return null;
        })()}
        {/* Sorting Controls */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sorteer op</InputLabel>
            <Select
              value={sortBy}
              label="Sorteer op"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <MenuItem value="title">Titel</MenuItem>
              <MenuItem value="ean">EAN</MenuItem>
              <MenuItem value="location">Locatie</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSortChange(sortBy)}
            startIcon={
              <Iconify
                icon={sortOrder === 'asc' ? 'eva:arrow-upward-fill' : 'eva:arrow-downward-fill'}
              />
            }
          >
            {sortOrder === 'asc' ? 'Oplopend' : 'Aflopend'}
          </Button>
        </Stack>

        {currentOrder?.extra_note && <Box sx={{ typography: 'body2', mb: 2, p: 3, fontSize: '1.2rem', border: '2px solid', borderColor: 'green' }}>
          Extra nota: {currentOrder?.extra_note}
        </Box>}


        <Scrollbar>
          {getSortedItems(editedCart?.items || []).map((item: any) => (
            <OrderItemRow
              key={item.id}
              item={item}
              isEditing={isEditing}
              isVatDocumentPrinted={currentOrder?.user?.is_vat_document_printed}
              onUpdate={handleItemChange}
              onDelete={handleDeleteItem}
              onCheckboxChange={handleCheckboxChange}
            />
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
