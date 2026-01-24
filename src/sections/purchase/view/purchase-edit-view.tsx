import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'src/routes/hooks';
import { format } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { DatePicker } from '@mui/x-date-pickers';

import { paths } from 'src/routes/paths';

import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import axiosInstance from 'src/utils/axios';

import { IPurchaseItem } from 'src/types/purchase';
import { ISupplierItem } from 'src/types/supplier';
import { IProductItem } from 'src/types/product';
import PurchaseDetailsHistory from './purchase-details-history';
import { countries } from 'src/assets/data/countries';

type PurchaseHistory = {
  id: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
  user: string;
};

export default function PurchaseEditView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const [currentPurchase, setCurrentPurchase] = useState<IPurchaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<ISupplierItem[]>([]);
  const [eanSearch, setEanSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplierItem | null>(null);
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [previousPurchases, setPreviousPurchases] = useState<IPurchaseItem[]>([]);
  const [previousOffers, setPreviousOffers] = useState<IPurchaseItem[]>([]);

  const getVatRate = useCallback((supplierCountry?: string, itemVat?: number) => {
    if (!supplierCountry) return 0;
    return supplierCountry === 'NL' ? (Number(itemVat) || 0) : 0;
  }, []);

  const getCountryName = useCallback((code?: string) => {
    if (!code) return 'Unknown';
    const country = countries.find(c => c.code === code);
    return country ? country.label : code;
  }, []);

  const calculateItemTax = useCallback((supplierCountry?: string, itemVat?: number) => {
    const code = (supplierCountry || '').toString();
    const upper = code.toUpperCase();
    const isNL = upper === 'NL' || upper === 'NLD' || code.toLowerCase() === 'netherlands';
    return isNL ? Number(itemVat || 0) : 0;
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/suppliers/?limit=9999');
      setSuppliers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t]);

  const fetchPurchase = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/purchases/${id}/`);

      console.log("🔍 Fetch Purchase API Response:", response.data);
      console.log("🔍 Purchase Items:", response.data.items);
      console.log("🔍 Purchase Totals:", {
        total_exc_btw: response.data.total_exc_btw,
        total_vat: response.data.total_vat,
        total_inc_btw: response.data.total_inc_btw
      });

      if (response.data.items && response.data.items.length > 0) {
        console.log("🔍 First Item Details:", response.data.items[0]);
        console.log("🔍 First Item product_purchase_price:", response.data.items[0].product_purchase_price);
        console.log("🔍 First Item vat_rate:", response.data.items[0].vat_rate);
        console.log("🔍 First Item product_detail:", response.data.items[0].product_detail);
      }

      const purchaseData = {
        ...response.data,
        items: response.data.items?.map((item: any) => {
          const appliedVat = getVatRate(
            response.data.supplier_detail?.supplier_country,
            item.vat ?? item.vat_rate ?? item.product_detail?.vat
          );
          return {
            ...item,
            vat: appliedVat,
            vat_rate: appliedVat,
          };
        }) || []
      };

      console.log("🔍 Processed Purchase Data:", purchaseData);
      console.log("🔍 Processed Items with VAT:", purchaseData.items);

      purchaseData.items.forEach((item: any, index: number) => {
        console.log(`🔍 Item ${index + 1} VAT Rate:`, item.vat_rate);
      });

      setCurrentPurchase(purchaseData);
      setHistory(response.data.history || []);
      setSelectedSupplier(response.data?.supplier_detail);

      calculateTotals(purchaseData.items, response.data?.supplier_detail?.supplier_country);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      enqueueSnackbar(t('failed_to_fetch_purchase'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, enqueueSnackbar, t]);

  const fetchPreviousPurchases = useCallback(async (supplierId: string) => {
    try {
      const response = await axiosInstance.get(`/purchases/?type=purchase&supplier=${supplierId}`);
      setPreviousPurchases(response.data.results || []);
    } catch (error) {
      console.error('Error fetching previous purchases:', error);
      enqueueSnackbar(t('failed_to_fetch_previous_purchases'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t]);

  const fetchPreviousOffers = useCallback(async (supplierId: string) => {
    try {
      const response = await axiosInstance.get(`/purchases/?type=offer&supplier=${supplierId}`);
      setPreviousOffers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching previous offers:', error);
      enqueueSnackbar(t('failed_to_fetch_previous_offers'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t]);

  useEffect(() => {
    fetchPurchase();
    fetchSuppliers();
  }, [fetchPurchase, fetchSuppliers]);

  // Fetch previous purchases and offers when the component first loads with an existing supplier
  useEffect(() => {
    if (selectedSupplier?.id) {
      fetchPreviousPurchases(selectedSupplier.id);
      fetchPreviousOffers(selectedSupplier.id);
    }
  }, [selectedSupplier?.id, fetchPreviousPurchases, fetchPreviousOffers]);

  const handleSupplierChange = (event: any, newValue: ISupplierItem | null) => {
    console.log("🚀 ~ handleSupplierChange ~ newValue:", newValue)
    setSelectedSupplier(newValue);

    if (newValue) {
      fetchPreviousPurchases(newValue.id);
      fetchPreviousOffers(newValue.id);

      const country = newValue.supplier_country;
      setCurrentPurchase((prev) => {
        if (!prev) return prev;

        const updatedItems = prev.items.map((item) => {
          const baseVat = (item as any).product_detail?.vat ?? (item as any).vat ?? (item as any).vat_rate;
          const appliedVat = getVatRate(country, baseVat);
          return {
            ...item,
            vat: appliedVat,
            vat_rate: appliedVat,
          };
        });

        const updated = {
          ...prev,
          items: updatedItems,
        };

        calculateTotals(updatedItems);
        return updated;
      });
    } else {
      setPreviousPurchases([]);
      setPreviousOffers([]);
    }
  };

  const handleAddProduct = async () => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`);
      if (response.data?.length > 0) {
        const product = response.data[0];
        console.log("🔍 API Product Data:", product);
        console.log("🔍 Product price_cost:", product.price_cost);
        console.log("🔍 Product vat:", product.vat);

        const vatRate = getVatRate(selectedSupplier?.supplier_country, product.vat);

        const newItem = {
          id: crypto.randomUUID(),
          product: product.id,
          product_detail: {
            id: product.id,
            title: product.title,
            images: product.images,
            ean: product.ean,
            price_cost: product.price_cost || '0',
            vat: vatRate,
            overall_stock: product.overall_stock || 0,
            free_stock: product.free_stock || 0,
            min_stock_value: product.min_stock_value || 0,
            min_order_amount: product.min_order_amount || 0,
            max_stock_at_rack: product.max_stock_at_rack || 0,
          },
          product_quantity: 1,
          product_purchase_price: product.price_cost || '0',
          vat: vatRate,
          vat_rate: vatRate,
        };

        console.log("🔍 New Item Created:", newItem);
        console.log("🔍 New Item product_purchase_price:", newItem.product_purchase_price);
        console.log("🔍 New Item vat_rate:", newItem.vat_rate);

        setCurrentPurchase((prev) => {
          const updated = {
            ...prev!,
            items: [...prev!.items, newItem],
          };
          console.log("🔍 Updated Purchase Items:", updated.items);
          return updated;
        });
        setEanSearch('');
        calculateTotals([...currentPurchase!.items, newItem]);
        enqueueSnackbar(t('product_added_to_purchase'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('product_not_found'), { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      enqueueSnackbar(t('failed_to_fetch_product'), { variant: 'error' });
    }
  };

  const handleRemoveProduct = (itemId: string) => {
    const updatedItems = currentPurchase!.items.filter((item) => item.id !== itemId);
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
  };

  useEffect(() => {
    if (currentPurchase?.items && currentPurchase.items.length > 0) {
      const country = selectedSupplier?.supplier_country || (currentPurchase as any)?.supplier_detail?.supplier_country;
      calculateTotals(currentPurchase.items, country);
    }
  }, [currentPurchase?.items, selectedSupplier?.supplier_country]);

  const calculateTotals = (items: IPurchaseItem['items'], supplierCountryOverride?: string) => {
    console.log('🔍 calculateTotals called with items:', items);
    console.log('🔍 Items length:', items.length);

    try {
      const totals = items.reduce(
        (acc: any, item, index) => {
          console.log(`🔍 Processing item ${index + 1}:`, item);
          console.log(`🔍 Item ID: ${item.id}`);
          console.log(`🔍 Product detail:`, item.product_detail);
          console.log(`🔍 Product purchase price: ${item.product_purchase_price}`);
          console.log(`🔍 VAT: ${(item as any).vat}`);
          console.log(`🔍 Quantity: ${item.product_quantity}`);

          const priceCost = Number(String(item.product_purchase_price ?? '0').replace(',', '.'));
          const baseVat = Number((item as any).product_detail?.vat ?? (item as any).vat ?? (item as any).vat_rate ?? 0);
          const vat = calculateItemTax(supplierCountryOverride ?? selectedSupplier?.supplier_country, baseVat);
          const quantity = item.product_quantity;

          if (isNaN(priceCost) || isNaN(vat) || !quantity) {
            console.warn('❌ Missing data for calculation:', { priceCost, vat, quantity, item });
            return acc;
          }

          const itemPrice = Number(priceCost) * quantity;
          const itemVat = itemPrice * (Number(vat) / 100);

          console.log(`🔍 Item calculation: priceCost=${priceCost}, vat=${vat}, quantity=${quantity}`);
          console.log(`🔍 Item price: ${itemPrice}, Item VAT: ${itemVat}`);

          if (isNaN(itemPrice) || isNaN(itemVat)) {
            console.warn('❌ Invalid calculation result:', { itemPrice, itemVat, item });
            return acc;
          }

          const newAcc = {
            totalExcBtw: acc.totalExcBtw + itemPrice,
            totalVat: acc.totalVat + itemVat,
            totalVat9: acc.totalVat9 + (vat === 9 ? itemVat : 0),
            totalVat21: acc.totalVat21 + (vat === 21 ? itemVat : 0),
          };

          console.log(`🔍 Running totals: excBtw=${newAcc.totalExcBtw}, vat=${newAcc.totalVat}`);
          return newAcc;
        },
        { totalExcBtw: 0, totalVat: 0, totalVat9: 0, totalVat21: 0 }
      );

      const totalIncBtw = totals.totalExcBtw + totals.totalVat;

      console.log('🔍 Final totals:', {
        totalExcBtw: totals.totalExcBtw,
        totalVat: totals.totalVat,
        totalIncBtw: totalIncBtw
      });

      setCurrentPurchase((prev) => {
        const updated = {
          ...prev!,
          total_exc_btw: totals.totalExcBtw.toFixed(2),
          total_inc_btw: totalIncBtw.toFixed(2),
          total_vat: totals.totalVat.toFixed(2),
          total_vat_9: Number(totals.totalVat9).toFixed(2),
          total_vat_21: Number(totals.totalVat21).toFixed(2),
        };
        console.log('🔍 Updated purchase totals:', updated);
        return updated;
      });
    } catch (error) {
      console.error('❌ Error calculating totals:', error);
      setCurrentPurchase((prev) => ({
        ...prev!,
        total_exc_btw: '0.00',
        total_inc_btw: '0.00',
        total_vat: '0.00',
      }));
    }
  };

  const handleUpdateQuantity = (itemId: string, value: string) => {
    const numValue = Number(value);
    if (value === '' || isNaN(numValue)) {
      return;
    }
    const updatedItems = currentPurchase!.items.map((item) =>
      item.id === itemId ? { ...item, product_quantity: numValue } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
  };

  const handleUpdatePrice = (itemId: string, price: string) => {
    const updatedItems = currentPurchase!.items.map((item) =>
      item.id === itemId ? { ...item, product_purchase_price: price } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
  };



  const handleSave = async () => {
    if (!selectedSupplier) {
      enqueueSnackbar(t('supplier_required'), { variant: 'error' });
      return;
    }

    if (!selectedSupplier.supplier_country) {
      enqueueSnackbar(t('supplier_country_required') || 'Supplier country is required. Please update the supplier information.', { variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      const changes = {
        supplier: String(selectedSupplier?.id) !== String(currentPurchase?.supplier),
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        items: currentPurchase?.items.map(item => ({
          id: item.id,
          quantity: item.product_quantity,
          price: item.product_purchase_price,
          vat_rate: item.vat_rate,
        })),
      };

      const cleanedPurchase = {
        // type: 'purchase',
        id: currentPurchase?.id,
        supplier: selectedSupplier?.id,
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        total_exc_btw: currentPurchase?.total_exc_btw,
        total_inc_btw: currentPurchase?.total_inc_btw,
        total_vat: currentPurchase?.total_vat,
        items: currentPurchase?.items.map(item => ({
          id: item.id,
          product: item.product,
          product_quantity: item.product_quantity,
          product_purchase_price: item.product_purchase_price,
          vat_rate: (item as any).vat,
        })),
        history: [...history, {
          id: crypto.randomUUID(),
          action: 'update',
          changes,
          created_at: new Date().toISOString(),
          user: user?.email || 'Unknown',
        }],
      };

      const response = await axiosInstance.put(
        `/purchases/${id}/`,
        cleanedPurchase,
      );

      // Update history with the new changes
      if (response.data.history) {
        setHistory(response.data.history);
      } else {
        // If the API doesn't return history, create a new history entry
        const newHistoryEntry = {
          id: crypto.randomUUID(),
          action: 'update',
          changes,
          created_at: new Date().toISOString(),
          user: user?.name || 'Unknown',
        };
        setHistory([newHistoryEntry, ...history]);
      }

      enqueueSnackbar(t('purchase_updated_successfully'));
    } catch (error) {
      console.error('Error updating purchase:', error);
      enqueueSnackbar(t('failed_to_update_purchase'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };


  const handleDownloadPdf = async () => {
    if (!currentPurchase) {
      enqueueSnackbar(t('no_purchase_data'), { variant: 'error' });
      return;
    }

    const hasCalculationErrors =
      !currentPurchase.total_exc_btw ||
      currentPurchase.total_exc_btw === '0.00' ||
      !currentPurchase.total_inc_btw ||
      currentPurchase.total_inc_btw === '0.00' ||
      currentPurchase.items.length === 0;

    if (hasCalculationErrors) {
      enqueueSnackbar(t('calculation_errors_prevent_pdf_download') || 'Cannot download PDF: Calculation errors detected', { variant: 'error' });
      return;
    }

    const hasInvalidItems = currentPurchase.items.some(item =>
      !item.product_purchase_price ||
      !item.product_quantity
    );

    if (hasInvalidItems) {
      enqueueSnackbar(t('invalid_items_prevent_pdf_download') || 'Cannot download PDF: Invalid item data detected', { variant: 'error' });
      return;
    }

    try {
      const response = await axiosInstance.get(`/purchases/${id}/offer/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `offer_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      enqueueSnackbar(t('pdf_downloaded_successfully') || 'PDF downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      enqueueSnackbar(t('failed_to_download_pdf'), { variant: 'error' });
    }
  };

  const handleConvertToPurchase = async () => {
    if (!currentPurchase || !selectedSupplier) {
      enqueueSnackbar(t('purchase_data_required') || 'Purchase data is required', { variant: 'error' });
      return;
    }

    const hasCalculationErrors =
      !currentPurchase.total_exc_btw ||
      currentPurchase.total_exc_btw === '0.00' ||
      !currentPurchase.total_inc_btw ||
      currentPurchase.total_inc_btw === '0.00' ||
      currentPurchase.items.length === 0;

    if (hasCalculationErrors) {
      enqueueSnackbar(t('calculation_errors_prevent_conversion') || 'Cannot convert: Calculation errors detected', { variant: 'error' });
      return;
    }

    const hasInvalidItems = currentPurchase.items.some(item =>
      !item.product_purchase_price ||
      !item.product_quantity
    );

    if (hasInvalidItems) {
      enqueueSnackbar(t('invalid_items_prevent_conversion') || 'Cannot convert: Invalid item data detected', { variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      const changes = {
        type: 'convert_to_purchase',
        supplier: selectedSupplier?.id,
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        items: currentPurchase?.items.map(item => ({
          id: item.id,
          quantity: item.product_quantity,
          price: item.product_purchase_price,
          vat_rate: item.vat_rate,
        })),
      };

      const cleanedPurchase = {
        id: currentPurchase?.id,
        type: 'purchase',
        supplier: selectedSupplier?.id,
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        total_exc_btw: currentPurchase?.total_exc_btw,
        total_inc_btw: currentPurchase?.total_inc_btw,
        total_vat: currentPurchase?.total_vat,
        items: currentPurchase?.items.map(item => ({
          id: item.id,
          product: item.product,
          product_quantity: item.product_quantity,
          product_purchase_price: item.product_purchase_price,
          vat_rate: (item as any).vat,
        })),
        history: [...history, {
          id: crypto.randomUUID(),
          action: 'convert_to_purchase',
          changes,
          created_at: new Date().toISOString(),
          user: user?.email || 'Unknown',
        }],
      };

      const response = await axiosInstance.put(
        `/purchases/${id}/`,
        cleanedPurchase,
      );

      if (response.data.history) {
        setHistory(response.data.history);
      } else {
        const newHistoryEntry = {
          id: crypto.randomUUID(),
          action: 'convert_to_purchase',
          changes,
          created_at: new Date().toISOString(),
          user: user?.name || 'Unknown',
        };
        setHistory([newHistoryEntry, ...history]);
      }

      enqueueSnackbar(t('offer_converted_to_purchase_successfully') || 'Offer converted to purchase successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error converting offer to purchase:', error);
      enqueueSnackbar(t('failed_to_convert_offer') || 'Failed to convert offer to purchase', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentPurchase) {
    return null;
  }

  return (
    <Container maxWidth={false}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack spacing={1} direction="row" alignItems="center">
            <IconButton onClick={router.back}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
            <Typography variant="h4">{t('edit_purchase')}</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <LoadingButton
              variant="contained"
              color="primary"
              loading={saving}
              onClick={handleSave}
            >
              {t('save_changes')}
            </LoadingButton>
            {currentPurchase.type === 'offer' && (
              <LoadingButton
                variant="contained"
                color="success"
                loading={saving}
                onClick={handleConvertToPurchase}
                startIcon={<Iconify icon="eva:shopping-cart-outline" />}
                disabled={
                  !currentPurchase ||
                  !currentPurchase.total_exc_btw ||
                  currentPurchase.total_exc_btw === '0.00' ||
                  !currentPurchase.total_inc_btw ||
                  currentPurchase.total_inc_btw === '0.00' ||
                  currentPurchase.items.length === 0
                }
                title={
                  !currentPurchase ? t('no_purchase_data') :
                    !currentPurchase.total_exc_btw || currentPurchase.total_exc_btw === '0.00' ||
                      !currentPurchase.total_inc_btw || currentPurchase.total_inc_btw === '0.00' ||
                      currentPurchase.items.length === 0 ?
                      (t('calculation_errors_prevent_conversion') || 'Calculation errors prevent conversion') :
                      t('convert_to_purchase')
                }
              >
                {t('convert_to_purchase')}
              </LoadingButton>
            )}
            <LoadingButton
              variant="contained"
              color="primary"
              loading={saving}
              onClick={handleDownloadPdf}
              disabled={
                !currentPurchase ||
                !currentPurchase.total_exc_btw ||
                currentPurchase.total_exc_btw === '0.00' ||
                !currentPurchase.total_inc_btw ||
                currentPurchase.total_inc_btw === '0.00' ||
                currentPurchase.items.length === 0
              }
              title={
                !currentPurchase ? t('no_purchase_data') :
                  !currentPurchase.total_exc_btw || currentPurchase.total_exc_btw === '0.00' ||
                    !currentPurchase.total_inc_btw || currentPurchase.total_inc_btw === '0.00' ||
                    currentPurchase.items.length === 0 ?
                    (t('calculation_errors_prevent_pdf_download') || 'Calculation errors prevent PDF download') :
                    t('download_pdf')
              }
            >
              {t('download_pdf')}
            </LoadingButton>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_details')}</Typography>

                <Stack spacing={2}>
                  <Autocomplete
                    value={selectedSupplier}
                    onChange={(event: React.SyntheticEvent, newValue: ISupplierItem | null) => {
                      handleSupplierChange(event, newValue);
                    }}
                    options={suppliers}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('supplier')}
                        fullWidth
                        required
                        error={!selectedSupplier}
                        helperText={!selectedSupplier ? t('supplier_required') : ''}
                      />
                    )}
                  />
                  {selectedSupplier && !selectedSupplier.supplier_country && (
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold', mt: 1 }}>
                      ⚠️ {t('supplier_country_missing') || 'Warning: This supplier does not have a country set. Please update the supplier information.'}
                    </Typography>
                  )}

                  <DatePicker
                    label={t('invoice_date')}
                    value={currentPurchase.purchase_invoice_date ? new Date(currentPurchase.purchase_invoice_date) : null}
                    onChange={(newValue) => {
                      setCurrentPurchase((prev) => ({
                        ...prev!,
                        purchase_invoice_date: newValue?.toISOString().split('T')[0] || '',
                      }));
                    }}
                  />

                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <TextField
                      fullWidth
                      label={t('search_product_by_ean')}
                      value={eanSearch}
                      onChange={(e) => setEanSearch(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddProduct();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddProduct}
                      disabled={!eanSearch}
                    >
                      {t('add_product')}
                    </Button>
                  </Stack>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('product')}</TableCell>
                          <TableCell>{t('ean')}</TableCell>
                          <TableCell align="right">{t('stock')}</TableCell>
                          <TableCell align="right">{t('stock')}</TableCell>
                          <TableCell align="right">{t('excl_btw_price_cost')}</TableCell>
                          <TableCell align="right">{t('quantity')}</TableCell>
                          <TableCell align="right">{t('exc_btw_total')}</TableCell>
                          <TableCell align="center">{t('actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPurchase.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="subtitle2">{item.product_detail.title}</Typography>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={paths.dashboard.product.edit(item.product_detail.id.toString())}
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                  fontWeight: 'normal',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                  color: 'primary.main',
                                }}
                              >
                                <Typography variant="body2">{item.product_detail.ean}</Typography>
                                <Typography variant="caption">Leverancierscode: {(item.product_detail as any).supplier_article_code}</Typography>
                                <Typography variant="caption" sx={{
                                  color: (selectedSupplier?.supplier_country === 'NL') ? 'success.main' : 'warning.main',
                                  fontWeight: 'bold',
                                  display: 'block'
                                }}>
                                  {calculateItemTax(
                                    selectedSupplier?.supplier_country,
                                    Number((item as any).product_detail?.vat ?? (item as any).vat ?? (item as any).vat_rate ?? 0)
                                  )}% ({getCountryName(selectedSupplier?.supplier_country)})
                                </Typography>
                                {!selectedSupplier?.supplier_country && (
                                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold', display: 'block' }}>
                                    ⚠️ {t('supplier_country_required') || 'Supplier country required'}
                                  </Typography>
                                )}
                              </Link>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" display="block">
                                {t('overall_stock')}: {(item.product_detail as any)?.overall_stock || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {t('free_stock')}: {(item.product_detail as any)?.free_stock || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" display="block">
                                {t('min_stock_value')}: {(item.product_detail as any)?.min_stock_value || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {t('min_order_amount')}: {(item.product_detail as any)?.min_order_amount || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {t('max_stock_at_rack')}: {(item.product_detail as any)?.max_stock_at_rack || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={item.product_purchase_price}
                                onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                                size="small"
                                sx={{ width: 100 }}
                                InputProps={{
                                  startAdornment: <Typography variant="caption">€</Typography>,
                                }}
                                inputProps={{
                                  min: 0,
                                  step: "0.01"
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                defaultValue={item.product_quantity}
                                onBlur={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                size="small"
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                €{(Number(item.product_purchase_price) * item.product_quantity).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveProduct(item.id)}
                                title={t('remove')}
                              >
                                <Iconify icon="eva:trash-2-outline" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_summary')}3</Typography>

                {(() => {
                  console.log('🔍 Purchase Summary Debug:', {
                    total_exc_btw: currentPurchase.total_exc_btw,
                    total_vat: currentPurchase.total_vat,
                    total_inc_btw: currentPurchase.total_inc_btw,
                    items_length: currentPurchase.items.length,
                    items: currentPurchase.items
                  });

                  console.log('🔍 Purchase Summary - Individual Items:');
                  currentPurchase.items.forEach((item: any, index: number) => {
                    console.log(`🔍 Item ${index + 1}:`, {
                      id: item.id,
                      price: item.product_purchase_price,
                      vat_rate: item.vat_rate,
                      quantity: item.product_quantity,
                      item_total: Number(item.product_purchase_price) * item.product_quantity,
                      item_vat: (Number(item.product_purchase_price) * item.product_quantity) * (Number(item.vat_rate) / 100)
                    });
                  });

                  return null;
                })()}

                {(!currentPurchase.total_exc_btw || currentPurchase.total_exc_btw === '0.00') && currentPurchase.items.length > 0 && (
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    ⚠️ {t('calculation_error') || 'Calculation error: Check product data'}
                  </Typography>
                )}

                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('supplier')}
                    </Typography>
                    {selectedSupplier ? (
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Link
                          href={paths.dashboard.supplier.edit(selectedSupplier.id)}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            fontWeight: 'normal',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            color: 'primary.main',
                          }}
                        >
                          <Typography variant="subtitle2">{selectedSupplier.name}</Typography>
                        </Link>
                        <Typography variant="caption" sx={{
                          color: (selectedSupplier.supplier_country === 'NL') ? 'success.main' : 'warning.main',
                          fontWeight: 'bold'
                        }}>
                          {getCountryName(selectedSupplier.supplier_country)}{selectedSupplier.supplier_country === 'NL' ? '' : ' - VAT: 0%'}
                        </Typography>
                        {!selectedSupplier.supplier_country && (
                          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            ⚠️ {t('supplier_country_required') || 'Supplier country required'}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="subtitle2">-</Typography>
                    )}
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('invoice_date')}
                    </Typography>
                    <Typography variant="subtitle2">{currentPurchase.purchase_invoice_date}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_items')}
                    </Typography>
                    <Typography variant="subtitle2">{currentPurchase.items.length}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_excl_btw')}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: !currentPurchase.total_exc_btw || currentPurchase.total_exc_btw === '0.00' ? 'error.main' : 'inherit',
                        fontWeight: !currentPurchase.total_exc_btw || currentPurchase.total_exc_btw === '0.00' ? 'bold' : 'normal'
                      }}
                    >
                      €{currentPurchase.total_exc_btw || '0.00'}
                    </Typography>
                  </Stack>

                  {/* <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('vat_amount')}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: !currentPurchase.total_vat || currentPurchase.total_vat === '0.00' ? 'error.main' : 'inherit',
                        fontWeight: !currentPurchase.total_vat || currentPurchase.total_vat === '0.00' ? 'bold' : 'normal'
                      }}
                    >
                      €{currentPurchase.total_vat || '0.00'}
                    </Typography>
                  </Stack> */}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      BTW-bedrag (%9)
                    </Typography>
                    <Typography variant="subtitle2">
                      €{((currentPurchase as any).total_vat_9 || '0.00')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      BTW-bedrag (%21)
                    </Typography>
                    <Typography variant="subtitle2">
                      €{((currentPurchase as any).total_vat_21 || '0.00')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_incl_btw')}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: !currentPurchase.total_inc_btw || currentPurchase.total_inc_btw === '0.00' ? 'error.main' : 'inherit',
                        fontWeight: !currentPurchase.total_inc_btw || currentPurchase.total_inc_btw === '0.00' ? 'bold' : 'normal'
                      }}
                    >
                      €{currentPurchase.total_inc_btw || '0.00'}
                    </Typography>
                  </Stack>
                </Stack>

              </Stack>
            </Card>
          </Grid>
          {history.length > 0 && <PurchaseDetailsHistory history={history} />}
        </Grid>
      </Stack>

      {/* Previous Purchases and Offers Section */}
      {selectedSupplier && (
        <Stack spacing={3} sx={{ mt: 3 }}>
          {/* Previous Purchases Table */}
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">{t('previous_purchases')}</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('id')}</TableCell>
                      <TableCell>{t('invoice_date')}</TableCell>
                      <TableCell align="right">{t('items')}</TableCell>
                      <TableCell align="right">{t('total_excl_btw')}</TableCell>
                      <TableCell align="right">{t('total_incl_btw')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previousPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{purchase.id}</TableCell>
                        <TableCell>
                          {purchase.purchase_invoice_date && format(new Date(purchase.purchase_invoice_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell align="right">{purchase.items?.length || 0}</TableCell>
                        <TableCell align="right">€{parseFloat(purchase.total_exc_btw).toFixed(2)}</TableCell>
                        <TableCell align="right">€{parseFloat(purchase.total_inc_btw).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {previousPurchases.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {t('no_previous_purchases')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Card>

          {/* Previous Offers Table */}
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">{t('previous_offers')}</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('id')}</TableCell>
                      <TableCell>{t('invoice_date')}</TableCell>
                      <TableCell align="right">{t('items')}</TableCell>
                      <TableCell align="right">{t('total_excl_btw')}</TableCell>
                      <TableCell align="right">{t('total_incl_btw')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previousOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.id}</TableCell>
                        <TableCell>
                          {offer.purchase_invoice_date && format(new Date(offer.purchase_invoice_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell align="right">{offer.items?.length || 0}</TableCell>
                        <TableCell align="right">€{parseFloat(offer.total_exc_btw).toFixed(2)}</TableCell>
                        <TableCell align="right">€{parseFloat(offer.total_inc_btw).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {previousOffers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {t('no_previous_offers')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Card>
        </Stack>
      )}
    </Container>
  );
}
