import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { IProductSupplier } from 'src/types/product';

import ProductSupplierDialog from './product-supplier-dialog';

// ----------------------------------------------------------------------

type Props = {
  productId?: number;
  // Our selling price excl. btw per piece, for the margin column.
  sellPrice?: number | string | null;
  ownFree?: number;
  ownTotal?: number;
  onOffersChange?: (offers: IProductSupplier[]) => void;
};

export const SOURCE_LABEL: Record<string, string> = {
  manual: 'Handmatig',
  import: 'Import',
  api: 'API',
};

export function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  return `€ ${Number(value).toLocaleString('nl-NL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

// The supplier a purchase offer goes to: cheapest with stock, else cheapest
// (mirrors choose_supplier_offer in the backend, for one piece).
export function cheapestOffer(offers: IProductSupplier[]) {
  const priced = offers.filter(
    (offer) => offer.purchase_price !== null && offer.supplier_detail.is_active
  );
  const inStock = priced.filter((offer) => offer.stock_free > 0);
  const pool = inStock.length ? inStock : priced;
  return pool.reduce<IProductSupplier | null>(
    (best, offer) =>
      !best ||
      Number(offer.purchase_price) < Number(best.purchase_price) ||
      (Number(offer.purchase_price) === Number(best.purchase_price) &&
        offer.stock_free > best.stock_free)
        ? offer
        : best,
    null
  );
}

export default function ProductSuppliersCard({
  productId,
  sellPrice,
  ownFree = 0,
  ownTotal = 0,
  onOffersChange,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [offers, setOffers] = useState<IProductSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<IProductSupplier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<IProductSupplier | null>(null);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/product-suppliers/?product=${productId}&limit=200&ordering=purchase_price`
      );
      setOffers(data?.results || []);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Leveranciers konden niet geladen worden', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [productId, enqueueSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    onOffersChange?.(offers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await axiosInstance.delete(`/product-suppliers/${deleting.id}/`);
      setDeleting(null);
      load();
    } catch (error) {
      enqueueSnackbar('Verwijderen mislukt', { variant: 'error' });
    }
  };

  const chosen = cheapestOffer(offers);
  const supplierFree = offers.reduce((sum, offer) => sum + offer.stock_free, 0);
  const supplierTotal = offers.reduce((sum, offer) => sum + offer.stock_total, 0);
  const price = Number(sellPrice) || 0;

  return (
    <Card>
      <CardHeader
        title="Leveranciers"
        subheader="Inkoop gaat naar de goedkoopste leverancier die genoeg vrije voorraad heeft."
        action={
          productId ? (
            <Button
              size="small"
              variant="soft"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              Leverancier
            </Button>
          ) : null
        }
      />

      {!productId ? (
        <Typography variant="body2" sx={{ p: 3, color: 'text.secondary' }}>
          Sla het product eerst op om leveranciers toe te voegen.
        </Typography>
      ) : (
        <>
          <Stack direction="row" spacing={3} sx={{ px: 3, pt: 2, typography: 'body2' }}>
            <Box>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Eigen voorraad vrij / totaal:{' '}
              </Box>
              <strong>
                {ownFree} / {ownTotal}
              </strong>
            </Box>
            <Box>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Bij leveranciers:{' '}
              </Box>
              <Box component="strong" sx={{ color: 'info.dark' }}>
                {supplierFree} / {supplierTotal}
              </Box>
            </Box>
          </Stack>

          <TableContainer sx={{ mt: 1.5 }}>
            <Table size="small" sx={{ '& th, & td': { whiteSpace: 'nowrap' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Leverancier</TableCell>
                  <TableCell>Art.code</TableCell>
                  <TableCell align="right">Inkoopprijs</TableCell>
                  <TableCell align="right">Marge</TableCell>
                  <TableCell align="right">Vrij / totaal</TableCell>
                  <TableCell>Bijgewerkt</TableCell>
                  <TableCell width={88} />
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => {
                  const cost = Number(offer.purchase_price);
                  const margin =
                    price > 0 && offer.purchase_price !== null
                      ? Math.round(((price - cost) / price) * 100)
                      : null;
                  return (
                    <TableRow key={offer.id} hover selected={chosen?.id === offer.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Link
                            component={RouterLink}
                            href={paths.dashboard.supplier.edit(String(offer.supplier))}
                            color="inherit"
                            variant="subtitle2"
                          >
                            {offer.supplier_detail.name}
                          </Link>
                          {chosen?.id === offer.id && (
                            <Label color="success" variant="soft">
                              Goedkoopst
                            </Label>
                          )}
                          {!offer.supplier_detail.is_active && (
                            <Label color="default" variant="soft">
                              Inactief
                            </Label>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {offer.supplier_article_code || '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatPrice(offer.purchase_price)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          color: margin !== null && margin < 0 ? 'error.main' : 'text.secondary',
                        }}
                      >
                        {margin === null ? '—' : `${margin}%`}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          color: offer.stock_free > 0 ? 'info.dark' : 'text.disabled',
                        }}
                      >
                        {offer.stock_free} / {offer.stock_total}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {offer.stock_updated_at ? fDateTime(offer.stock_updated_at, 'dd-MM-yyyy HH:mm') : '—'}
                        <Box component="span" sx={{ ml: 0.75, color: 'text.disabled' }}>
                          {SOURCE_LABEL[offer.source] || offer.source}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Bewerken">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(offer);
                              setDialogOpen(true);
                            }}
                          >
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Verwijderen">
                          <IconButton size="small" color="error" onClick={() => setDeleting(offer)}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!offers.length && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                      {loading ? 'Laden…' : 'Nog geen leveranciers gekoppeld.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <ProductSupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => load()}
        offer={editing}
        productId={productId}
        excludeSupplierIds={offers.map((offer) => offer.supplier)}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Leverancier ontkoppelen"
        content={
          deleting
            ? `${deleting.supplier_detail.name} en zijn prijs en voorraad worden van dit product verwijderd.`
            : ''
        }
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Verwijderen
          </Button>
        }
      />
    </Card>
  );
}
