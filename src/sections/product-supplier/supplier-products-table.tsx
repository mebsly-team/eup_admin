import debounce from 'lodash.debounce';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { IProductSupplier } from 'src/types/product';

import ProductSupplierDialog from './product-supplier-dialog';
import { SOURCE_LABEL, formatPrice } from './product-suppliers-card';
import SupplierOfferImportDialog from './supplier-offer-import-dialog';

// ----------------------------------------------------------------------

type Props = {
  supplierId: number;
  supplierName?: string;
  onCountChange?: (count: number) => void;
};

const COLUMNS = [
  { id: 'product__title', label: 'Product' },
  { id: '', label: 'Art.code' },
  { id: 'purchase_price', label: 'Inkoopprijs', align: 'right' as const },
  { id: '', label: 'Marge', align: 'right' as const },
  { id: 'stock_free', label: 'Hun voorraad vrij / totaal', align: 'right' as const },
  { id: '', label: 'Eigen voorraad', align: 'right' as const },
  { id: 'stock_updated_at', label: 'Bijgewerkt' },
  { id: '', label: '' },
];

export default function SupplierProductsTable({ supplierId, supplierName, onCountChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<IProductSupplier[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [ordering, setOrdering] = useState('product__title');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const [editing, setEditing] = useState<IProductSupplier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState<IProductSupplier | null>(null);

  const applySearch = useMemo(
    () =>
      debounce((value: string) => {
        setPage(0);
        setQuery(value);
      }, 500),
    []
  );
  useEffect(() => () => applySearch.cancel(), [applySearch]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/product-suppliers/?supplier=${supplierId}&limit=${rowsPerPage}&offset=${
          page * rowsPerPage
        }&ordering=${ordering}${query ? `&search=${encodeURIComponent(query)}` : ''}`
      );
      setRows(data?.results || []);
      setCount(data?.count || 0);
      if (!query) onCountChange?.(data?.count || 0);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Producten konden niet geladen worden', { variant: 'error' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, page, rowsPerPage, ordering, query, enqueueSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (id: string) => {
    setPage(0);
    setOrdering((prev) => (prev === id ? `-${id}` : id));
  };

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

  return (
    <Card>
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        spacing={1.5}
        sx={{ p: 2 }}
      >
        <TextField
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            applySearch(event.target.value);
          }}
          placeholder="Zoek op titel, EAN of artikelcode"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: '1 1 320px' }}
        />
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:import-linear" />}
          onClick={() => setImportOpen(true)}
        >
          Importeren
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Product koppelen
        </Button>
        <Link
          component={RouterLink}
          href={`${paths.dashboard.product.root}?supplier=${supplierId}`}
          variant="body2"
          sx={{ ml: 'auto' }}
        >
          Open in productlijst
        </Link>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column, index) => (
                <TableCell key={index} align={column.align} sx={{ whiteSpace: 'nowrap' }}>
                  {column.id ? (
                    <TableSortLabel
                      active={ordering.replace('-', '') === column.id}
                      direction={ordering.startsWith('-') ? 'desc' : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const product = row.product_detail;
              const price = Number(product.price_per_piece) || 0;
              const margin =
                price > 0 && row.purchase_price !== null
                  ? Math.round(((price - Number(row.purchase_price)) / price) * 100)
                  : null;
              const isDefault = product.default_supplier_id === supplierId;
              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ minWidth: 260 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        variant="rounded"
                        src={product.image ? `${IMAGE_FOLDER_PATH}${product.image}` : undefined}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Link
                          component={RouterLink}
                          href={paths.dashboard.product.edit(String(product.id))}
                          color="inherit"
                          variant="subtitle2"
                          sx={{ display: 'block' }}
                        >
                          {product.title}
                        </Link>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {product.ean || '—'}
                          </Typography>
                          {isDefault && (
                            <Tooltip title="Inkoop van dit product gaat nu naar deze leverancier">
                              <Label color="success" variant="soft">
                                Goedkoopst
                              </Label>
                            </Tooltip>
                          )}
                          {!product.is_product_active && (
                            <Label color="default" variant="soft">
                              Inactief
                            </Label>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.supplier_article_code || '—'}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatPrice(row.purchase_price)}
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
                      color: row.stock_free > 0 ? 'info.dark' : 'text.disabled',
                    }}
                  >
                    {row.stock_free} / {row.stock_total}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {product.free_stock} / {product.overall_stock}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {row.stock_updated_at ? fDateTime(row.stock_updated_at, 'dd-MM-yyyy HH:mm') : '—'}
                    <Box component="span" sx={{ ml: 0.75, color: 'text.disabled' }}>
                      {SOURCE_LABEL[row.source] || row.source}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Bewerken">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(row);
                          setDialogOpen(true);
                        }}
                      >
                        <Iconify icon="solar:pen-bold" width={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ontkoppelen">
                      <IconButton size="small" color="error" onClick={() => setDeleting(row)}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {!rows.length && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  {loading
                    ? 'Laden…'
                    : query
                      ? 'Geen producten gevonden.'
                      : 'Nog geen producten gekoppeld. Koppel een product of importeer een prijslijst.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[25, 50, 100]}
        onPageChange={(event, value) => setPage(value)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        labelRowsPerPage="Per pagina"
      />

      <ProductSupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => load()}
        offer={editing}
        supplierId={supplierId}
      />

      <SupplierOfferImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => load()}
        supplierId={supplierId}
        supplierName={supplierName}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Product ontkoppelen"
        content={
          deleting
            ? `${deleting.product_detail.title} wordt bij deze leverancier verwijderd (prijs en voorraad).`
            : ''
        }
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Ontkoppelen
          </Button>
        }
      />
    </Card>
  );
}
