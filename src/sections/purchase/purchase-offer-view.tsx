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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useRouter } from 'src/routes/hooks';

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

type PurchaseItemDetail = IPurchaseItem['items'][0];

export function PurchaseOfferView({ id: supplierId }: { id: string }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const router = useRouter();

  const [currentPurchase, setCurrentPurchase] = useState<IPurchaseItem>({
    items: [],
    total_vat: '0',
    total_exc_btw: '0',
    total_inc_btw: '0',
    purchase_invoice_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [supplier, setSupplier] = useState<ISupplierItem | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<IProductItem[]>([]);
  console.log("🚀 ~ PurchaseOfferView ~ supplierProducts:", supplierProducts)
  console.log("🚀 ~ PurchaseOfferView ~ supplier:", supplier)
  const [supplierRecommendedProducts, setSupplierRecommendedProducts] = useState<IProductItem[]>([]);
  console.log("🚀 ~ PurchaseOfferView ~ supplierRecommendedProducts1:", supplierRecommendedProducts)
  const [eanSearch, setEanSearch] = useState('');

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
    const payload = [...(supplier?.recommended_product_offer || []), { id: product_id[0], quantity: 1 }]
    try {
      const response = await axiosInstance.put(`/suppliers/${supplierId}/`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        recommended_product_offer: payload,
      });
      setSupplier(response.data || {});
      // After updating the supplier, we need to update the product quantities
      const updatedProduct = supplierProducts.find(p => String(p.id) === product_id[0]);
      if (updatedProduct) {
        setSupplierRecommendedProducts(prev => [...prev, {
          ...updatedProduct,
          product_quantity: 1,
          product_purchase_price: updatedProduct.price_cost || '0',
          vat_rate: updatedProduct.vat || 21
        }]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [user?.token, enqueueSnackbar, t, supplierRecommendedProducts, supplier, supplierProducts]);

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
    const supplier_recommended_products_ids = supplier?.recommended_product_offer?.map((product) => product.id) || [];
    console.log("🚀 ~ PurchaseOfferView ~ supplier_recommended_products_ids:", supplier_recommended_products_ids)
    const recommendedProducts = supplierProducts
      .filter((product) => supplier_recommended_products_ids.includes(String(product.id)))
      .map(product => ({
        ...product,
        product_quantity: 1,
        product_purchase_price: product.price_cost || '0',
        vat_rate: product.vat || 21
      }));
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
        await addToSupplierRecommendedProducts([String(product.id)]);
        setEanSearch('');
        enqueueSnackbar(t('product_added_to_recommended'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('product_not_found'), { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      enqueueSnackbar(t('failed_to_fetch_product'), { variant: 'error' });
    }
  };

  const handleRemoveProduct = async (itemId: string) => {
    try {
      // Filter out the product to be removed from the recommended products
      const updatedRecommendedOffer = supplier?.recommended_product_offer?.filter(
        item => String(item.id) !== itemId
      ) || [];

      // Update the supplier via API
      const response = await axiosInstance.put(`/suppliers/${supplierId}/`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        recommended_product_offer: updatedRecommendedOffer,
      });

      // Update local state if API call was successful
      setSupplier(response.data || {});
      const updatedProducts = supplierRecommendedProducts.filter(item => String(item.id) !== itemId);
      setSupplierRecommendedProducts(updatedProducts);
      enqueueSnackbar(t('product_removed_from_recommended'), { variant: 'success' });
    } catch (error) {
      console.error('Error removing product:', error);
      enqueueSnackbar(t('failed_to_remove_product'), { variant: 'error' });
    }
  };

  const calculateTotals = (recommendedProducts: IProductItem[]) => {
    const totals = recommendedProducts?.reduce(
      (acc, item) => {
        const itemPrice = Number(item.price_cost || 0) * (item.product_quantity || 1);
        const itemVat = itemPrice * (Number(item.vat || 0) / 100);
        return {
          totalExcBtw: acc.totalExcBtw + itemPrice,
          totalVat: acc.totalVat + itemVat,
        };
      },
      { totalExcBtw: 0, totalVat: 0 }
    );

    const totalIncBtw = totals.totalExcBtw + totals.totalVat;

    // Convert recommended products to purchase items format
    const purchaseItems = recommendedProducts.map(item => ({
      id: crypto.randomUUID(),
      product: item.id,
      product_detail: {
        id: item.id,
        title: item.title,
        images: item.images || [],
        ean: item.ean,
      },
      product_quantity: item.product_quantity || 1,
      product_purchase_price: item.price_cost || '0',
      vat_rate: item.vat || 21,
    })) as PurchaseItemDetail[];

    setCurrentPurchase((prev) => ({
      ...prev!,
      items: purchaseItems,
      total_exc_btw: totals.totalExcBtw.toFixed(2),
      total_inc_btw: totalIncBtw.toFixed(2),
      total_vat: totals.totalVat.toFixed(2),
    }));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const updatedProducts = supplierRecommendedProducts.map(item =>
      String(item.id) === itemId ? { ...item, product_quantity: quantity } : item
    );
    setSupplierRecommendedProducts(updatedProducts);
    calculateTotals(updatedProducts);
  };

  // Keep purchase summary in sync with recommended products
  useEffect(() => {
    if (supplierRecommendedProducts.length > 0) {
      calculateTotals(supplierRecommendedProducts);
    } else {
      setCurrentPurchase(prev => ({
        ...prev,
        items: [],
        total_exc_btw: '0',
        total_inc_btw: '0',
        total_vat: '0',
      }));
    }
  }, [supplierRecommendedProducts]);

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
    if (!supplierId) {
      enqueueSnackbar(t('supplier_required'), { variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      const changes = {
        supplier: String(supplierId) !== String(currentPurchase?.supplier),
        purchase_invoice_date: currentPurchase?.purchase_invoice_date || today,
        items: currentPurchase?.items?.map(item => ({
          quantity: item.product_quantity,
          price: item.product_purchase_price,
          vat_rate: item.vat_rate,
        })),
      };

      const cleanedPurchase = {
        supplier: supplierId,
        purchase_invoice_date: currentPurchase?.purchase_invoice_date || today,
        total_exc_btw: currentPurchase?.total_exc_btw,
        total_inc_btw: currentPurchase?.total_inc_btw,
        total_vat: currentPurchase?.total_vat,
        items: currentPurchase?.items?.map(item => ({
          product: item.product,
          product_quantity: item.product_quantity,
          product_purchase_price: item.product_purchase_price,
          vat_rate: item.vat_rate,
        })),
        history: [{
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
      enqueueSnackbar(t('purchase_updated_successfully'));
      router.push(paths.dashboard.purchase.list);
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

        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('recommended_products')}</Typography>

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
                      {supplierRecommendedProducts?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Link
                              href={paths.dashboard.product.edit(String(item.id))}
                              target="_blank"
                              rel="noopener"
                              color="blue"
                              sx={{
                                fontWeight: 'fontWeightBold',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                display: 'block',
                                maxWidth: 250,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.title}
                            </Link>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('supplier_article_code')}: {item.supplier_article_code}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.ean}</TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" display="block">
                              {t('overall_stock')}: {item.overall_stock || 0}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {t('free_stock')}: {item.free_stock || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" display="block">
                              {t('min_stock_value')}: {item.min_stock_value || 0}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {t('min_order_amount')}: {item.min_order_amount || 0}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {t('max_order_allowed_per_unit')}: {item.max_order_allowed_per_unit || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" display="block">
                              €{item.price_cost || '0'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              +{item.vat || 0}% {t('vat')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.product_quantity || 1}
                              onChange={(e) => handleUpdateQuantity(String(item.id), Number(e.target.value))}
                              InputProps={{
                                inputProps: { min: 1 },
                                sx: { width: 60 }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveProduct(String(item.id))}
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

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6">{t('purchase_summary')}</Typography>

                <Stack>
                  <DatePicker
                    label={t('date')}
                    value={currentPurchase?.purchase_invoice_date ? new Date(currentPurchase.purchase_invoice_date) : new Date()}
                    onChange={(newValue) => {
                      setCurrentPurchase((prev) => ({
                        ...prev!,
                        purchase_invoice_date: newValue?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                      }));
                    }}
                  />


                </Stack>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('supplier')}
                    </Typography>
                    <Typography variant="subtitle2">{supplier?.name}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('purchase_invoice_date')}
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
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="h6">{t('all_products_from_supplier') + ' ' + supplier?.name}</Typography>

                <Stack spacing={2}>
                  {supplierProducts?.map((item) => (
                    <Card key={item.id} sx={{ p: 2, minHeight: 120 }}>
                      <Grid container spacing={2}>
                        {/* Left Column - Basic Info */}
                        <Grid item xs={3.5}>
                          <Link
                            href={paths.dashboard.product.edit(String(item.id))}
                            target="_blank"
                            rel="noopener"
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
                            {t('ean')}: {item.ean}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('article_code')}: {item.article_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('supplier_article_code')}: {item.supplier_article_code}
                          </Typography>
                        </Grid>

                        {/* Middle Column - Stock Info */}
                        <Grid item xs={3.5}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {t('location')}: {item.location || '-'} ({item.location_stock || '0'})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('extra_location')}: {item.extra_location || '-'} ({item.extra_location_stock || '0'})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('free_stock')}: {item.free_stock || '0'} | {t('overall_stock')}: {item.overall_stock || '0'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('min_order_amount')}: {item.min_order_amount || '0'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('max_order_allowed_per_unit')}: {item.max_order_allowed_per_unit || '0'}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Right Column - Pricing */}
                        <Grid item xs={3.5}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {t('price_cost')}: €{item.price_cost || '0'} (+{item.vat || '0'}% {t('vat')})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('price_per_piece')}: €{item.price_per_piece || '0'} (€{item.price_per_piece_vat || '0'} {t('incl')})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('price_per_unit')}: €{item.price_per_unit || '0'} (€{item.price_per_unit_vat || '0'} {t('incl')})
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
                                addToSupplierRecommendedProducts([String(item.id)]);
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
