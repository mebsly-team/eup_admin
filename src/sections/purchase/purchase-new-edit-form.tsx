import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'src/routes/hooks';
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

type PurchaseHistory = {
  id: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
  user: string;
};

export default function PurchaseEditView() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const [currentPurchase, setCurrentPurchase] = useState<IPurchaseItem | null>(null);
  console.log("🚀 ~ PurchaseEditView ~ currentPurchase:", currentPurchase)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<ISupplierItem[]>([]);
  const [eanSearch, setEanSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplierItem | null>(null);
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [previousPurchases, setPreviousPurchases] = useState<IPurchaseItem[]>([]);
  const [previousOffers, setPreviousOffers] = useState<IPurchaseItem[]>([]);

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
  }, [user?.token, enqueueSnackbar, t]);



  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAddProduct = async () => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`);
      if (response.data?.length > 0) {
        const product = response.data[0];
        const appliedVat = Number(product.vat) || 0;
        const newItem = {
          id: crypto.randomUUID(),
          product: product.id,
          product_detail: {
            id: product.id,
            title: product.title,
            images: product.images,
            ean: product.ean,
            supplier_article_code: product.supplier_article_code,
            vat: product.vat,
          },
          product_quantity: 1,
          product_purchase_price: product.price_cost || '0',
          vat: appliedVat,
          vat_rate: appliedVat,
        };

        // Ensure items is initialized as an array
        const currentItems = currentPurchase?.items || [];
        setCurrentPurchase((prev) => ({
          ...prev!,
          items: [...currentItems, newItem],
        }) as any);
        setEanSearch('');
        calculateTotals([...currentItems, newItem]);
      } else {
        enqueueSnackbar(t('product_not_found'), { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      enqueueSnackbar(t('failed_to_fetch_product'), { variant: 'error' });
    }
  };

  const handleRemoveProduct = (itemId: string) => {
    const updatedItems = (currentPurchase?.items || []).filter((item) => item.id !== itemId);
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }) as any);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: IPurchaseItem['items']) => {
    const totals = items?.reduce(
      (acc, item) => {
        const priceNum = Number(String(item.product_purchase_price ?? '0').replace(',', '.'));
        const itemPrice = priceNum * item.product_quantity;
        const vat = calculateItemTax(selectedSupplier?.supplier_country, Number((item as any).vat ?? (item as any).product_detail?.vat ?? item.vat_rate ?? 0));
        const itemVat = itemPrice * (vat / 100);
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
    const updatedItems = (currentPurchase?.items || []).map((item) =>
      item.id === itemId ? { ...item, product_quantity: quantity } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }) as any);
    calculateTotals(updatedItems);
  };

  const handleUpdatePrice = (itemId: string, price: string) => {
    const updatedItems = (currentPurchase?.items || []).map((item) =>
      item.id === itemId ? { ...item, product_purchase_price: price } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }) as any);
    calculateTotals(updatedItems);
  };

  const handleUpdateVat = (itemId: string, vatRate: number) => {
    const updatedItems = (currentPurchase?.items || []).map((item) =>
      item.id === itemId ? { ...item, vat_rate: vatRate } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }) as any);
    calculateTotals(updatedItems);
  };
  const fetchPreviousPurchases = useCallback(async (supplierId: string) => {
    try {
      const response = await axiosInstance.get(`/purchases/?type=purchase&supplier=${supplierId}`);
      setPreviousPurchases(response.data || {});
    } catch (error) {
      console.error('Error fetching previous purchases:', error);
      enqueueSnackbar(t('failed_to_fetch_previous_purchases'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t]);

  const fetchPreviousOffers = useCallback(async (supplierId: string) => {
    try {
      const response = await axiosInstance.get(`/purchases/?type=offer&supplier=${supplierId}`);
      setPreviousOffers(response.data || {});
    } catch (error) {
      console.error('Error fetching previous offers:', error);
      enqueueSnackbar(t('failed_to_fetch_previous_offers'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t]);

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
      if (currentPurchase?.items?.length) {
        calculateTotals(currentPurchase.items);
      }
    } else {
      setPreviousPurchases([]);
      setPreviousOffers([]);
    }
  };

  const handleCreate = async () => {
    if (!selectedSupplier) {
      enqueueSnackbar(t('supplier_required'), { variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      const changes = {
        supplier: String(selectedSupplier?.id) !== String(currentPurchase?.supplier),
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        items: currentPurchase?.items?.map(item => ({
          quantity: item.product_quantity,
          price: item.product_purchase_price,
          vat_rate: item.vat_rate,
        })),
      };

      const cleanedPurchase = {
        type: 'purchase',
        supplier: selectedSupplier?.id,
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        total_exc_btw: currentPurchase?.total_exc_btw,
        total_inc_btw: currentPurchase?.total_inc_btw,
        total_vat: currentPurchase?.total_vat,
        items: currentPurchase?.items?.map(item => ({
          product: item.product,
          product_quantity: item.product_quantity,
          product_purchase_price: item.product_purchase_price,
          vat_rate: (item as any).vat ?? item.vat_rate,
        })),
        history: [...(history || []), {
          id: crypto.randomUUID(),
          action: 'create',
          changes,
          created_at: new Date().toISOString(),
          user: user?.email || 'Unknown',
        }],
      };

      const response = await axiosInstance.post(
        `/purchases/`,
        cleanedPurchase
      );

      if (response.data.history) {
        setHistory(response.data.history);
      } else {
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


  return (
    <Container maxWidth={false}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">{t('new_purchase')}</Typography>

          <LoadingButton
            variant="contained"
            color="primary"
            loading={saving}
            onClick={handleCreate}
          >
            {t('save')}
          </LoadingButton>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_details')}.</Typography>

                <Stack spacing={2}>
                  <Autocomplete
                    value={selectedSupplier}
                    onChange={(event: React.SyntheticEvent, newValue: ISupplierItem | null) => {
                      handleSupplierChange(event, newValue);
                    }} options={suppliers}
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
                    value={currentPurchase?.purchase_invoice_date ? new Date(currentPurchase.purchase_invoice_date) : null}
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

                  {currentPurchase?.items?.map((item) => (
                    <Card key={item.id} sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">{item.product_detail.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            EAN: {item.product_detail.ean}
                          </Typography>
                        </Box>

                        <TextField
                          type="number"
                          label={t('quantity')}
                          value={item.product_quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                          sx={{ width: 100 }}
                        />

                        <TextField
                          type="number"
                          label={t('price')}
                          value={item.product_purchase_price}
                          onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                          sx={{ width: 120 }}
                        />

                        <TextField
                          type="number"
                          label={t('vat_rate')}
                          value={(item as any).vat ?? (item as any).product_detail?.vat ?? item.vat_rate}
                          InputProps={{
                            endAdornment: <Typography>%</Typography>,
                            readOnly: true
                          }}
                          sx={{ width: 100 }}
                        />

                        <IconButton color="error" onClick={() => handleRemoveProduct(item.id)}>
                          <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_summary')}1</Typography>

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
                    <Typography variant="subtitle2">{currentPurchase?.purchase_invoice_date}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_items')}
                    </Typography>
                    <Typography variant="subtitle2">{currentPurchase?.items?.length}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_excl_btw')}
                    </Typography>
                    <Typography variant="subtitle2">€{currentPurchase?.total_exc_btw}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('vat_amount')}
                    </Typography>
                    <Typography variant="subtitle2">€{currentPurchase?.total_vat}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('total_incl_btw')}
                    </Typography>
                    <Typography variant="subtitle2">€{currentPurchase?.total_inc_btw}</Typography>
                  </Stack>
                </Stack>

              </Stack>
            </Card>
          </Grid>
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
                      <TableCell align="right">{t('import')}</TableCell>
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
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              const mappedItems = (offer.items || []).map((it: any) => {
                                const baseVat = it?.product_detail?.vat ?? it?.vat ?? it?.vat_rate ?? 0;
                                const appliedVat = Number(baseVat) || 0;
                                return {
                                  ...it,
                                  vat: appliedVat,
                                  vat_rate: appliedVat,
                                };
                              });
                              setCurrentPurchase((prev) => ({
                                ...(prev as any),
                                ...offer,
                                items: mappedItems,
                                purchase_invoice_date: new Date().toISOString().split('T')[0],
                              }) as any);
                              calculateTotals(mappedItems);
                              enqueueSnackbar(t('offer_imported_successfully'), { variant: 'success' });
                            }}
                          >
                            {t('import')}
                          </Button>
                        </TableCell>
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
