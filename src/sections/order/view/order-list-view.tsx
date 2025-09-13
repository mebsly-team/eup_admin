import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';
import { isAfter, isBetween } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { LoadingScreen } from 'src/components/loading-screen';

import { IOrderItem, IOrderTableFilters, IOrderTableFilterValue } from 'src/types/order';

import OrderTableRow from '../order-table-row';
import OrderTableToolbar from '../order-table-toolbar';
import OrderTableFiltersResult from '../order-table-filters-result';

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
const STATUS_OPTIONS = [{ value: 'all', label: 'Alle' }, ...ORDER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'id', label: 'Bestel', width: 40, padding: 0 },
  { id: 'name', label: 'Klant', width: 40, padding: 1 },
  { id: 'ordered_date', label: 'Datum', width: 80, padding: 1, hideOnMd: true },
  { id: 'totalQuantity', label: 'Items', width: 40, align: 'center', padding: 1, hideOnSm: true },
  { id: 'total', label: 'Prijs', width: 50, padding: 1, },
  { id: 'status', label: 'Status', width: 110, padding: 1 },
  { id: '', width: 88, padding: 1 },
];

// ----------------------------------------------------------------------

export default function OrderListView() {
  console.log('OrderListView - component rendering');

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultOrderBy: 'ordered_date' });
  const { t, onChangeLang } = useTranslate();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();
  const location = useLocation();
  const [orderList, setOrderList] = useState<IOrderItem[]>([]);

  const [tableData, setTableData] = useState<IOrderItem[]>(orderList);
  const queryParams = new URLSearchParams(location.search);

  console.log('OrderListView - initial state:', {
    orderList: orderList.length,
    tableData: tableData.length,
    location: location.pathname,
  });

  const defaultFilters: IOrderTableFilters = {
    status: queryParams.get('status') || 'all',
    name: queryParams.get('name') || '',
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
  };

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataInPage = orderList.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [count, setCount] = useState(0);

  useEffect(() => {
    const pageParam = Number(queryParams.get('page'));
    if (!Number.isNaN(pageParam) && pageParam > 0 && table.page !== pageParam - 1) {
      table.setPage(pageParam - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const desired = String(table.page + 1);
    const current = params.get('page') || '1';
    if (current !== desired) {
      params.set('page', desired);
      router.replace(`${location.pathname}?${params.toString()}`);
    }
  }, [table.page, location.pathname, location.search, router]);

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  const getAll = async () => {
    try {
      console.log('OrderListView - fetching orders...');
      setIsLoading(true);
      const statusFilter = filters.status !== 'all' ? `&status=${filters.status}` : '';
      const orderByParam = table.orderBy
        ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
        : '';
      const searchFilter = filters.name ? `&search=${filters.name}` : '';
      const startDateFilter = filters.startDate ? `&start_date=${formatDate(filters.startDate)}` : '';
      const endDateFilter = filters.endDate ? `&end_date=${formatDate(filters.endDate)}` : '';

      const { data } = await axiosInstance.get(
        `/orders/?all=true&limit=${table.rowsPerPage}&offset=${table.page * table.rowsPerPage
        }${searchFilter}${statusFilter}${orderByParam}${startDateFilter}${endDateFilter}`
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

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const handleFilters = useCallback(
    (name: string, value: IOrderTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: orderList.length,
    });
  }, [orderList.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );
  const handleTablePageChange = useCallback((e: any, pageNo: number) => {
    table.onChangePage(e, pageNo);
  }, [table]);
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('list')}
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
            <Button
              component={Link}
              href={paths.dashboard.order.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('new_order')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 0,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              'div div': {
                justifyContent: 'space-between',
              },
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                // iconPosition="end"
                value={tab.value}
                label={tab.label}
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.725rem',
                  marginRight: '1rem!important',
                }}
              // icon={
              //   <Label
              //     variant={
              //       ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
              //     }
              //     color={
              //       (tab.value === 'delivered' && 'success') ||
              //       (tab.value === 'pending_order' && 'warning') ||
              //       (tab.value === 'pending_offer' && 'warning') ||
              //       (tab.value === 'cancelled' && 'error') ||
              //       'default'
              //     }
              //   >
              //     {['completed', 'pending', 'cancelled', 'refunded'].includes(tab.value)
              //       ? tableData.filter((user) => user.status === tab.value).length
              //       : tableData.length}
              //   </Label>
              // }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={count}
              sx={{ p: 2.5, pt: 0 }}
            />
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
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={orderList.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  orderList.map((row) => row.id)
                )
              }
              action={
                <Tooltip title={t('delete')}>
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ width: "100%" }}>
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
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                    />
                  ))}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, orderList.length)}
                  /> */}

                  {/* <TableNoData notFound={notFound} /> */}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            {t('delete')}
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
  dateError,
}: {
  inputData: IOrderItem[];
  comparator: (a: any, b: any) => number;
  filters: IOrderTableFilters;
  dateError: boolean;
}) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (order) =>
        order.orderNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        order.customer.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        order.customer.email.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((order) => isBetween(order.createdAt, startDate, endDate));
    }
  }

  return inputData;
}

const formatDate = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
