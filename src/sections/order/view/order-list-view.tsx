import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Link from '@mui/material/Link';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';
import { isAfter } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/components/table';
import { LoadingScreen } from 'src/components/loading-screen';

import { IOrderItem, IOrderTableFilters } from 'src/types/order';

import OrderTableRow, { ORDER_TABLE_COLUMNS } from '../order-table-row';
import OrderTableToolbar from '../order-table-toolbar';

// ----------------------------------------------------------------------

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending_order', label: 'Order' },
  { value: 'user_pending', label: 'Op klant' },
  { value: 'werkbon', label: 'Orderpicker' },
  { value: 'packing', label: 'Pakbon' }, // Verpakking
  { value: 'shipped', label: 'Verzonden' },
  { value: 'delivered', label: 'Geleverd' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'refunded', label: 'Terugbetaald' },
  { value: 'pending_offer', label: 'Offer' },
  { value: 'confirmed', label: 'Bevestigd' },
  { value: 'other', label: 'Anders' },
];

// The statuses of the daily order flow get a tab; the rest sit in a menu.
const TAB_STATUSES = [
  'pending_order',
  'user_pending',
  'werkbon',
  'packing',
  'shipped',
  'delivered',
  'pending_offer',
];
const STATUS_TABS = [
  { value: 'all', label: 'Alle' },
  ...ORDER_STATUS_OPTIONS.filter((option) => TAB_STATUSES.includes(option.value)),
];
const MORE_STATUSES = ORDER_STATUS_OPTIONS.filter(
  (option) => !TAB_STATUSES.includes(option.value)
);

const FILTER_PARAMS: Record<keyof IOrderTableFilters, string> = {
  status: 'status',
  name: 'name',
  orderId: 'order_id',
  ean: 'ean',
  startDate: 'start_date',
  endDate: 'end_date',
  paymentStatus: 'payment_status',
};

const TABLE_HEAD = [
  { id: 'id', label: 'Bestelling', width: 110, padding: 1 },
  { id: 'name', label: 'Klant', padding: 1 },
  { id: 'ordered_date', label: 'Datum', width: 110, padding: 1 },
  { id: 'totalQuantity', label: 'Items', width: 60, align: 'right', padding: 1 },
  { id: 'total', label: 'Bedrag', width: 110, align: 'right', padding: 1 },
  { id: 'is_paid', label: 'Betaling', width: 120, padding: 1 },
  { id: 'snelstart_order_number', label: 'Snelstart', width: 150, padding: 1 },
  { id: 'status', label: 'Status', width: 120, padding: 1 },
  { id: '', width: 96, padding: 1 },
];

// ----------------------------------------------------------------------

export default function OrderListView() {
  console.log('OrderListView - component rendering');

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultOrderBy: 'ordered_date' });
  const { t, onChangeLang } = useTranslate();

  const settings = useSettingsContext();

  const router = useRouter();

  const location = useLocation();
  const [orderList, setOrderList] = useState<IOrderItem[]>([]);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const queryParams = new URLSearchParams(location.search);

  const defaultFilters: IOrderTableFilters = {
    status: queryParams.get('status') || 'all',
    name: queryParams.get('name') || '',
    orderId: queryParams.get('order_id') || '',
    ean: queryParams.get('ean') || '',
    startDate:
      (queryParams.get('start_date') &&
        queryParams.get('start_date') !== 'undefined' &&
        queryParams.get('start_date')) ||
      '',
    endDate:
      (queryParams.get('end_date') &&
        queryParams.get('end_date') !== 'undefined' &&
        queryParams.get('end_date')) ||
      '',
    paymentStatus: queryParams.get('payment_status') || 'all',
  };

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [isSyncing, setIsSyncing] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.get('page')) {
      params.set('page', '1');
      router.replace(`${location.pathname}?${params.toString()}`);
    }
  }, [location.pathname, location.search, router]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlStatus = params.get('status') || 'all';
    const urlName = params.get('name') || '';
    const urlOrderId = params.get('order_id') || '';
    const urlEan = params.get('ean') || '';
    const urlStartDateStr = params.get('start_date') || '';
    const urlEndDateStr = params.get('end_date') || '';
    const urlPaymentStatus = params.get('payment_status') || 'all';

    const urlStartDate = urlStartDateStr ? new Date(urlStartDateStr) : '';
    const urlEndDate = urlEndDateStr ? new Date(urlEndDateStr) : '';

    const pageParam = params.get('page');
    const urlPage = pageParam ? Number(pageParam) : 1;
    const newPageIdx = urlPage > 0 ? urlPage - 1 : 0;

    if (table.page !== newPageIdx) {
      table.setPage(newPageIdx);
    }

    const currentStartDate = filters.startDate instanceof Date
      ? formatDate(filters.startDate)
      : filters.startDate || '';
    const currentEndDate = filters.endDate instanceof Date
      ? formatDate(filters.endDate)
      : filters.endDate || '';

    if (
      filters.status !== urlStatus ||
      filters.name !== urlName ||
      filters.orderId !== urlOrderId ||
      filters.ean !== urlEan ||
      filters.paymentStatus !== urlPaymentStatus ||
      currentStartDate !== urlStartDateStr ||
      currentEndDate !== urlEndDateStr
    ) {
      setFilters({
        status: urlStatus,
        name: urlName,
        orderId: urlOrderId,
        ean: urlEan,
        paymentStatus: urlPaymentStatus,
        startDate: urlStartDate || '',
        endDate: urlEndDate || '',
      });
    }
  }, [location.search]);

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  const getAll = async () => {
    try {
      console.log('OrderListView - fetching orders...');
      setIsLoading(true);
      const statusFilter = filters.status !== 'all' && filters.status !== 'uninvoiced' ? `&status=${filters.status}` : '';
      const uninvoicedFilter = filters.status === 'uninvoiced' ? `&uninvoiced=true` : '';
      const orderByParam = table.orderBy
        ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
        : '';
      const searchFilter = filters.name ? `&search=${filters.name}` : '';
      const orderIdFilter = filters.orderId ? `&order_id=${encodeURIComponent(filters.orderId)}` : '';
      const eanFilter = filters.ean ? `&ean=${encodeURIComponent(filters.ean)}` : '';
      const startDateFilter = filters.startDate
        ? `&start_date=${filters.startDate instanceof Date ? formatDate(filters.startDate) : filters.startDate}`
        : '';
      const endDateFilter = filters.endDate
        ? `&end_date=${filters.endDate instanceof Date ? formatDate(filters.endDate) : filters.endDate}`
        : '';
      const paymentStatusFilter =
        filters.paymentStatus !== 'all'
          ? `&is_paid=${filters.paymentStatus === 'paid'}`
          : '';

      const { data } = await axiosInstance.get(
        `/orders/?limit=${table.rowsPerPage}&offset=${table.page * table.rowsPerPage
        }${searchFilter}${orderIdFilter}${eanFilter}${statusFilter}${uninvoicedFilter}${orderByParam}${startDateFilter}${endDateFilter}${paymentStatusFilter}`
      );
      console.log('OrderListView - orders fetched successfully:', data);
      setCount(data.count || 0);
      setOrderList(data.results || []);
    } catch (error) {
      console.error('OrderListView - error fetching orders:', error);
      enqueueSnackbar('Error loading orders', { variant: 'error' });
      setOrderList([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncPayments = async () => {
    setIsSyncing(true);
    try {
      const response = await axiosInstance.get('/orders/sync-snelstart-payments/');
      enqueueSnackbar(response.data.message || 'Payments synced successfully', { variant: 'success' });
      getAll(); // Refresh the list
    } catch (error) {
      console.error('Error syncing payments:', error);
      enqueueSnackbar('Failed to sync payments', { variant: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const [addToInvoiceOpen, setAddToInvoiceOpen] = useState(false);
  const [invoiceIdInput, setInvoiceIdInput] = useState('');

  const handleMergeInvoices = async () => {
    if (table.selected.length === 0) return;
    try {
      setIsLoading(true);
      await axiosInstance.post('/invoices/merge_invoices/', {
        order_ids: table.selected
      });
      enqueueSnackbar('Invoices merged successfully!', { variant: 'success' });
      table.onSelectAllRows(false, []);
      getAll();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.error || 'Failed to merge invoices', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrdersToInvoice = async () => {
    if (!invoiceIdInput || table.selected.length === 0) return;
    try {
      setIsLoading(true);
      await axiosInstance.post(`/invoices/${invoiceIdInput}/add_orders/`, {
        order_ids: table.selected
      });
      enqueueSnackbar('Orders added to invoice successfully!', { variant: 'success' });
      setAddToInvoiceOpen(false);
      table.onSelectAllRows(false, []);
      getAll();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.error || 'Failed to add orders to invoice', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const canReset =
    !!filters.name ||
    !!filters.orderId ||
    !!filters.ean ||
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    !!filters.startDate ||
    !!filters.endDate;

  const handleApplyFilters = useCallback(
    (patch: Partial<IOrderTableFilters>) => {
      const newSearchParams = new URLSearchParams(location.search);

      (Object.keys(patch) as (keyof IOrderTableFilters)[]).forEach((name) => {
        const value = patch[name];
        if (value === 'all' || value === null || value === '' || value === undefined) {
          newSearchParams.delete(FILTER_PARAMS[name]);
        } else {
          newSearchParams.set(
            FILTER_PARAMS[name],
            value instanceof Date ? formatDate(value) : String(value)
          );
        }
      });

      newSearchParams.set('page', '1');
      table.onChangePage(null, 0);

      router.push(`${location.pathname}?${newSearchParams.toString()}`);
      setFilters((prevState) => ({ ...prevState, ...patch }));
    },
    [location.pathname, location.search, router, table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      name: '',
      orderId: '',
      ean: '',
      startDate: '',
      endDate: '',
      paymentStatus: 'all',
    });
    router.push(`${location.pathname}?page=1`);
  }, [location.pathname, router]);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleApplyFilters({ status: newValue });
    },
    [handleApplyFilters]
  );

  const handleTablePageChange = useCallback(
    (e: React.MouseEvent<HTMLButtonElement> | null, pageNo: number) => {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('page', String(pageNo + 1));
      router.push(`${location.pathname}?${newSearchParams.toString()}`);
      table.onChangePage(e, pageNo);
    },
    [location.pathname, location.search, router, table]
  );

  const moreStatus = MORE_STATUSES.find((option) => option.value === filters.status);
  const hasStatusTab = STATUS_TABS.some((tab) => tab.value === filters.status);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Bestellingen"
          links={[
            {
              name: t('dashboard'),
              href: paths.dashboard.root,
            },
            {
              name: t('order'),
              href: paths.dashboard.order.root,
            },
            { name: t('list') },
          ]}
          action={
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSyncPayments}
                startIcon={isSyncing ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="mingcute:refresh-2-fill" />}
                disabled={isSyncing}
              >
                Sync Snelstart Payments
              </Button>
              <Button
                component={Link}
                href={paths.dashboard.order.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                {t('new_order')}
              </Button>
            </Box>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: 2,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            <Tabs
              value={hasStatusTab ? filters.status : false}
              onChange={handleFilterStatus}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {STATUS_TABS.map((tab) => (
                <Tab key={tab.value} value={tab.value} label={tab.label} />
              ))}
            </Tabs>

            <Button
              color={moreStatus ? 'primary' : 'inherit'}
              onClick={(event) => setMoreAnchor(event.currentTarget)}
              endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
              sx={{
                ml: 1,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                fontWeight: moreStatus ? 600 : 400,
                ...(!moreStatus && { color: 'text.secondary' }),
              }}
            >
              {moreStatus ? moreStatus.label : 'Meer statussen'}
            </Button>

            <Menu anchorEl={moreAnchor} open={!!moreAnchor} onClose={() => setMoreAnchor(null)}>
              {MORE_STATUSES.map((option) => (
                <MenuItem
                  key={option.value}
                  selected={option.value === filters.status}
                  onClick={() => {
                    setMoreAnchor(null);
                    handleApplyFilters({ status: option.value });
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          <OrderTableToolbar
            filters={filters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            canReset={canReset}
            results={count}
            //
            dateError={dateError}
          />

          {table.selected.length > 0 && (
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              sx={{ px: 2, py: 1, bgcolor: 'grey.800', color: 'common.white' }}
            >
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                {table.selected.length}{' '}
                {table.selected.length === 1
                  ? 'bestelling geselecteerd'
                  : 'bestellingen geselecteerd'}
              </Typography>
              <Button variant="outlined" color="inherit" size="small" onClick={handleMergeInvoices}>
                Facturen samenvoegen
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setAddToInvoiceOpen(true)}
              >
                Aan factuur toevoegen
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() => table.onSelectAllRows(false, [])}
                sx={{ opacity: 0.72 }}
              >
                Selectie wissen
              </Button>
            </Stack>
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            {isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1,
                }}
              >
                <LoadingScreen />
              </Box>
            )}

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1040 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={orderList.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      orderList.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {orderList.map((row) => (
                    <OrderTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                    />
                  ))}

                  {!isLoading && orderList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={ORDER_TABLE_COLUMNS} align="center" sx={{ py: 8 }}>
                        <Typography variant="subtitle1">Geen bestellingen gevonden</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {canReset
                            ? 'Pas de filters aan of wis ze om alle bestellingen te zien.'
                            : 'Er zijn nog geen bestellingen.'}
                        </Typography>
                        {canReset && (
                          <Button variant="outlined" onClick={handleResetFilters} sx={{ mt: 2 }}>
                            Filters wissen
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={count}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={handleTablePageChange}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <Dialog open={addToInvoiceOpen} onClose={() => setAddToInvoiceOpen(false)}>
        <DialogTitle>Add to Existing Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Invoice ID"
              value={invoiceIdInput}
              onChange={(e) => setInvoiceIdInput(e.target.value)}
              helperText="Enter the ID of the invoice you want to add the selected orders to."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddToInvoiceOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddOrdersToInvoice} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

const formatDate = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
