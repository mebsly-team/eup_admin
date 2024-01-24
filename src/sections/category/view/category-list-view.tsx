import isEqual from 'lodash/isEqual';
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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ICategoryItem, ICategoryTableFilters, ICategoryTableFilterValue } from 'src/types/category';

import CategoryTableRow from '../category-table-row';
import CategoryTableToolbar from '../category-table-toolbar';
import CategoryTableFiltersResult from '../category-table-filters-result';
import { useLocales, useTranslate } from 'src/locales';

// ----------------------------------------------------------------------


const TABLE_HEAD = [
  { id: 'image', label: 'Image', width: 180 },
  { id: 'name', label: 'Category Name' },
  { id: 'parent_category', label: 'Parent' },
  { id: 'sub_categories', label: 'Subcategories' },
  // { id: 'description', label: 'Description', width: 220 },
];

const defaultFilters: ICategoryTableFilters = {
  name: '',
};

// ----------------------------------------------------------------------

export default function CategoryListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [categoryList, setCategoryList] = useState<ICategoryItem[]>([]);
  const [count, setCount] = useState(0);
  const [tableData, setTableData] = useState<ICategoryItem[]>(categoryList);
  const [filters, setFilters] = useState(defaultFilters);
  const { t, onChangeLang } = useTranslate();

  const dataFiltered = applyFilter({
    inputData: categoryList,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!categoryList?.length && canReset) || !categoryList?.length;

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage]);

  console.log('categoryList', categoryList);


  const getAll = async () => {
    const searchFilter = filters.name ? `&search=${filters.name}` : ""
    const { data } = await axiosInstance.get(
      `/categories/?limit=${table.rowsPerPage}&page=${table.page + 1}&offset=0${searchFilter}`
    );
    setCount(data.count);
    setCategoryList(data.results);
  };

  const handleFilters = useCallback(
    (name: string, value: ICategoryTableFilterValue) => {
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
      const deleteRow = categoryList.filter((row) => row.id !== id);
      const { data } = await axiosInstance.delete(`/categories/${id}/`);
      enqueueSnackbar(t("delete_success"));

      getAll();
      // setTableData(deleteRow);

      // table.onUpdatePageDeleteRow(dataInPage?.length);
    },
    [dataInPage?.length, enqueueSnackbar, table, categoryList]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar(t("delete_success"));


    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage?.length,
      totalRowsFiltered: dataFiltered?.length,
    });
  }, [dataFiltered?.length, dataInPage?.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.category.edit(id));
    },
    [router]
  );


  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Category', href: paths.dashboard.category.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.category.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Category
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <CategoryTableToolbar
            filters={filters}
            onFilters={handleFilters}
          />

          {canReset && (
            <CategoryTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={categoryList?.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected?.length}
              rowCount={categoryList?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  categoryList.map((row) => row.id)
                )
              }
              action={
                <Tooltip title={t("delete")}>
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
                  rowCount={categoryList?.length}
                  numSelected={table.selected?.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      categoryList.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {categoryList.map((row) => (
                    <CategoryTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                    />
                  ))}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, categoryList?.length)}
                  />

                  <TableNoData notFound={notFound} /> */}
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
        title={t("delete")}
        content={t("sure_delete_selected_items")}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            {t("delete")}
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
}: {
  inputData: ICategoryItem[];
  comparator: (a: any, b: any) => number;
  filters: ICategoryTableFilters;
}) {
  const { first_name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (category) => category.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }


  return inputData;
}
