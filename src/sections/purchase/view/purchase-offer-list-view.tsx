import { Fragment, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import axiosInstance from 'src/utils/axios';

import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom, TablePaginationCustom, useTable, TableNoData, TableEmptyRows, emptyRows } from 'src/components/table';
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';

import { IPurchaseItem, IPurchaseTableFilters } from 'src/types/purchase';
import { ISupplierItem } from 'src/types/supplier';

import PurchaseTableRow from '../purchase-table-row';
import PurchaseItemRow from '../purchase-item-row';
import PurchaseTableToolbar from '../purchase-table-toolbar';
import PurchaseTableFiltersResult from '../purchase-table-filters-result';

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'supplier_name', label: 'supplier' },
  { id: 'purchase_invoice_date', label: 'invoice_date' },
  { id: 'purchase_invoice_number', label: 'invoice_number' },
  { id: 'number_of_items', label: 'items', align: 'center' },
  { id: 'total_exc_btw', label: 'total_excl_btw', align: 'right' },
  { id: 'total_inc_btw', label: 'total_incl_btw', align: 'right' },
  { id: 'expand', label: '', width: 68 },
  { id: 'actions', label: '', width: 176 },
];

// Total number of columns rendered per row, used for full-width cells.
const COLUMN_COUNT = TABLE_HEAD.length + 1;

const ITEMS_TABLE_HEAD = [
  { id: 'checkbox', width: 48 },
  { id: 'product_image', label: 'image', align: 'center', width: 80 },
  { id: 'product_ean', label: 'ean' },
  { id: 'product_title', label: 'title' },
  { id: 'product_quantity', label: 'quantity', align: 'center' },
  { id: 'product_purchase_price', label: 'purchase_price', align: 'right' },
];

const defaultFilters: IPurchaseTableFilters = {
  name: '',
  status: [],
  startDate: null,
  endDate: null,
};

export default function PurchaseListView() {
  const table = useTable();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const settings = useSettingsContext();

  const [offersData, setOffersData] = useState<IPurchaseItem[]>([]);
  const [offersCount, setOffersCount] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<ISupplierItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplierItem | null>(null);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const limit = table.rowsPerPage;
      const offset = table.page * table.rowsPerPage;
      // One offer per supplier, sorted by amount from highest to lowest
      const offersResponse = await axiosInstance.get(
        `/purchases/?type=offer&ordering=-total_inc_btw,-id&limit=${limit}&offset=${offset}`
      );
      setOffersData(offersResponse.data.results || []);
      setOffersCount(offersResponse.data.count || 0);
    } catch (error) {
      console.error('Error fetching offers:', error);
      enqueueSnackbar(t('failed_to_fetch_offers'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, t, table.page, table.rowsPerPage]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/suppliers/?limit=9999');
      setSuppliers(response.data.results || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      enqueueSnackbar(t('failed_to_fetch_suppliers'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t]);

  const handleCreateOfferFromSupplier = useCallback(async () => {
    if (!selectedSupplier) {
      enqueueSnackbar(t('supplier_required') || 'Please select a supplier', { variant: 'error' });
      return;
    }

    try {
      setCreatingOffer(true);
      const response = await axiosInstance.post('/purchase/prepare_supplier_offer/', {
        supplier_id: selectedSupplier.id
      });

      if (response.data?.purchase_offer_id) {
        enqueueSnackbar(t('offer_created_successfully') || 'Offer created successfully', { variant: 'success' });
      } else {
        enqueueSnackbar(response.data?.message || 'No products with low stock, no offer created', { variant: 'info' });
      }

      // Refresh the offers list
      fetchOffers();

      // Reset supplier selection
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error creating offer:', error);
      enqueueSnackbar(t('failed_to_create_offer') || 'Failed to create offer', { variant: 'error' });
    } finally {
      setCreatingOffer(false);
    }
  }, [selectedSupplier, enqueueSnackbar, t, fetchOffers]);

  useEffect(() => {
    fetchOffers();
    fetchSuppliers();
  }, [fetchOffers, fetchSuppliers]);

  const handleFilters = useCallback(
    (name: string, value: any) => {
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(async (id: string) => {
    try {
      await axiosInstance.delete(`/purchases/${id}/`);
      enqueueSnackbar(t('offer_deleted_successfully'));
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      enqueueSnackbar(t('failed_to_delete_offer'), { variant: 'error' });
    }
  }, [enqueueSnackbar, t, fetchOffers]);

  /**
   * Build the offer PDF and move the offer to the "sent to supplier" list.
   * The PDF download happens first: if it fails the offer stays here so the
   * user can retry, instead of silently disappearing from this page.
   */
  const handleSendToSupplier = useCallback(
    async (id: string) => {
      try {
        setSendingId(id);

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
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating offer PDF:', error);
        enqueueSnackbar(t('failed_to_download_pdf'), { variant: 'error' });
        setSendingId(null);
        return;
      }

      try {
        await axiosInstance.post(`/purchases/${id}/mark-as-sent/`);
        enqueueSnackbar(t('offer_sent_to_supplier_successfully'), { variant: 'success' });
        fetchOffers();
      } catch (error: any) {
        console.error('Error marking offer as sent:', error);
        enqueueSnackbar(error?.response?.data?.error || t('failed_to_send_offer'), {
          variant: 'error',
        });
      } finally {
        setSendingId(null);
      }
    },
    [enqueueSnackbar, t, fetchOffers]
  );

  const handleExpandRow = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const handleEditRow = (id: string) => {
    router.push(paths.dashboard.purchase.edit(id));
  };

  const renderPurchaseItems = (items: any[]) => (
    <Collapse in timeout="auto" unmountOnExit>
      <Box sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('purchase_items')}
        </Typography>
        <Table size="small">
          <TableHeadCustom
            headLabel={ITEMS_TABLE_HEAD.map(head => ({
              ...head,
              label: head.label ? t(head.label) : ''
            }))}
          />
          <TableBody>
            {items.map((item) => (
              <PurchaseItemRow
                key={item.id}
                item={item}
                selected={table.selected.includes(item.id)}
                onSelectRow={() => table.onSelectRow(item.id)}
              />
            ))}
          </TableBody>
        </Table>
      </Box>
    </Collapse>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredOffers = offersData.filter((offer) => {
    if (filters.name && !offer.supplier_detail.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.startDate && new Date(offer.purchase_invoice_date) < filters.startDate) {
      return false;
    }
    if (filters.endDate && new Date(offer.purchase_invoice_date) > filters.endDate) {
      return false;
    }
    return true;
  });

  const denseHeight = table.dense ? 52 : 72;
  const canReset = !!(filters.name || !!filters.status.length || filters.startDate || filters.endDate);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('bestel_advies')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('purchases'), href: paths.dashboard.purchase.list },
          { name: t('bestel_advies') },
        ]}
        action={
          <Button
            variant="outlined"
            href={paths.dashboard.purchase.offersSent}
            startIcon={<Iconify icon="eva:paper-plane-outline" />}
          >
            {t('offers_sent_to_supplier')}
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {t('bestel_advies_page_description')}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Autocomplete
          value={selectedSupplier}
          onChange={(event, newValue) => setSelectedSupplier(newValue)}
          options={suppliers}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('select_supplier') || 'Select Supplier'}
              size="small"
              sx={{ minWidth: 200 }}
            />
          )}
        />
        <LoadingButton
          variant="contained"
          color="primary"
          loading={creatingOffer}
          onClick={handleCreateOfferFromSupplier}
          disabled={!selectedSupplier}
          startIcon={<Iconify icon="eva:plus-outline" />}
        >
          {t('create_offer_from_supplier') || 'Create Offer from Supplier'}
        </LoadingButton>
      </Stack>
      <Card>
        <PurchaseTableToolbar
          filters={filters}
          onFilters={handleFilters}
          statusOptions={['pending', 'completed', 'cancelled']}
        />

        {canReset && (
          <PurchaseTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={offersCount}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ width: 1 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD.map(head => ({
                  ...head,
                  label: head.label ? t(head.label) : ''
                }))}
                rowCount={offersCount}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    offersData.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {filteredOffers.map((row) => (
                  <Fragment key={row.id}>
                    <PurchaseTableRow
                      purchase={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      expanded={expandedRow === row.id}
                      onExpand={() => handleExpandRow(row.id)}
                      onSendToSupplier={() => handleSendToSupplier(row.id)}
                      sending={sendingId === row.id}
                    />
                    {expandedRow === row.id && (
                      <TableRow>
                        <TableCell colSpan={COLUMN_COUNT} sx={{ p: 0 }}>
                          {renderPurchaseItems(row.items)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, offersCount)}
                />
                <TableNoData notFound={!filteredOffers.length && canReset} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={offersCount}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
