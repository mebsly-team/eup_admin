import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'src/routes/hooks';

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

type PurchaseHistory = {
  id: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
  user: string;
};

export default function PurchaseEditView() {
  const { id } = useParams();
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

      console.log("🚀 ~ fetchPurchase ~ response.data:", response.data)

      setCurrentPurchase(response.data);
      setHistory(response.data.history || []);
      setSelectedSupplier(response.data?.supplier_detail);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      enqueueSnackbar(t('failed_to_fetch_purchase'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, enqueueSnackbar, t]);

  useEffect(() => {
    fetchPurchase();
    fetchSuppliers();
  }, [fetchPurchase, fetchSuppliers]);


  const handleAddProduct = async () => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`);
      if (response.data?.length > 0) {
        const product = response.data[0];
        const newItem = {
          id: crypto.randomUUID(),
          product: product.id,
          product_detail: {
            id: product.id,
            title: product.title,
            images: product.images,
            ean: product.ean,
          },
          product_quantity: 1,
          product_purchase_price: product.price_cost || '0',
          vat_rate: product.vat || 21, // Use product's VAT rate or default to 21%
        };
        setCurrentPurchase((prev) => ({
          ...prev!,
          items: [...prev!.items, newItem],
        }));
        setEanSearch('');
        calculateTotals([...currentPurchase!.items, newItem]);
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

  const calculateTotals = (items: IPurchaseItem['items']) => {
    const totals = items.reduce(
      (acc, item) => {
        const itemPrice = Number(item.product_detail.price_cost) * item.product_quantity;
        const itemVat = itemPrice * (item.product_detail.vat / 100);
        return {
          totalExcBtw: acc.totalExcBtw + itemPrice,
          totalVat: acc.totalVat + itemVat,
        };
      },
      { totalExcBtw: 0, totalVat: 0 }
    );

    const totalIncBtw = totals.totalExcBtw + totals.totalVat;

    setCurrentPurchase((prev) => ({
      ...prev!,
      total_exc_btw: totals.totalExcBtw.toFixed(2),
      total_inc_btw: totalIncBtw.toFixed(2),
      total_vat: totals.totalVat.toFixed(2),
    }));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const updatedItems = currentPurchase!.items.map((item) =>
      item.id === itemId ? { ...item, product_quantity: quantity } : item
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

  const handleUpdateVat = (itemId: string, vatRate: number) => {
    const updatedItems = currentPurchase!.items.map((item) =>
      item.id === itemId ? { ...item, vat_rate: vatRate } : item
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
          vat_rate: item.vat_rate,
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
          <Typography variant="h4">{t('edit_purchase')}</Typography>

          <LoadingButton
            variant="contained"
            color="primary"
            loading={saving}
            onClick={handleSave}
          >
            {t('save_changes')}
          </LoadingButton>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_details')}</Typography>

                <Stack spacing={2}>
                  <Autocomplete
                    value={selectedSupplier}
                    onChange={(event, newValue) => setSelectedSupplier(newValue)}
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
                          <TableCell align="right">{t('price_cost')}</TableCell>
                          <TableCell align="right">{t('quantity')}</TableCell>
                          <TableCell align="center">{t('actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPurchase.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="subtitle2">{item.product_detail.title}</Typography>
                            </TableCell>
                            <TableCell>{item.product_detail.ean}</TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" display="block">
                                {t('overall_stock')}: {item.product_detail.overall_stock || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {t('free_stock')}: {item.product_detail.free_stock || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" display="block">
                                {t('min_stock_value')}: {item.product_detail.min_stock_value || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {t('min_order_amount')}: {item.product_detail.min_order_amount || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {t('max_order_allowed_per_unit')}: {item.product_detail.max_order_allowed_per_unit || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">

                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                € {item.product_detail.price_cost} +{item.product_detail.vat}% {t('vat')}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={item.product_quantity}
                                onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                                size="small"
                                sx={{ width: 80 }}
                                InputProps={{
                                  inputProps: { min: 1 }
                                }}
                              />
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
                <Typography variant="h6">{t('purchase_summary')}</Typography>

                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('supplier')}
                    </Typography>
                    <Typography variant="subtitle2">{selectedSupplier?.name}</Typography>
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
                    <Typography variant="subtitle2">€{currentPurchase.total_exc_btw}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('vat_amount')}
                    </Typography>
                    <Typography variant="subtitle2">€{currentPurchase.total_vat}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_incl_btw')}
                    </Typography>
                    <Typography variant="subtitle2">€{currentPurchase.total_inc_btw}</Typography>
                  </Stack>
                </Stack>

              </Stack>
            </Card>
          </Grid>
          {history.length > 0 && <PurchaseDetailsHistory history={history} />}
        </Grid>
      </Stack>
    </Container>
  );
}
