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

import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';

import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  site: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable({ defaultOrderBy: "relation_code" });
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [userList, setUserList] = useState<IUserItem[]>([]);
  const [count, setCount] = useState(0);
  const [tableData, setTableData] = useState<IUserItem[]>(userList);
  const [filters, setFilters] = useState(defaultFilters);
  const { t, onChangeLang } = useTranslate();

  const TABLE_HEAD = [
    { id: 'relation_code', label: t('id') },
    { id: 'name', label: t('name_type') },
    { id: 'email', label: t('email_phone'), width: 180 },
    // { id: 'company', label: t('poc'), width: 220 },
    { id: 'type', label: t('kvk_vat'), width: 180 },
    { id: 'is_active', label: `${t('active')}?`, width: 100 },
    { id: '', width: 88 },
  ];

  const USER_TYPES = [
    { value: 'particular', label: t('particular') },
    { value: 'standard_business', label: t('standard_business') },
    { value: 'wholesaler', label: t('wholesaler') },
    { value: 'supermarket', label: t('supermarket') },
    { value: 'special', label: t('special') },
    // { value: 'admin', label: t('admin') },
  ];

  const STATUS_OPTIONS = [
    { value: 'all', label: t('all') },
    { value: 'active', label: t('active') },
    { value: 'in_active', label: t('inactive') },
  ];
  const SITE_SOURCE_OPTIONS = [
    { value: 'all', label: t('all') },
    { value: 'kooptop.com', label: t('Kooptop') },
    { value: 'europowerbv.com', label: t('EuropowerBV') },
  ];

  const dataInPage = userList.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!userList.length && canReset) || !userList.length;

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  console.log('userList', userList);

  const getAll = async () => {
    const statusFilter =
      filters.status !== 'all' ? `&is_active=${filters.status === 'active'}` : '';
    const orderByParam = table.orderBy
      ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
      : '-relation_code';
    const searchFilter = filters.name ? `&search=${filters.name}` : '';
    const typeFilter = filters.role[0] ? `&type=${filters.role[0]}` : '';
    const siteFilter = filters.site[0] && (filters.site[0] === "all" ? "" : `&site_source=${filters.site[0]}`);
    const { data } = await axiosInstance.get(
      `/users/?is_staff=false&limit=${table.rowsPerPage}&offset=${table.rowsPerPage * table.page}
        ${typeFilter}${searchFilter}${statusFilter}${orderByParam}${siteFilter}`
    );
    setCount(data.count || 0);
    setUserList(data.results || []);
  };

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
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
      const deleteRow = userList.filter((row) => row.id !== id);
      const { data } = await axiosInstance.delete(`/users/${id}/`);
      enqueueSnackbar(t('delete_success'));

      getAll();
      // setTableData(deleteRow);

      // table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, userList]
  );

  const handleDeleteRows = useCallback(async () => {
    const selectedIds = table.selected;
    const promises = selectedIds.map(async (id) => {
      try {
        await axiosInstance.delete(`/users/${id}/`);
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
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: t('dashboard'), href: paths.dashboard.user.list },
            { name: t('user'), href: paths.dashboard.user.list },
            { name: t('list') },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('new_user')}
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
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
              // icon={
              //   <Label
              //     variant={
              //       ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
              //     }
              //     color={
              //       (tab.value === 'active' && 'success') ||
              //       (tab.value === 'pending' && 'warning') ||
              //       (tab.value === 'banned' && 'error') ||
              //       'default'
              //     }
              //   >
              //     {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
              //       ? tableData.filter((user) => user.status === tab.value).length
              //       : tableData.length}
              //   </Label>
              // }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={USER_TYPES}
            siteSourceOptions={SITE_SOURCE_OPTIONS}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={userList.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={userList.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  userList.map((row) => row.id)
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
                  rowCount={userList.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      userList.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {!userList?.length ? (
                    <tr style={{ textAlign: 'center' }}>
                      <Iconify icon="svg-spinners:8-dots-rotate" />
                    </tr>
                  ) : (
                    userList.map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))
                  )}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, userList.length)}
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
