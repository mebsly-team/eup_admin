import 'yet-another-react-lightbox/styles.css';
import { useLocation } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import { IProductItem, IProductTableFilters, IProductTableFilterValue } from 'src/types/product';

import ProductTableToolbar from '../product-table-toolbar';
import ProductTableRow, { PRODUCT_TABLE_COLUMNS } from '../product-table-row';

// ----------------------------------------------------------------------

const VISIBILITY_TABS = [
  { value: 'visible', label: 'Actief', hint: '' },
  { value: 'is_visible_particular', label: 'Particulier', hint: 'kooptop.com' },
  { value: 'is_visible_B2B', label: 'B2B', hint: 'europowerbv.com' },
  { value: 'hidden', label: 'Verborgen', hint: '' },
];

const downloadBlob = (data: BlobPart, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// ----------------------------------------------------------------------

export default function ProductListView() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const table = useTable({ defaultCurrentPage: Number(queryParams.get('page') || 1) - 1 });

  const confirm = useBoolean();
  const [productList, setProductList] = useState<IProductItem[]>([]);
  const [count, setCount] = useState(0);
  const [tabCounts, setTabCounts] = useState<Record<string, number> | null>(null);
  const [countsVersion, setCountsVersion] = useState(0);

  const defaultFilters: IProductTableFilters = {
    visibility: queryParams.get('visibility') || 'visible',
    name: queryParams.get('name') || '',
    category:
      (queryParams.get('category') &&
        queryParams.get('category') !== 'undefined' &&
        queryParams.get('category')) ||
      '',
    // Comma-separated supplier ids.
    supplier: queryParams.get('supplier') || '',
  };
  const [filters, setFilters] = useState(defaultFilters);
  const { t } = useTranslate();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [openLightBox, setOpenLightBox] = useState(false);
  const [lightBoxSlides, setLightBoxSlides] = useState<{ src: string }[]>([]);
  const [showBundles, setShowBundles] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(filters.name);

  // Export dropdown state
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

  const handleLightBoxSlides = useCallback((images: string[]) => {
    if (images.length) {
      setOpenLightBox(true);
      const slides = images.map((img) => ({
        src: `${IMAGE_FOLDER_PATH}${img}`,
      }));
      setLightBoxSlides(slides);
    }
  }, []);
  const TABLE_HEAD = [
    { id: 'title', label: 'Product', padding: 1 },
    { id: 'supplier', label: t('supplier'), width: 240, padding: 1 },
    { id: 'price_per_piece', label: t('price'), width: 100, align: 'right', padding: 1 },
    { id: 'price_cost', label: 'Kostprijs', width: 120, align: 'right', padding: 1 },
    { id: 'variants', label: 'Bundels / varianten', width: 150, padding: 1 },
    { id: 'vat', label: t('vat'), width: 60, padding: 1 },
    { id: 'free_stock', label: 'Voorraad vrij / totaal', width: 150, padding: 1 },
    { id: 'is_visible_particular', label: 'Particulier', width: 90, padding: 1 },
    { id: 'is_visible_B2B', label: 'B2B', width: 80, padding: 1 },
    { id: '', width: 56, padding: 1 },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    const urlPage = pageParam ? Number(pageParam) : 1;
    const newPageIdx = urlPage > 0 ? urlPage - 1 : 0;

    if (table.page !== newPageIdx) {
      table.setPage(newPageIdx);
    }

    const urlVisibility = params.get('visibility') || 'visible';
    const urlName = params.get('name') || '';
    const urlCategory = params.get('category') || '';
    const urlSupplier = params.get('supplier') || '';

    if (
      filters.visibility !== urlVisibility ||
      filters.name !== urlName ||
      filters.category !== urlCategory ||
      filters.supplier !== urlSupplier
    ) {
      setFilters({
        visibility: urlVisibility,
        name: urlName,
        category: urlCategory,
        supplier: urlSupplier,
      });
    }
  }, [location.search]);

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order, showBundles]);

  // Every list filter except the visibility itself, so each tab gets its count.
  const countsQuery = `${!showBundles ? '&is_variant=false' : ''}${
    filters.name ? `&search=${encodeURIComponent(filters.name)}` : ''
  }${filters.category ? `&category=${filters.category}` : ''}${
    filters.supplier ? `&supplier=${filters.supplier}` : ''
  }`;

  useEffect(() => {
    let active = true;

    axiosInstance
      .get(`/products/visibility-counts/?${countsQuery.slice(1)}`)
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
  }, [countsQuery, countsVersion]);

  const latestRequestRef = useRef(0);

  const getAll = async () => {
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;
    setIsLoading(true);

    const statusFilter =
      filters.visibility === 'hidden'
        ? `&is_product_active=false`
        : filters.visibility === 'is_visible_particular'
          ? `&is_visible_particular=true`
          : filters.visibility === 'is_visible_B2B'
            ? `&is_visible_B2B=true`
            : `&is_product_active=true`;

    const orderByParam = table.orderBy
      ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
      : '';
    const searchFilter = filters.name ? `&search=${encodeURIComponent(filters.name)}` : '';
    const categoryFilter = filters.category ? `&category=${filters.category}` : '';
    const supplierFilter = filters.supplier ? `&supplier=${filters.supplier}` : '';
    try {
      const { data } = await axiosInstance.get(
        `/products/?short=true${!showBundles ? '&is_variant=false' : ''}&limit=${
          table.rowsPerPage
        }&offset=${
          table.page * table.rowsPerPage
        }${searchFilter}${statusFilter}${orderByParam}${categoryFilter}${supplierFilter}`
      );
      // A slower response of an older search must not overwrite the newest one
      if (requestId !== latestRequestRef.current) return;
      setCount(data.count || 0);
      setProductList(data.results || []);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      if (requestId !== latestRequestRef.current) return;
      enqueueSnackbar(t('error'), { variant: 'error' });
      setIsLoading(false);
    }
  };

  const handleFilters = useCallback(
    (name: string, value: IProductTableFilterValue) => {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set(name, value);
      if (name !== 'page') newSearchParams.set('page', '1');
      if (name === 'name' && value === '') {
        setSearchQuery('');
      }
      if (name !== 'page') {
        table.onChangePage(null, 0);
        // The selected rows are no longer on screen after a filter change.
        table.onSelectAllRows(false, []);
      }

      // table.onResetPage();
      router.push(`${location.pathname}?${newSearchParams.toString()}`);
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [location.pathname, location.search, router, table]
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      visibility: 'visible',
      name: '',
      category: '',
      supplier: '',
    });
    router.push(`${location.pathname}`);
  }, [location.pathname, router]);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      await axiosInstance.patch(`/products/${id}/`, {
        is_hidden: true,
        is_visible_particular: false,
        is_visible_B2B: false,
        is_product_active: false,
      });
      enqueueSnackbar(t('delete_success'));
      getAll();
      setCountsVersion((version) => version + 1);
    },
    [enqueueSnackbar, getAll, t]
  );

  const handleHideRows = useCallback(async () => {
    const selectedIds = table.selected;
    const promises = selectedIds.map(async (id) => {
      try {
        // Hiding keeps the product in the Verborgen tab; only the row's own
        // delete action sets is_hidden, which removes it from every list.
        await axiosInstance.patch(`/products/${id}/`, {
          is_visible_particular: false,
          is_visible_B2B: false,
          is_product_active: false,
        });
      } catch (error) {
        console.error(`Error hiding product with ID ${id}:`, error);
      }
    });

    try {
      await Promise.all(promises); // Wait for all requests to complete
      table.onSelectAllRows(false, []);
      enqueueSnackbar(t('update_success'));
      getAll();
      setCountsVersion((version) => version + 1);
    } catch (error) {
      console.error('Error hiding rows:', error);
    }
  }, [table, enqueueSnackbar, getAll, t]);

  const onToggleVisibility = useCallback(
    (row: IProductItem) => async () => {
      try {
        await axiosInstance.put(`/products/${row.id}/`, {
          is_product_active: !row.is_product_active,
          is_visible_particular: false,
          is_visible_B2B: false,
          title: row.title,
        });
        enqueueSnackbar(t('update_success'));
        getAll();
        setCountsVersion((version) => version + 1);
      } catch (error) {
        console.log('error', error);
        const err = Object.values(error)?.[0] || [];
        err.forEach((element) => {
          enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
        });
      }
    },
    [enqueueSnackbar, getAll, t]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(`/dashboard/product/${id}/edit?tab=0`);
    },
    [router]
  );

  const handleTablePageChange = useCallback(
    (e: React.MouseEvent<HTMLButtonElement> | null, pageNo: number) => {
      handleFilters('page', String(pageNo + 1));
      table.onChangePage(e, pageNo);
    },
    [handleFilters, table]
  );

  const handleShowBundles = () => {
    setShowBundles(!showBundles);
  };

  const handleExport = useCallback(
    async (endpoint: string, prefix: string) => {
      setExportMenuAnchor(null);
      try {
        const response = await axiosInstance.get(endpoint, { responseType: 'blob' });
        const currentDateTime = new Date().toISOString().replace(/[:.]/g, '-');
        downloadBlob(response.data, `${prefix}_${currentDateTime}.csv`);
      } catch (error) {
        console.error('Export failed:', error);
        enqueueSnackbar('Export failed', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post('import/products/', formData);
      enqueueSnackbar(t('update_success'), { variant: 'success' });
      getAll();
      setCountsVersion((version) => version + 1);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('error'), { variant: 'error' });
    }
  };

  const canReset =
    !!filters.name || !!filters.category || !!filters.supplier || filters.visibility !== 'visible';

  return (
    <>
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading={t('products')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('products'), href: paths.dashboard.product.root },
            { name: t('list') },
          ]}
          action={
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Button
                component="label"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:import-linear" />}
              >
                {t('import')} (CSV)
                <input type="file" accept=".csv" hidden onChange={handleImport} />
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:export-linear" />}
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              >
                {t('export')}
              </Button>
              <Menu
                anchorEl={exportMenuAnchor}
                open={exportMenuOpen}
                onClose={() => setExportMenuAnchor(null)}
              >
                <MenuItem onClick={() => handleExport('/export/products/', 'products_export')}>
                  Export
                </MenuItem>
                <MenuItem onClick={() => handleExport('/export/products/kort/', 'products_kort')}>
                  Export Kort
                </MenuItem>
                <MenuItem
                  onClick={() => handleExport('/export/products/?nocache=true', 'products')}
                >
                  Export (zonder cache)
                </MenuItem>
              </Menu>
              <Button
                component={RouterLink}
                href={paths.dashboard.product.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                {t('new_product')}
              </Button>
            </Box>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={
              VISIBILITY_TABS.some((tab) => tab.value === filters.visibility)
                ? filters.visibility
                : false
            }
            onChange={(event, value) => handleFilters('visibility', value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {VISIBILITY_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                iconPosition="end"
                icon={
                  tabCounts ? (
                    <Label
                      variant={tab.value === filters.visibility ? 'filled' : 'soft'}
                      color={tab.value === filters.visibility ? 'primary' : 'default'}
                    >
                      {tabCounts[tab.value] || 0}
                    </Label>
                  ) : undefined
                }
                label={
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <span>{tab.label}</span>
                    {tab.hint && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {tab.hint}
                      </Typography>
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <ProductTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            canReset={canReset}
            results={count}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showBundles={showBundles}
            onToggleBundles={handleShowBundles}
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
                {table.selected.length === 1 ? 'product geselecteerd' : 'producten geselecteerd'}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<Iconify icon="solar:eye-closed-bold" />}
                onClick={confirm.onTrue}
              >
                {t('hide')}
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1240 }}>
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
                  {productList.map((row) => (
                    <ProductTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      handleLightBoxSlides={handleLightBoxSlides}
                      onVisibilityChange={() => setCountsVersion((version) => version + 1)}
                      onToggleVisibility={onToggleVisibility(row)}
                    />
                  ))}

                  {!isLoading && productList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={PRODUCT_TABLE_COLUMNS} align="center" sx={{ py: 8 }}>
                        <Typography variant="subtitle1">Geen producten gevonden</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {canReset
                            ? 'Pas de filters aan of wis ze om alle producten te zien.'
                            : 'Er zijn nog geen producten.'}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('hide')}
        content={`${table.selected.length} ${
          table.selected.length === 1 ? 'product' : 'producten'
        } verbergen? Ze verhuizen naar het tabblad Verborgen.`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleHideRows();
              confirm.onFalse();
            }}
          >
            {t('hide')}
          </Button>
        }
      />

      <Lightbox open={openLightBox} close={() => setOpenLightBox(false)} slides={lightBoxSlides} />
    </>
  );
}

