import isEqual from 'lodash/isEqual';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';

import UserTableToolbar from '../user-table-toolbar';
import UserTableRow, { USER_TABLE_COLUMNS } from '../user-table-row';

// ----------------------------------------------------------------------

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  site: [],
  colors: [],
  status: 'all',
};

const STATUS_TABS = [
  { value: 'all', label: 'Alle' },
  { value: 'active', label: 'Actief' },
  { value: 'in_active', label: 'Inactief' },
];

// ----------------------------------------------------------------------

export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get('page');
  const rowsPerPageParam = searchParams.get('rowsPerPage');

  const table = useTable({
    defaultOrderBy: 'relation_code',
    defaultOrder: 'desc',
    defaultCurrentPage: pageParam ? parseInt(pageParam, 10) - 1 : 0,
    defaultRowsPerPage: rowsPerPageParam ? parseInt(rowsPerPageParam, 10) : 25,
  });

  const confirm = useBoolean();
  const [userList, setUserList] = useState<IUserItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState<Record<string, number> | null>(null);
  const [countsVersion, setCountsVersion] = useState(0);

  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    name: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    role: searchParams.get('role')?.split(',').filter(Boolean) || [],
    site: searchParams.get('site')?.split(',').filter(Boolean) || [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) || [],
  }));

  const { t } = useTranslate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (table.page >= 0) params.set('page', String(table.page + 1));
    else params.delete('page');

    if (table.rowsPerPage !== 25) params.set('rowsPerPage', String(table.rowsPerPage));
    else params.delete('rowsPerPage');

    if (filters.name) params.set('search', filters.name);
    else params.delete('search');

    if (filters.status !== 'all') params.set('status', filters.status);
    else params.delete('status');

    if (filters.role.length) params.set('role', filters.role.join(','));
    else params.delete('role');

    if (filters.site.length) params.set('site', filters.site.join(','));
    else params.delete('site');

    if (filters.colors.length) params.set('colors', filters.colors.join(','));
    else params.delete('colors');

    const newSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, '');

    if (newSearch !== currentSearch) {
      router.push(`${window.location.pathname}?${newSearch}`);
    }
  }, [table.page, table.rowsPerPage, filters, router]);

  const TABLE_HEAD = [
    { id: 'relation_code', label: 'Rel.code', width: 100, padding: 1, hideOnMd: true },
    { id: 'name', label: 'Klant', padding: 1 },
    { id: 'email', label: 'Contact', padding: 1, hideOnMd: true },
    { id: 'type', label: 'KvK / BTW', width: 160, padding: 1, hideOnLg: true },
    { id: 'customer_color', label: 'Kleur', width: 150, padding: 1, hideOnMd: true },
    { id: 'classification', label: 'Classificatie', width: 130, padding: 1, hideOnLg: true },
    { id: 'is_active', label: 'Actief', width: 80, padding: 1 },
    { id: '', width: 56, padding: 1 },
  ];

  const USER_TYPES = [
    { value: 'particular', label: t('particular') },
    { value: 'standard_business', label: t('standard_business') },
    { value: 'wholesaler', label: t('wholesaler') },
    { value: 'supermarket', label: t('supermarket') },
    { value: 'special', label: t('special') },
  ];

  const canReset = !isEqual(defaultFilters, filters);

  // Every list filter except the status itself, so each tab gets its count.
  const filterQuery = `${filters.role[0] ? `&type=${filters.role[0]}` : ''}${
    filters.name ? `&search=${encodeURIComponent(filters.name)}` : ''
  }${filters.site[0] && filters.site[0] !== 'all' ? `&site_source=${filters.site[0]}` : ''}${
    filters.colors.length
      ? `&customer_color=${filters.colors.map((c) => encodeURIComponent(c)).join(',')}`
      : ''
  }`;

  const latestRequestRef = useRef(0);

  const getAll = async () => {
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;
    setIsLoading(true);

    const statusFilter =
      filters.status !== 'all' ? `&is_active=${filters.status === 'active'}` : '';
    const orderByParam = table.orderBy
      ? `&ordering=${table.order === 'desc' ? '-' : ''}${table.orderBy}`
      : '&ordering=-relation_code';

    try {
      const { data } = await axiosInstance.get(
        `/users/?is_staff=false&limit=${table.rowsPerPage}&offset=${
          table.rowsPerPage * table.page
        }${filterQuery}${statusFilter}${orderByParam}`
      );
      // A slower response of an older search must not overwrite the newest one
      if (requestId !== latestRequestRef.current) return;
      setCount(data.count || 0);
      setUserList(data.results || []);
    } catch (error) {
      console.error(error);
      if (requestId !== latestRequestRef.current) return;
      enqueueSnackbar(t('error'), { variant: 'error' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  useEffect(() => {
    let active = true;

    axiosInstance
      .get(`/users/status-counts/?is_staff=false${filterQuery}`)
      .then(({ data }) => {
        if (active) setTabCounts(data.counts);
      })
      .catch(() => {
        // The tabs work without counts.
        if (active) setTabCounts(null);
      });

    return () => {
      active = false;
    };
  }, [filterQuery, countsVersion]);

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      // The selected rows are no longer on screen after a filter change.
      table.onSelectAllRows(false, []);
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    setFilters(defaultFilters);
  }, [table]);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      await axiosInstance.delete(`/users/${id}/`);
      enqueueSnackbar(t('delete_success'));
      getAll();
      setCountsVersion((version) => version + 1);
    },
    [enqueueSnackbar, getAll, t]
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

    await Promise.all(promises);
    table.onSelectAllRows(false, []);
    enqueueSnackbar(t('delete_success'));
    getAll();
    setCountsVersion((version) => version + 1);
  }, [table, enqueueSnackbar, getAll, t]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Klanten"
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
            value={STATUS_TABS.some((tab) => tab.value === filters.status) ? filters.status : false}
            onChange={(event, value) => handleFilters('status', value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  tabCounts ? (
                    <Label
                      variant={tab.value === filters.status ? 'filled' : 'soft'}
                      color={tab.value === filters.status ? 'primary' : 'default'}
                    >
                      {tabCounts[tab.value] || 0}
                    </Label>
                  ) : undefined
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            canReset={canReset}
            results={count}
            //
            roleOptions={USER_TYPES}
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
                {table.selected.length === 1 ? 'klant geselecteerd' : 'klanten geselecteerd'}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={confirm.onTrue}
              >
                {t('delete')}
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
              <Table size={table.dense ? 'small' : 'medium'}>
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
                  {userList.map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onActiveChange={() => setCountsVersion((version) => version + 1)}
                    />
                  ))}

                  {!isLoading && userList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={USER_TABLE_COLUMNS} align="center" sx={{ py: 8 }}>
                        <Typography variant="subtitle1">Geen klanten gevonden</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {canReset
                            ? 'Pas de filters aan of wis ze om alle klanten te zien.'
                            : 'Er zijn nog geen klanten.'}
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
