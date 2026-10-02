import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
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

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTable, TablePaginationCustom } from 'src/components/table';

import CategoryTableToolbar from '../category-table-toolbar';
import CategoryTableRow, { CATEGORY_TABLE_COLUMNS } from '../category-table-row';

// ----------------------------------------------------------------------

export default function CategoryListView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslate();

  const pageParam = searchParams.get('page');

  const table = useTable({
    defaultOrderBy: 'id',
    defaultOrder: 'desc',
    defaultCurrentPage: pageParam ? Math.max(parseInt(pageParam, 10) - 1, 0) : 0,
  });

  const [categoryList, setCategoryList] = useState<any[]>([]);
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
      const { data } = await axiosInstance.get(
        `/categories/?limit=${table.rowsPerPage}&offset=${
          table.rowsPerPage * table.page
        }${searchFilter}${ordering}`
      );
      // A slower response of an older search must not overwrite the newest one
      if (requestId !== latestRequestRef.current) return;
      setCount(data.count || 0);
      setCategoryList(data.results || []);
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
      setName(value);
    },
    [table]
  );

  const handleDeleteRow = async (id: string) => {
    try {
      await axiosInstance.delete(`/categories/${id}/`);
      enqueueSnackbar(t('delete_success'));
      getAll();
    } catch (error) {
      console.error(error);
      // The API refuses categories that still have subcategories, and non-superadmins.
      enqueueSnackbar(error?.detail || error?.error || t('error'), { variant: 'error' });
    }
  };

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.category.edit(id));
    },
    [router]
  );

  const handleAddSubCategoryRow = useCallback(
    (parent: string) => {
      router.push(`${paths.dashboard.category.new}?parent=${parent}`);
    },
    [router]
  );

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
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Categorieën"
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('category'), href: paths.dashboard.category.root },
          { name: t('list') },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.category.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            {t('new_category')}
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <CategoryTableToolbar
          name={name}
          onSearch={handleSearch}
          onReset={() => handleSearch('')}
          canReset={!!name}
          results={count}
        />

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
                  <TableCell
                    sx={{ px: 1, pl: 2 }}
                    sortDirection={table.orderBy === 'name' ? table.order : false}
                  >
                    {renderSortLabel('name', 'Categorie')}
                  </TableCell>
                  <TableCell sx={{ px: 1, width: { md: 200 } }}>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                      {t('subcategorieën')}
                    </Box>
                    <Box component="span" sx={{ display: { sm: 'none' } }}>
                      Sub.
                    </Box>
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
                {categoryList.map((row) => (
                  <CategoryTableRow
                    key={row.id}
                    row={row}
                    onDeleteRow={handleDeleteRow}
                    onEditRow={handleEditRow}
                    onAddSubCategoryRow={handleAddSubCategoryRow}
                  />
                ))}

                {!isLoading && categoryList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={CATEGORY_TABLE_COLUMNS} align="center" sx={{ py: 8 }}>
                      <Typography variant="subtitle1">Geen categorieën gevonden</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {name
                          ? 'Er wordt alleen op hoofdcategorieën gezocht. Pas de zoekterm aan of wis hem.'
                          : 'Er zijn nog geen categorieën.'}
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
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
