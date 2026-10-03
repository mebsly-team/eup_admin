import debounce from 'lodash.debounce';
import { useMemo, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import axiosInstance from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';

import { IProductSupplier } from 'src/types/product';

// ----------------------------------------------------------------------

type Option = { id: number; name: string };

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSaved: (offer: IProductSupplier) => void;
  // The offer being edited; leave out to add one.
  offer?: IProductSupplier | null;
  // Adding from the product page fixes the product, from the supplier page the supplier.
  productId?: number;
  supplierId?: number;
  // Suppliers already linked to the product, left out of the picker.
  excludeSupplierIds?: number[];
};

function apiError(error: any) {
  const data = error?.response?.data || error;
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === 'string') return first;
  }
  return 'Opslaan mislukt';
}

export default function ProductSupplierDialog({
  open,
  onClose,
  onSaved,
  offer,
  productId,
  supplierId,
  excludeSupplierIds = [],
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!offer;
  const pickSupplier = !isEdit && !supplierId;
  const pickProduct = !isEdit && !productId;

  const [supplier, setSupplier] = useState<Option | null>(null);
  const [product, setProduct] = useState<Option | null>(null);
  const [articleCode, setArticleCode] = useState('');
  const [price, setPrice] = useState('');
  const [stockFree, setStockFree] = useState('');
  const [stockTotal, setStockTotal] = useState('');
  const [saving, setSaving] = useState(false);

  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setSupplier(null);
    setProduct(null);
    setArticleCode(offer?.supplier_article_code || '');
    setPrice(offer?.purchase_price != null ? String(Number(offer.purchase_price)) : '');
    setStockFree(offer ? String(offer.stock_free) : '');
    setStockTotal(offer ? String(offer.stock_total) : '');
  }, [open, offer]);

  useEffect(() => {
    if (!open || !pickSupplier) return;
    axiosInstance
      .get(`/suppliers/?limit=3000&offset=0&ordering=name`)
      .then(({ data }) =>
        setSupplierOptions((data?.results || data || []).map((s: any) => ({ id: s.id, name: s.name })))
      )
      .catch((error) => console.error(error));
  }, [open, pickSupplier]);

  const searchProducts = useMemo(
    () =>
      debounce((query: string) => {
        axiosInstance
          .get(`/products/?short=true&limit=20&search=${encodeURIComponent(query)}`)
          .then(({ data }) =>
            setProductOptions(
              (data?.results || []).map((p: any) => ({
                id: p.id,
                name: `${p.title}${p.ean ? ` · ${p.ean}` : ''}`,
              }))
            )
          )
          .catch((error) => console.error(error));
      }, 400),
    []
  );

  useEffect(() => {
    if (open && pickProduct && productSearch.trim().length >= 2) searchProducts(productSearch);
  }, [open, pickProduct, productSearch, searchProducts]);

  useEffect(() => () => searchProducts.cancel(), [searchProducts]);

  // Typing one stock fills the other while it is still empty: most suppliers give one number.
  const handleFree = (value: string) => {
    setStockFree(value);
    if (!isEdit && stockTotal === '') setStockTotal(value);
  };

  const handleSave = async () => {
    const payload: Record<string, any> = {
      supplier_article_code: articleCode.trim(),
      purchase_price: price === '' ? null : price.replace(',', '.'),
      stock_free: stockFree === '' ? 0 : Number(stockFree),
      stock_total: stockTotal === '' ? Number(stockFree || 0) : Number(stockTotal),
    };
    setSaving(true);
    try {
      let response;
      if (isEdit) {
        response = await axiosInstance.patch(`/product-suppliers/${offer!.id}/`, payload);
      } else {
        payload.product = productId ?? product?.id;
        payload.supplier = supplierId ?? supplier?.id;
        response = await axiosInstance.post(`/product-suppliers/`, payload);
      }
      onSaved(response.data);
      onClose();
    } catch (error) {
      enqueueSnackbar(apiError(error), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    !saving &&
    (isEdit || ((supplierId || supplier) && (productId || product))) &&
    Number(stockFree || 0) >= 0 &&
    Number(stockTotal || 0) >= 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {isEdit
          ? `${offer!.supplier_detail.name} — ${offer!.product_detail.title}`
          : 'Leverancier koppelen'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {pickSupplier && (
            <Autocomplete
              options={supplierOptions.filter((s) => !excludeSupplierIds.includes(s.id))}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={supplier}
              onChange={(event, value) => setSupplier(value)}
              renderInput={(params) => <TextField {...params} label="Leverancier" autoFocus />}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.name}
                </li>
              )}
            />
          )}

          {pickProduct && (
            <Autocomplete
              options={productOptions}
              filterOptions={(options) => options}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={product}
              onChange={(event, value) => setProduct(value)}
              onInputChange={(event, value) => setProductSearch(value)}
              noOptionsText={productSearch.length < 2 ? 'Typ titel of EAN' : 'Geen producten'}
              renderInput={(params) => <TextField {...params} label="Product" autoFocus />}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.name}
                </li>
              )}
            />
          )}

          <TextField
            label="Artikelcode leverancier"
            value={articleCode}
            onChange={(event) => setArticleCode(event.target.value)}
          />
          <TextField
            label="Inkoopprijs (excl. btw)"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Voorraad vrij"
              type="number"
              value={stockFree}
              onChange={(event) => handleFree(event.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
            />
            <TextField
              label="Voorraad totaal"
              type="number"
              value={stockTotal}
              onChange={(event) => setStockTotal(event.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Annuleren
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          Opslaan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
