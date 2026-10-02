import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTable, TablePaginationCustom } from 'src/components/table';

import { IBrandItem } from 'src/types/brand';

import BrandTableToolbar from '../brand-table-toolbar';
import BrandTableRow, { BRAND_TABLE_COLUMNS } from '../brand-table-row';

// ----------------------------------------------------------------------

export default function BrandListView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useBoolean();
  const { t } = useTranslate();

  const pageParam = searchParams.get('page');

  const table = useTable({
    defaultOrderBy: 'id',
    defaultOrder: 'desc',
    defaultCurrentPage: pageParam ? Math.max(parseInt(pageParam, 10) - 1, 0) : 0,
  });

  const [brandList, setBrandList] = useState<IBrandItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState(searchParams.get('name') || '');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (table.page > 0) params.set('page', String(table.page + 1));
    else params.delete('page');

    if (name) params.set('name', name);
    else params.delete('name');

    const newSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, '');

    if (newSearch !== currentSearch) {
      router.push(`${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`);
    }
  }, [table.page, name, router]);

  const latestRequestRef = useRef(0);

  const getAll = async () => {
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;
    setIsLoading(true);

    const searchFilter = name ? `&search=${encodeURIComponent(name)}` : '';
    const ordering = `&ordering=${table.order === 'desc' ? '-' : ''}${table.orderBy}`;

    try {
      // The API caches this list per URL for a day; the extra param keeps it fresh after edits.
      const { data } = await axiosInstance.get(
        `/brands/?limit=${table.rowsPerPage}&offset=${
          table.rowsPerPage * table.page
        }${searchFilter}${ordering}&data=${Date.now()}`
      );
      // A slower response of an older search must not overwrite the newest one
      if (requestId !== latestRequestRef.current) return;
      setCount(data.count || 0);
      setBrandList(data.results || []);
    } catch (error) {
      console.error(error);
      if (requestId !== latestRequestRef.current) return;
      enqueueSnackbar(t('error'), { variant: 'error' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getAll();
  }, [name, table.page, table.rowsPerPage, table.orderBy, table.order]);

  const handleSearch = useCallback(
    (value: string) => {
      table.onResetPage();
      table.setSelected([]);
      setName(value);
    },
    [table]
  );

  const handleDeleteRow = async (id: number) => {
    try {
      await axiosInstance.delete(`/brands/${id}/`);
      enqueueSnackbar(t('delete_success'));
      table.setSelected(table.selected.filter((selectedId) => selectedId !== (id as any)));
      getAll();
    } catch (error) {
      console.error(error);
      // The API only lets superadmins delete.
      enqueueSnackbar(error?.detail || error?.error || t('error'), { variant: 'error' });
    }
  };

  const handleDeleteRows = async () => {
    const results = await Promise.allSettled(
      table.selected.map((id) => axiosInstance.delete(`/brands/${id}/`))
    );
    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length) {
      const { reason } = failed[0] as PromiseRejectedResult;
      enqueueSnackbar(
        `${failed.length} van ${results.length} niet verwijderd: ${
          reason?.detail || reason?.error || t('error')
        }`,
        { variant: 'error' }
      );
    } else {
      enqueueSnackbar(t('delete_success'));
    }
    table.setSelected([]);
    getAll();
  };

  const handleEditRow = useCallback(
    (id: number) => {
      router.push(paths.dashboard.brand.edit(String(id)));
    },
    [router]
  );

  const pageIds = brandList.map((row) => row.id) as any[];
  const numSelected = table.selected.length;

  const renderSortLabel = (id: string, label: string) => (
    <TableSortLabel
      active={table.orderBy === id}
      direction={table.orderBy === id ? table.order : 'asc'}
      onClick={() => table.onSort(id)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Merken"
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('brand'), href: paths.dashboard.brand.root },
            { name: t('list') },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.brand.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('new_brand')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <BrandTableToolbar
            name={name}
            onSearch={handleSearch}
            onReset={() => handleSearch('')}
            canReset={!!name}
            results={count}
          />

          {numSelected > 0 && (
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              sx={{ px: 2, py: 1, bgcolor: 'grey.800', color: 'common.white' }}
            >
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                {numSelected} {numSelected === 1 ? 'merk geselecteerd' : 'merken geselecteerd'}
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
                onClick={() => table.setSelected([])}
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
                  minHeight: 120,
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
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={numSelected > 0 && numSelected < brandList.length}
                        checked={brandList.length > 0 && numSelected === brandList.length}
                        onChange={(event) => table.onSelectAllRows(event.target.checked, pageIds)}
                        inputProps={{ 'aria-label': 'Alle merken selecteren' }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ px: 1 }}
                      sortDirection={table.orderBy === 'name' ? table.order : false}
                    >
                      {renderSortLabel('name', t('brand'))}
                    </TableCell>
                    <TableCell
                      sx={{ px: 1, width: 90, display: { xs: 'none', sm: 'table-cell' } }}
                      sortDirection={table.orderBy === 'id' ? table.order : false}
                    >
                      {renderSortLabel('id', 'ID')}
                    </TableCell>
                    <TableCell sx={{ px: 1, width: 56 }} />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {brandList.map((row) => (
                    <BrandTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id as any)}
                      onSelectRow={() => table.onSelectRow(row.id as any)}
                      onDeleteRow={handleDeleteRow}
                      onEditRow={handleEditRow}
                    />
                  ))}

                  {!isLoading && brandList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={BRAND_TABLE_COLUMNS} align="center" sx={{ py: 8 }}>
                        <Typography variant="subtitle1">Geen merken gevonden</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {name
                            ? 'Pas de zoekterm aan of wis hem om alle merken te zien.'
                            : 'Er zijn nog geen merken.'}
                        </Typography>
                        {!!name && (
                          <Button variant="outlined" onClick={() => handleSearch('')} sx={{ mt: 2 }}>
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
            onPageChange={(event, page) => {
              table.setSelected([]);
              table.onChangePage(event, page);
            }}
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
        content={
          <>
            {t('sure_delete_selected_items')}
            <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
              De producten van {numSelected === 1 ? 'dit merk' : `deze ${numSelected} merken`} worden
              ook verwijderd.
            </Typography>
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
