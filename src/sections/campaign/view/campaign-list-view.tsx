import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTable, TablePaginationCustom } from 'src/components/table';

import { ICampaignItem, ICampaignStatus, ICampaignStatusCounts } from 'src/types/campaign';

import CampaignTableRow, { CAMPAIGN_TABLE_COLUMNS } from '../campaign-table-row';
import { heroSlots, CAMPAIGN_STATUS, CAMPAIGN_STATUS_ORDER } from '../campaign-utils';

// ----------------------------------------------------------------------

const SEARCH_DELAY = 400;

const errorText = (error: any, fallback: string) => {
  if (error && typeof error === 'object') {
    const first = Object.values(error).find((value) => Array.isArray(value)) as string[] | undefined;
    if (first?.length) return first[0];
  }
  return error?.detail || error?.error || fallback;
};

export default function CampaignListView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslate();

  const pageParam = searchParams.get('page');
  const table = useTable({
    defaultCurrentPage: pageParam ? Math.max(parseInt(pageParam, 10) - 1, 0) : 0,
    defaultRowsPerPage: 25,
  });

  const [rows, setRows] = useState<ICampaignItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [query, setQuery] = useState(search);
  const [counts, setCounts] = useState<ICampaignStatusCounts | null>(null);
  const [slots, setSlots] = useState<Record<number, string>>({});

  // Keep the filters in the URL so a reload or the back button returns to the same list.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key: string, value: string) =>
      value ? params.set(key, value) : params.delete(key);

    setOrDelete('page', table.page > 0 ? String(table.page + 1) : '');
    setOrDelete('status', status !== 'all' ? status : '');
    setOrDelete('search', search);

    const newSearch = params.toString();
    if (newSearch !== window.location.search.replace(/^\?/, '')) {
      router.push(`${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`);
    }
  }, [table.page, status, search, router]);

  const latestRequestRef = useRef(0);

  const getAll = async () => {
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;
    setIsLoading(true);

    const params = new URLSearchParams({
      limit: String(table.rowsPerPage),
      offset: String(table.rowsPerPage * table.page),
    });
    if (status !== 'all') params.set('status', status);
    if (search) params.set('search', search);

    try {
      const { data } = await axiosInstance.get(`/campaigns/?${params.toString()}`);
      // A slower response of an older search must not overwrite the newest one
      if (requestId !== latestRequestRef.current) return;
      setCount(data.count || 0);
      setRows(data.results || []);
    } catch (error) {
      console.error(error);
      if (requestId !== latestRequestRef.current) return;
      enqueueSnackbar(t('error'), { variant: 'error' });
    }
    setIsLoading(false);
  };

  // Tab counts and hero positions; the list still works when these fail.
  const getSummary = async () => {
    try {
      const [countsRes, liveRes] = await Promise.all([
        axiosInstance.get(`/campaigns/status-counts/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
        axiosInstance.get('/campaigns/?status=active'),
      ]);
      setCounts(countsRes.data);
      const live: ICampaignItem[] = Array.isArray(liveRes.data) ? liveRes.data : liveRes.data?.results || [];
      setSlots(heroSlots(live.map((campaign) => campaign.id)));
    } catch (error) {
      console.error(error);
      setCounts(null);
      setSlots({});
    }
  };

  const refresh = () => {
    getAll();
    getSummary();
  };

  useEffect(() => {
    getAll();
  }, [status, search, table.page, table.rowsPerPage]);

  useEffect(() => {
    getSummary();
  }, [search]);

  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      table.onResetPage();
      setSearch(value.trim());
    }, SEARCH_DELAY);
  };

  const handleReset = () => {
    clearTimeout(timer.current);
    table.onResetPage();
    setQuery('');
    setSearch('');
    setStatus('all');
  };

  const patchRow = async (row: ICampaignItem, body: Partial<ICampaignItem>, success: string) => {
    try {
      await axiosInstance.patch(`/campaigns/${row.id}/`, body);
      enqueueSnackbar(success);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(errorText(error, t('error')), { variant: 'error' });
    }
    refresh();
  };

  const handleToggleActive = (row: ICampaignItem, isActive: boolean) => {
    // Show the new position right away; refresh() corrects it if the request fails.
    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, is_active: isActive } : item)));
    patchRow(row, { is_active: isActive }, isActive ? `${row.name} staat aan` : `${row.name} staat uit`);
  };

  const handleRemoveEndDate = (row: ICampaignItem) =>
    patchRow(row, { end_date: null }, `${row.name} loopt nu zonder einddatum`);

  const handleDuplicate = (row: ICampaignItem) => {
    router.push(`${paths.dashboard.campaign.new}?from=${row.id}`);
  };

  const handleDeleteRow = async (id: number) => {
    try {
      await axiosInstance.delete(`/campaigns/${id}/`);
      enqueueSnackbar(t('delete_success'));
    } catch (error) {
      console.error(error);
      enqueueSnackbar(errorText(error, t('error')), { variant: 'error' });
    }
    refresh();
  };

  const handleEditRow = useCallback(
    (id: number) => {
      router.push(paths.dashboard.campaign.edit(String(id)));
    },
    [router]
  );

  const canReset = !!search || status !== 'all';

  const tabs = [
    { value: 'all', label: 'Alle', color: 'default' as const, count: counts?.total },
    ...CAMPAIGN_STATUS_ORDER.map((value: ICampaignStatus) => ({
      value,
      label: CAMPAIGN_STATUS[value].label,
      color: CAMPAIGN_STATUS[value].color,
      count: counts ? counts.counts[value] || 0 : undefined,
    })),
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Acties"
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('campaign'), href: paths.dashboard.campaign.root },
          { name: t('list') },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.campaign.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            {t('new_campaign')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={status}
          onChange={(_, value) => {
            table.onResetPage();
            setStatus(value);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}` }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                tab.count === undefined ? undefined : (
                  <Label variant={tab.value === status ? 'filled' : 'soft'} color={tab.color}>
                    {tab.count}
                  </Label>
                )
              }
            />
          ))}
        </Tabs>

        <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ p: 2 }}>
          <TextField
            size="small"
            value={query}
            onChange={handleQuery}
            placeholder="Zoek op naam of beschrijving"
            inputProps={{ 'aria-label': t('search') }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 300px', maxWidth: { md: 420 } }}
          />

          <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              <Box component="strong" sx={{ color: 'text.primary' }}>
                {count}
              </Box>{' '}
              {count === 1 ? 'actie' : 'acties'}
            </Typography>
            {canReset && (
              <Button size="small" color="error" onClick={handleReset}>
                Filters wissen
              </Button>
            )}
          </Stack>
        </Stack>

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
                  <TableCell sx={{ pl: 2, pr: 1 }}>{t('campaign')}</TableCell>
                  <TableCell sx={{ px: 1, width: 130 }}>Status</TableCell>
                  <TableCell sx={{ px: 1, width: 220, display: { xs: 'none', sm: 'table-cell' } }}>
                    Periode
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ px: 1, width: 90, display: { xs: 'none', md: 'table-cell' } }}
                  >
                    Korting
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ px: 1, width: 100, display: { xs: 'none', md: 'table-cell' } }}
                  >
                    Producten
                  </TableCell>
                  <TableCell sx={{ px: 1, width: 80 }}>Aan</TableCell>
                  <TableCell sx={{ px: 1, width: 56 }} />
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <CampaignTableRow
                    key={row.id}
                    row={row}
                    heroSlot={row.status === 'active' ? slots[row.id] : undefined}
                    onEditRow={handleEditRow}
                    onToggleActive={handleToggleActive}
                    onRemoveEndDate={handleRemoveEndDate}
                    onDuplicateRow={handleDuplicate}
                    onDeleteRow={handleDeleteRow}
                  />
                ))}

                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={CAMPAIGN_TABLE_COLUMNS} align="center" sx={{ py: 8 }}>
                      <Typography variant="subtitle1">Geen acties gevonden</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {canReset
                          ? 'Pas de filters aan of wis ze om alle acties te zien.'
                          : 'Er zijn nog geen acties. Zonder actieve actie toont de webshop geen banner.'}
                      </Typography>
                      {canReset ? (
                        <Button variant="outlined" onClick={handleReset} sx={{ mt: 2 }}>
                          Filters wissen
                        </Button>
                      ) : (
                        <Button
                          component={RouterLink}
                          href={paths.dashboard.campaign.new}
                          variant="contained"
                          sx={{ mt: 2 }}
                        >
                          {t('new_campaign')}
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
