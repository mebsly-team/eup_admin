import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import {
  Box,
  Dialog,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
} from '@mui/material';

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

import { IProductItem, IProductTableFilters, IProductTableFilterValue } from 'src/types/product';

import ProductTableRow from '../product-table-row';
import ProductTableToolbar from '../product-table-toolbar';
import ProductTableFiltersResult from '../product-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters: IProductTableFilters = {
  is_product_active: 'all',
  name: undefined,
  title: '',
  description: '',
  ean: '',
};

// ----------------------------------------------------------------------

export default function ProductListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [productList, setProductList] = useState<IProductItem[]>([]);
  const [count, setCount] = useState(0);
  const [tableData, setTableData] = useState<IProductItem[]>(productList);
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
    { id: 'image', label: t('image'), width: 180 },
    { id: 'title', label: t('title') },
    { id: 'discounted_price', label: t('price') },
    { id: 'ean', label: t('ean') },
    { id: 'overall_stock', label: t('free_all_stock') },
    { id: 'is_product_active', label: `${t('active')}?` },
  ];
  const theme = useTheme();

  const dataInPage = productList.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!productList?.length && canReset) || !productList?.length;

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  console.log('productList', productList);

  const getAll = async () => {
    setIsLoading(true);
    const statusFilter =
      filters.is_product_active !== 'all'
        ? `&is_product_active=${filters.is_product_active === 'active'}`
        : '';
    const orderByParam = table.orderBy
      ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
      : '';
    const searchFilter = filters.name ? `&search=${filters.name}` : '';
    const { data } = await axiosInstance.get(
      `/products/?limit=${table.rowsPerPage}&offset=${
        table.page * table.rowsPerPage
      }${searchFilter}${statusFilter}${orderByParam}`
    );
    setCount(data.count);
    setProductList(data.results);
    setIsLoading(false);
  };

  const handleFilters = useCallback(
    (name: string, value: IProductTableFilterValue) => {
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
      const deleteRow = productList.filter((row) => row.id !== id);
      const { data } = await axiosInstance.delete(`/products/${id}/`);
      enqueueSnackbar(t('delete_success'));
      getAll();
      // setTableData(deleteRow);
      // table.onUpdatePageDeleteRow(dataInPage?.length);
    },
    [dataInPage?.length, enqueueSnackbar, table, productList]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    enqueueSnackbar(t('delete_success'));
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage?.length,
      totalRowsFiltered: productList?.length,
    });
  }, [productList?.length, dataInPage?.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const updateStock = useCallback(() => {
    // TODO:
    setStockUpdateDialogOpen(false);
  }, []);

  const createVariantsCall = async (value1, value2, unitValue) => {
    const title = `${selectedSingleRow?.title}${value1 ? `-${value1}` : ''}${
      value2 ? `-${value2}` : ''
    }-${unitValue}`;
    try {
      const response = await axiosInstance.post('/products/', {
        title,
        is_variant: true,
        parent_product: selectedSingleRow?.id,
      });
      console.log('response', response);
    } catch (error) {
      console.error('Error creating variant:', title);
      console.error('Error:', error);
    }
  };

  const createVariants = () => {
    const values1 = selectedValues1.length > 0 ? selectedValues1 : [null];
    const values2 = selectedValues2.length > 0 ? selectedValues2 : [null];

    values1.forEach((value1) => {
      values2.forEach((value2) => {
        selectedUnitValues.forEach((unitValue) => {
          createVariantsCall(value1, value2, unitValue);
        });
      });
    });

    setSCreateVariantDialogOpen(false);
  };

  const handleUpdateStock = useCallback((row) => {
    setSelectedSingleRow(row);
    setStockUpdateDialogOpen(true);
  }, []);

  const handleCreateVariants = useCallback((row) => {
    setSelectedSingleRow(row);
    setSCreateVariantDialogOpen(true);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('list')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('products'), href: paths.dashboard.product.root },
            { name: t('list') },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('new_product')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <ProductTableToolbar filters={filters} onFilters={handleFilters} />

          {canReset && (
            <ProductTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={productList?.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected?.length}
              rowCount={productList?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  productList.map((row) => row.id)
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
                  rowCount={productList?.length}
                  numSelected={table.selected?.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      productList.map((row) => row.id)
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
                      {productList.map((row) => (
                        <ProductTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onEditStock={() => handleUpdateStock(row)}
                          onCreateVariants={() => handleCreateVariants(row)}
                        />
                      ))}

                      {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, productList?.length)}
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

      {isStockUpdateDialogOpen ? (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={isStockUpdateDialogOpen}
          onClose={() => setStockUpdateDialogOpen(false)}
          transitionDuration={{
            enter: theme.transitions.duration.shortest,
            exit: 0,
          }}
          PaperProps={{
            sx: {
              mt: 15,
              overflow: 'unset',
            },
          }}
        >
          <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
            <Typography sx={{ mb: 2 }}>{selectedSingleRow?.title}</Typography>

            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              {`${t('overall_stock')}: ${selectedSingleRow?.overall_stock}`}
            </Typography>
            <TextField name="amount" label={t('amount')} sx={{ width: 100 }} type="number" />
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel id="demo-select-small-label">{t('select')}</InputLabel>
              <Select labelId="demo-select-small-label" id="demo-select-small">
                <MenuItem value="stock_update_choice_0">{t('stock_update_choice_0')}</MenuItem>
                <MenuItem value="stock_update_choice_1">{t('stock_update_choice_1')}</MenuItem>
                <MenuItem value="stock_update_choice_2">{t('stock_update_choice_2')}</MenuItem>
                <MenuItem value="stock_update_choice_3">{t('stock_update_choice_3')}</MenuItem>
                <MenuItem value="stock_update_choice_4">{t('stock_update_choice_4')}</MenuItem>
                <MenuItem value="stock_update_choice_5">{t('stock_update_choice_5')}</MenuItem>
                <MenuItem value="stock_update_choice_6">{t('stock_update_choice_6')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <DialogActions>
            <Button onClick={() => setStockUpdateDialogOpen(false)} color="primary">
              {t('cancel')}
            </Button>
            <Button onClick={updateStock} color="primary">
              {t('save')}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}
