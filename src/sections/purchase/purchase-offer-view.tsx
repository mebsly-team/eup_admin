import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'src/routes/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
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

import { ISupplierItem } from 'src/types/supplier';
import { IProductItem } from 'src/types/product';
import Link from '@mui/material/Link';
import { paths } from 'src/routes/paths';

type PurchaseHistory = {
  id: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
  user: string;
};

interface IPurchaseItem {
  items: {
    id: string;
    product: number;
    product_detail: {
      id: number;
      title: string;
      images: string[];
      ean: string;
    };
    product_quantity: number;
    product_purchase_price: string;
    vat_rate: number;
  }[];
  total_vat: string;
  total_exc_btw: string;
  total_inc_btw: string;
  purchase_invoice_date?: string;
  supplier?: number;
}

export function PurchaseOfferView({ id: supplierId }: { id: string }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const [currentPurchase, setCurrentPurchase] = useState<IPurchaseItem>({
    items: [],
    total_vat: '0',
    total_exc_btw: '0',
    total_inc_btw: '0',
    purchase_invoice_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplier, setSupplier] = useState<ISupplierItem[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<IProductItem[]>([]);
  console.log("🚀 ~ PurchaseOfferView ~ supplierProducts:", supplierProducts)
  console.log("🚀 ~ PurchaseOfferView ~ supplier:", supplier)
  const [supplierRecommendedProducts, setSupplierRecommendedProducts] = useState<IProductItem[]>([]);
  console.log("🚀 ~ PurchaseOfferView ~ supplierRecommendedProducts1:", supplierRecommendedProducts)
  const [eanSearch, setEanSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplierItem | null>(null);
  const [history, setHistory] = useState<PurchaseHistory[]>([]);

  const fetchSupplier = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/suppliers/${supplierId}/`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setSupplier(response.data || {});
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [user?.token, enqueueSnackbar, t]);

  const addToSupplierRecommendedProducts = useCallback(async (product_id: string[]) => {
    console.log("🚀 ~ addToSupplierRecommendedProducts ~ supplierRecommendedProducts:", supplierRecommendedProducts)
    const payload = [...supplier?.recommended_product_offer, { id: product_id, quantity: 1 }]
    console.log("🚀 ~ addToSupplierRecommendedProducts ~ payload:", payload)
    try {
      const response = await axiosInstance.put(`/suppliers/${supplierId}/`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        recommended_product_offer: payload,
      });
      setSupplier(response.data || {});
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [user?.token, enqueueSnackbar, t, supplierRecommendedProducts]);
  const updateSupplierRecommendedProducts = useCallback(async (product_ids: string[]) => {
    try {
      const response = await axiosInstance.put(`/suppliers/${supplierId}/`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        recommended_product_offer: supplierRecommendedProducts,
      });
      setSupplier(response.data || {});
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [user?.token, enqueueSnackbar, t, supplierRecommendedProducts]);

  const fetchSupplierProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/products/?supplier=${supplierId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setSupplierProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [user?.token, enqueueSnackbar, t]);

  useEffect(() => {
    fetchSupplier();
    fetchSupplierProducts();
  }, [fetchSupplier, fetchSupplierProducts]);

  useEffect(() => {
    const supplier_recommended_products_ids = supplier?.recommended_product_offer?.map((product) => product.id);
    console.log("🚀 ~ PurchaseOfferView ~ supplier_recommended_products_ids:", supplier_recommended_products_ids)
    const recommendedProducts = supplierProducts.filter((product) => supplier_recommended_products_ids?.includes(product.id));
    console.log("🚀 ~ PurchaseOfferView ~ recommendedProducts:", recommendedProducts)
    setSupplierRecommendedProducts(recommendedProducts);
  }, [supplier, supplierProducts]);

  const handleAddProduct = async () => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.get(`/products/?ean=${eanSearch}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
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
          vat_rate: product.vat || 21,
        };

        // Ensure items is initialized as an array
        const currentItems = currentPurchase?.items || [];
        setCurrentPurchase((prev) => ({
          ...prev!,
          items: [...currentItems, newItem],
        }));
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
    const updatedItems = currentPurchase?.items?.filter((item) => item.id !== itemId);
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: IPurchaseItem['items']) => {
    const totals = items?.reduce(
      (acc, item) => {
        const itemPrice = Number(item.product_purchase_price) * item.product_quantity;
        const itemVat = itemPrice * (item.vat_rate / 100);
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
    const updatedItems = currentPurchase?.items?.map((item) =>
      item.id === itemId ? { ...item, product_quantity: quantity } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
  };

  const handleUpdatePrice = (itemId: string, price: string) => {
    const updatedItems = currentPurchase?.items?.map((item) =>
      item.id === itemId ? { ...item, product_purchase_price: price } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
  };

  const handleUpdateVat = (itemId: string, vatRate: number) => {
    const updatedItems = currentPurchase?.items?.map((item) =>
      item.id === itemId ? { ...item, vat_rate: vatRate } : item
    );
    setCurrentPurchase((prev) => ({
      ...prev!,
      items: updatedItems,
    }));
    calculateTotals(updatedItems);
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
        supplier: selectedSupplier?.id,
        purchase_invoice_date: currentPurchase?.purchase_invoice_date,
        total_exc_btw: currentPurchase?.total_exc_btw,
        total_inc_btw: currentPurchase?.total_inc_btw,
        total_vat: currentPurchase?.total_vat,
        items: currentPurchase?.items?.map(item => ({
          product: item.product,
          product_quantity: item.product_quantity,
          product_purchase_price: item.product_purchase_price,
          vat_rate: item.vat_rate,
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
        cleanedPurchase,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
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
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">{t('new_offer_for')} {supplier?.name}</Typography>

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
                <Typography variant="h6">{t('recommended_products')}</Typography>

                <Stack spacing={2}>
                  {supplierRecommendedProducts?.map((item) => (
                    <Card key={item.id} sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">
                            <Link
                              href={paths.dashboard.product.edit(item.id)}
                              color="blue"
                              sx={{
                                alignItems: 'center',
                                typography: '',
                                display: 'inline-flex',
                                alignSelf: 'flex-end',
                                fontWeight: 'fontWeightBold',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                marginLeft: 0,
                              }}
                            >
                              {item.title}
                            </Link>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            EAN: {item.ean}
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
                          value={item.vat_rate}
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
              <Stack direction="row" mt={2} spacing={2} alignItems="flex-start">
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
            </Card>

          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_summary')}</Typography>

                <Stack>
                  <DatePicker
                    label={t('date')}
                    value={currentPurchase?.purchase_invoice_date ? new Date(currentPurchase.purchase_invoice_date) : null}
                    onChange={(newValue) => {
                      setCurrentPurchase((prev) => ({
                        ...prev!,
                        purchase_invoice_date: newValue?.toISOString().split('T')[0] || '',
                      }));
                    }}
                  />


                </Stack>
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('all_products_from_supplier') + ' ' + supplier?.name}</Typography>

                <Stack spacing={2}>
                  {supplierProducts?.map((item) => (
                    <Card key={item.id} sx={{ p: 2, minHeight: 120 }}>
                      <Grid container spacing={2}>
                        {/* Left Column - Basic Info */}
                        <Grid item xs={3.5}>
                          <Link
                            href={paths.dashboard.product.edit(item.id)}
                            color="blue"
                            sx={{
                              alignItems: 'center',
                              typography: '',
                              display: 'inline-flex',
                              alignSelf: 'flex-end',
                              fontWeight: 'fontWeightBold',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              marginLeft: 0,
                            }}
                          >
                            <Typography variant="subtitle2" noWrap>{item.title}</Typography>
                          </Link>
                          <Typography variant="caption" color="text.secondary" display="block">
                            EAN: {item.ean}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Article: {item.article_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Supplier Code: {item.supplier_article_code}
                          </Typography>
                        </Grid>

                        {/* Middle Column - Stock Info */}
                        <Grid item xs={3.5}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Location: {item.location || '-'} ({item.location_stock || '0'})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Extra: {item.extra_location || '-'} ({item.extra_location_stock || '0'})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Free: {item.free_stock || '0'} | Overall: {item.overall_stock || '0'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Min: {item.min_order_amount || '0'} | Max: {item.max_order_allowed_per_unit || '0'}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Right Column - Pricing */}
                        <Grid item xs={3.5}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Cost: €{item.price_cost || '0'} (+{item.vat || '0'}% VAT)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Per Piece: €{item.price_per_piece || '0'} (€{item.price_per_piece_vat || '0'} incl.)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Per Unit: €{item.price_per_unit || '0'} (€{item.price_per_unit_vat || '0'} incl.)
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Action Column */}
                        <Grid item xs={1.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              const isAlreadyAdded = supplierRecommendedProducts.some(p => p.id === item.id);
                              if (!isAlreadyAdded) {
                                addToSupplierRecommendedProducts(item.id);
                                enqueueSnackbar(t('product_added_to_recommended'), { variant: 'success' });
                              } else {
                                enqueueSnackbar(t('product_already_in_recommended'), { variant: 'warning' });
                              }
                            }}
                            disabled={supplierRecommendedProducts.some(p => p.id === item.id)}
                          >
                            {supplierRecommendedProducts.some(p => p.id === item.id) ? t('added') : t('add')}
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>

      </Stack>
    </Container>
  );
}
