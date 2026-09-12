import { Fragment, useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useTranslate } from 'src/locales';
import { useBoolean } from 'src/hooks/use-boolean';
import axiosInstance from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { IPurchaseItem, IPurchaseTableFilters } from 'src/types/purchase';

import PurchaseItemRow from '../purchase-item-row';
import PurchaseTableRow from '../purchase-table-row';
import PurchaseTableToolbar from '../purchase-table-toolbar';
import PurchaseTableFiltersResult from '../purchase-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'supplier_name', label: 'supplier' },
  { id: 'purchase_invoice_date', label: 'invoice_date' },
  { id: 'purchase_invoice_number', label: 'invoice_number' },
  { id: 'sent_at', label: 'sent_at' },
  { id: 'number_of_items', label: 'items', align: 'center' },
  { id: 'total_exc_btw', label: 'total_excl_btw', align: 'right' },
  { id: 'total_inc_btw', label: 'total_incl_btw', align: 'right' },
  { id: 'expand', label: '', width: 68 },
  { id: 'actions', label: '', width: 220 },
];

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

// Total number of columns rendered per row, used for full-width cells.
const COLUMN_COUNT = TABLE_HEAD.length + 1;

// ----------------------------------------------------------------------

export default function PurchaseOfferSentListView() {
  const table = useTable({ defaultOrderBy: 'sent_at', defaultOrder: 'desc' });
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const settings = useSettingsContext();
  const confirmConvert = useBoolean();

  const [sentOffers, setSentOffers] = useState<IPurchaseItem[]>([]);
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [pendingConvert, setPendingConvert] = useState<IPurchaseItem | null>(null);

  const fetchSentOffers = useCallback(async () => {
    try {
      setLoading(true);
      const limit = table.rowsPerPage;
      const offset = table.page * table.rowsPerPage;
      // Offers already sent to a supplier. The daily cron job only touches
      // type=offer, so nothing in this list is ever regenerated or removed.
      const response = await axiosInstance.get(
        `/purchases/?type=offer_sent&ordering=-sent_at,-id&limit=${limit}&offset=${offset}`
      );
      setSentOffers(response.data.results || []);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching sent offers:', error);
      enqueueSnackbar(t('failed_to_fetch_sent_offers'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, t, table.page, table.rowsPerPage]);

  useEffect(() => {
    fetchSentOffers();
  }, [fetchSentOffers]);

  const handleFilters = useCallback((name: string, value: any) => {
    setFilters((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleExpandRow = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const handleEditRow = (id: string) => {
    router.push(paths.dashboard.purchase.edit(id));
  };

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await axiosInstance.delete(`/purchases/${id}/`);
        enqueueSnackbar(t('offer_deleted_successfully'));
        fetchSentOffers();
      } catch (error) {
        console.error('Error deleting sent offer:', error);
        enqueueSnackbar(t('failed_to_delete_offer'), { variant: 'error' });
      }
    },
    [enqueueSnackbar, t, fetchSentOffers]
  );

  const handleDownloadPdf = useCallback(
    async (id: string) => {
      try {
        setDownloadingId(id);
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
        enqueueSnackbar(t('pdf_downloaded_successfully'), { variant: 'success' });
      } catch (error) {
        console.error('Error downloading PDF:', error);
        enqueueSnackbar(t('failed_to_download_pdf'), { variant: 'error' });
      } finally {
        setDownloadingId(null);
      }
    },
    [enqueueSnackbar, t]
  );

  const handleAskConvert = useCallback(
    (offer: IPurchaseItem) => {
      setPendingConvert(offer);
      confirmConvert.onTrue();
    },
    [confirmConvert]
  );

  const handleConvertToPurchase = useCallback(async () => {
    if (!pendingConvert) {
      return;
    }
    const id = pendingConvert.id;
    confirmConvert.onFalse();

    try {
      setConvertingId(id);
      await axiosInstance.post(`/purchases/${id}/convert-to-purchase/`);
      enqueueSnackbar(t('offer_converted_to_purchase_successfully'), { variant: 'success' });
      fetchSentOffers();
    } catch (error: any) {
      console.error('Error converting sent offer to purchase:', error);
      enqueueSnackbar(error?.response?.data?.error || t('failed_to_convert_offer'), {
        variant: 'error',
      });
    } finally {
      setConvertingId(null);
      setPendingConvert(null);
    }
  }, [pendingConvert, confirmConvert, enqueueSnackbar, t, fetchSentOffers]);

  const renderPurchaseItems = (items: any[]) => (
    <Collapse in timeout="auto" unmountOnExit>
      <Box sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('purchase_items')}
        </Typography>
        <Table size="small">
          <TableHeadCustom
            headLabel={ITEMS_TABLE_HEAD.map((head) => ({
              ...head,
              label: head.label ? t(head.label) : '',
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

  const filteredOffers = sentOffers.filter((offer) => {
    if (
      filters.name &&
      !offer.supplier_detail.name.toLowerCase().includes(filters.name.toLowerCase())
    ) {
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
  const canReset = !!(
    filters.name ||
    !!filters.status.length ||
    filters.startDate ||
    filters.endDate
  );

  // This list carries an extra "sent at" column plus four row actions, so it
  // needs more room than the standard 'lg' container used by the advice list.
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('offers_sent_to_supplier')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('purchases'), href: paths.dashboard.purchase.list },
          { name: t('offers_sent_to_supplier') },
        ]}
        action={
          <Button
            variant="outlined"
            href={paths.dashboard.purchase.offers}
            startIcon={<Iconify icon="eva:arrow-back-outline" />}
          >
            {t('bestel_advies')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {t('offers_sent_page_description')}
      </Typography>

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
            results={count}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ width: 1 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD.map((head) => ({
                  ...head,
                  label: head.label ? t(head.label) : '',
                }))}
                rowCount={count}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    sentOffers.map((row) => row.id)
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
                      showSentAt
                      onDownloadPdf={() => handleDownloadPdf(row.id)}
                      downloading={downloadingId === row.id}
                      onConvertToPurchase={() => handleAskConvert(row)}
                      converting={convertingId === row.id}
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
                  emptyRows={emptyRows(table.page, table.rowsPerPage, count)}
                />
                <TableNoData notFound={!filteredOffers.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={count}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <ConfirmDialog
        open={confirmConvert.value}
        onClose={confirmConvert.onFalse}
        title={t('save_to_inkoop')}
        content={
          <Stack spacing={1}>
            <Typography variant="body2">{t('save_to_inkoop_confirm')}</Typography>
            {pendingConvert && (
              <Typography variant="subtitle2">
                #{pendingConvert.id} — {pendingConvert.supplier_detail.name}
              </Typography>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            variant="contained"
            color="success"
            loading={!!convertingId}
            onClick={handleConvertToPurchase}
          >
            {t('save_to_inkoop')}
          </LoadingButton>
        }
      />
    </Container>
  );
}
