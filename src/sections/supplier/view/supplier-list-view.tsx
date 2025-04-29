import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

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

import SupplierTableRow from '../supplier-table-row';
import SupplierTableToolbar from '../supplier-table-toolbar';
import SupplierTableFiltersResult from '../supplier-table-filters-result';

// ----------------------------------------------------------------------

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const defaultFilters: any = {
  is_active: 'all',
  name: undefined,
  title: '',
  description: '',
  ean: '',
};

// ----------------------------------------------------------------------

export default function SupplierListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [tableData, setTableData] = useState<any[]>(supplierList);
  const [isStockUpdateDialogOpen, setStockUpdateDialogOpen] = useState(false);
  const [isCreateVariantDialogOpen, setSCreateVariantDialogOpen] = useState(false);
  const [selectedSingleRow, setSelectedSingleRow] = useState();
  const [filters, setFilters] = useState(defaultFilters);
  console.log('filters', filters);
  const { t, onChangeLang } = useTranslate();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner

  const [selectedValues1, setSelectedValues1] = useState([]);
  const [selectedValues2, setSelectedValues2] = useState([]);
  const [selectedUnitValues, setSelectedUnitValues] = useState([]);

  const handleSelectChange1 = (event) => {
    setSelectedValues1(event.target.value);
  };

  const handleSelectChange2 = (event) => {
    setSelectedValues2(event.target.value);
  };

  const handleUnitSelectChange = (event) => {
    setSelectedUnitValues(event.target.value);
  };

  const TABLE_HEAD = [
    { id: 'name', label: t('supplier_name'), width: 180 },
    { id: 'kvk_number', label: t('kvk_number'), width: 180 },
    { id: 'email', label: t('email'), width: 180 },
    { id: 'is_active', label: `${t('active')}?` },
  ];
  const theme = useTheme();

  const dataInPage = supplierList.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!supplierList?.length && canReset) || !supplierList?.length;

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  console.log('supplierList', supplierList);

  const getAll = async () => {
    setIsLoading(true);
    const statusFilter =
      filters.is_active !== 'all' ? `&is_active=${filters.is_active === 'active'}` : '';
    const orderByParam = table.orderBy
      ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
      : '';
    const searchFilter = filters.name ? `&search=${filters.name}` : '';
    const { data } = await axiosInstance.get(
      `/suppliers/?limit=${table.rowsPerPage}&offset=${table.page * table.rowsPerPage
      }${searchFilter}${statusFilter}${orderByParam}&data=${random(1, 1000000000)}`
    );
    setCount(data.count || 0);
    setSupplierList(data.results || []);
    setIsLoading(false);
  };

  const handleFilters = useCallback(
    (name: string, value: any) => {
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
    async (id: string) => {
      const deleteRow = supplierList.filter((row) => row.id !== id);
      const { data } = await axiosInstance.delete(`/suppliers/${id}/`);
      enqueueSnackbar(t('delete_success'));
      getAll();
      // setTableData(deleteRow);
      // table.onUpdatePageDeleteRow(dataInPage?.length);
    },
    [dataInPage?.length, enqueueSnackbar, table, supplierList]
  );

  const handleDeleteRows = useCallback(async () => {
    const selectedIds = table.selected;
    const promises = selectedIds.map(async (id) => {
      try {
        await axiosInstance.delete(`/suppliers/${id}/`);
      } catch (error) {
        console.error(`Error deleting ID ${id}:`, error);
      }
    });

    try {
      await Promise.all(promises); // Wait for all delete requests to complete
      const remainingRows = tableData.filter((row) => !selectedIds.includes(row.id));
      setTableData(remainingRows); // Update tableData state with remaining rows
      enqueueSnackbar(t('delete_success'));
      getAll(); // Refresh data if needed
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  }, [tableData, table.selected, enqueueSnackbar, getAll, t]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.supplier.edit(id));
    },
    [router]
  );

  const handlePurchaseRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.purchase.list(id));
    },
    [router]
  );
  
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('list')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('suppliers'), href: paths.dashboard.supplier.root },
            { name: t('list') },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.supplier.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('new_supplier')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <SupplierTableToolbar filters={filters} onFilters={handleFilters} />

          {canReset && (
            <SupplierTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={supplierList?.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected?.length}
              rowCount={supplierList?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  supplierList.map((row) => row.id)
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={supplierList?.length}
                  numSelected={table.selected?.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      supplierList.map((row) => row.id)
                    )
                  }
                />
                <TableBody>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Iconify icon="svg-spinners:8-dots-rotate" sx={{ mr: -3 }} />
                    </Box>
                  ) : (
                    <>
                      {supplierList.map((row) => (
                        <SupplierTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onPurchaseRow={() => handlePurchaseRow(row.id)}
                        />
                      ))}

                      {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, supplierList?.length)}
                  />

                  <TableNoData notFound={notFound} /> */}
                    </>
                  )}{' '}
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
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={t('sure_delete_selected_items')}
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
