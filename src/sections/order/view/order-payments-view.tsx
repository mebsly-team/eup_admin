import { Fragment, useCallback, useEffect, useState } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

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

// ----------------------------------------------------------------------

type PaymentItem = {
  product_id: number | null;
  title: string | null;
  ean: string | null;
  quantity: number | null;
  price_vat: string | null;
  total_vat: string | null;
  image: string | null;
};

type PaymentRow = {
  id: number;
  mollie_payment_id: string;
  amount: string;
  status: string;
  payment_method: string;
  source_host: string;
  created_at: string;
  updated_at: string;
  order: number | null;
  customer: { id: number; email: string; name: string } | null;
  items: PaymentItem[];
  shipping_address: Record<string, string> | null;
  mollie_dashboard_url: string | null;
};

type Counts = {
  total: number;
  counts: Record<string, number>;
  without_order: number;
  abandoned: number;
};

// Mollie statuses -> label colour
const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  paid: 'success',
  open: 'warning',
  pending: 'warning',
  authorized: 'info',
  created: 'default',
  canceled: 'error',
  expired: 'error',
  failed: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Betaald',
  open: 'Open',
  pending: 'In behandeling',
  authorized: 'Geautoriseerd',
  created: 'Aangemaakt',
  canceled: 'Geannuleerd',
  expired: 'Verlopen',
  failed: 'Mislukt',
};

// Tab -> query string for the list endpoint
const TABS: { value: string; label: string; query: string; count: (c: Counts) => number }[] = [
  { value: 'all', label: 'Alle', query: '', count: (c) => c.total },
  {
    value: 'abandoned',
    label: 'Niet afgerond',
    query: '&abandoned=true',
    count: (c) => c.abandoned,
  },
  {
    value: 'open',
    label: 'Open',
    query: '&status=open,pending,created,authorized&has_order=false',
    count: (c) =>
      (c.counts.open || 0) + (c.counts.pending || 0) + (c.counts.created || 0) + (c.counts.authorized || 0),
  },
  { value: 'paid', label: 'Betaald', query: '&status=paid', count: (c) => c.counts.paid || 0 },
];

const TABLE_HEAD = [
  { id: 'created_at', label: 'Datum', width: 150 },
  { id: 'customer', label: 'Klant' },
  { id: 'amount', label: 'Bedrag', width: 110 },
  { id: 'payment_method', label: 'Methode', width: 110 },
  { id: 'status', label: 'Mollie status', width: 130 },
  { id: 'order', label: 'Bestelling', width: 170 },
  { id: '', label: '', width: 64 },
];

export default function OrderPaymentsView() {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable({ defaultRowsPerPage: 25 });

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [count, setCount] = useState(0);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [convertTarget, setConvertTarget] = useState<PaymentRow | null>(null);
  const [converting, setConverting] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(handle);
  }, [search]);

  const searchQuery = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const tabQuery = TABS.find((item) => item.value === tab)?.query || '';
      const { data } = await axiosInstance.get(
        `/payments/?limit=${table.rowsPerPage}&offset=${table.page * table.rowsPerPage}${tabQuery}${searchQuery}`
      );
      setRows(data.results || []);
      setCount(data.count || 0);
    } catch (error) {
      console.error('payments: load failed', error);
      enqueueSnackbar('Betalingen laden mislukt', { variant: 'error' });
      setRows([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [tab, table.rowsPerPage, table.page, searchQuery, enqueueSnackbar]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows, version]);

  useEffect(() => {
    let active = true;
    axiosInstance
      .get(`/payments/status-counts/?${searchQuery.slice(1)}`)
      .then(({ data }) => {
        if (active) setCounts(data);
      })
      .catch(() => {
        if (active) setCounts(null);
      });
    return () => {
      active = false;
    };
  }, [searchQuery, version]);

  const handleTab = (_: unknown, value: string) => {
    setTab(value);
    table.onResetPage();
  };

  const handleConvert = async () => {
    if (!convertTarget) return;
    setConverting(true);
    try {
      const { data } = await axiosInstance.post(`/payments/${convertTarget.id}/create-order/`, {});
      enqueueSnackbar(`Bestelling #${data.order_id} aangemaakt`, { variant: 'success' });
      setConvertTarget(null);
      setVersion((v) => v + 1);
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.error || 'Bestelling aanmaken mislukt', { variant: 'error' });
    } finally {
      setConverting(false);
    }
  };

  const formatAmount = (value: string) => `€ ${Number(value || 0).toFixed(2)}`;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Betalingen"
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('order'), href: paths.dashboard.order.root },
          { name: 'Betalingen' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Elke betaalpoging vanuit de webshop. Een bestelling ontstaat pas als Mollie de betaling
        bevestigt; wat een klant in de winkelwagen had staat hier ook als er niet is betaald.
      </Typography>

      <Card>
        <Tabs
          value={tab}
          onChange={handleTab}
          sx={{
            px: 2,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={item.label}
              iconPosition="end"
              icon={
                counts ? (
                  <Label
                    variant={item.value === tab ? 'filled' : 'soft'}
                    color={item.value === tab ? 'primary' : 'default'}
                  >
                    {item.count(counts)}
                  </Label>
                ) : undefined
              }
            />
          ))}
        </Tabs>

        <Stack direction="row" spacing={2} sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              table.onResetPage();
            }}
            placeholder="Zoek op klant, e-mail, product, EAN of Mollie id"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Scrollbar>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom headLabel={TABLE_HEAD} rowCount={rows.length} numSelected={0} />

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length}>
                      <Box sx={{ p: 3 }}>
                        <LoadingScreen />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  rows.map((row) => {
                    const open = expandedId === row.id;
                    const abandoned =
                      row.order === null && ['canceled', 'expired', 'failed'].includes(row.status);
                    return (
                      <Fragment key={row.id}>
                        <TableRow hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2">{fDateTime(row.created_at, 'dd MMM yyyy')}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fDateTime(row.created_at, 'HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {row.customer ? (
                              <>
                                <Link
                                  component={RouterLink}
                                  href={paths.dashboard.user.edit(String(row.customer.id))}
                                  variant="body2"
                                  color="inherit"
                                  underline="hover"
                                >
                                  {row.customer.name || row.customer.email}
                                </Link>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {row.customer.email}
                                </Typography>
                              </>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{formatAmount(row.amount)}</TableCell>
                          <TableCell>{row.payment_method || '-'}</TableCell>
                          <TableCell>
                            <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
                              {STATUS_LABEL[row.status] || row.status}
                            </Label>
                          </TableCell>
                          <TableCell>
                            {row.order ? (
                              <Link
                                component={RouterLink}
                                href={paths.dashboard.order.details(String(row.order))}
                                variant="body2"
                                underline="hover"
                              >
                                #{row.order}
                              </Link>
                            ) : abandoned ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setConvertTarget(row)}
                                startIcon={<Iconify icon="mingcute:add-line" />}
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                Maak bestelling
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Wacht op betaling
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                            <IconButton
                              color={open ? 'inherit' : 'default'}
                              onClick={() => setExpandedId(open ? null : row.id)}
                              sx={{ ...(open && { bgcolor: 'action.hover' }) }}
                            >
                              <Iconify icon="eva:arrow-ios-downward-fill" />
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell sx={{ p: 0, border: 'none' }} colSpan={TABLE_HEAD.length}>
                            <Collapse in={open} timeout="auto" unmountOnExit sx={{ bgcolor: 'background.neutral' }}>
                              <Stack component={Paper} spacing={2} sx={{ m: 1.5, p: 2 }}>
                                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                                  <Typography variant="caption" color="text.secondary">
                                    Mollie:{' '}
                                    {row.mollie_dashboard_url ? (
                                      <Link href={row.mollie_dashboard_url} target="_blank" rel="noopener">
                                        {row.mollie_payment_id}
                                      </Link>
                                    ) : (
                                      row.mollie_payment_id || '-'
                                    )}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Shop: {row.source_host || '-'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Laatste update: {fDateTime(row.updated_at)}
                                  </Typography>
                                  {row.shipping_address && (
                                    <Typography variant="caption" color="text.secondary">
                                      Bezorgen: {row.shipping_address.street_name} {row.shipping_address.house_number}
                                      {row.shipping_address.house_suffix ? ` ${row.shipping_address.house_suffix}` : ''},{' '}
                                      {row.shipping_address.zip_code} {row.shipping_address.city}
                                    </Typography>
                                  )}
                                </Stack>

                                <Table size="small">
                                  <TableHeadCustom
                                    headLabel={[
                                      { id: 'product', label: 'Product' },
                                      { id: 'ean', label: 'EAN', width: 150 },
                                      { id: 'quantity', label: 'Aantal', width: 90 },
                                      { id: 'price', label: 'Prijs incl.', width: 110 },
                                      { id: 'total', label: 'Totaal incl.', width: 110 },
                                    ]}
                                  />
                                  <TableBody>
                                    {row.items.map((item, index) => (
                                      <TableRow key={`${row.id}-${index}`}>
                                        <TableCell>
                                          {item.product_id ? (
                                            <Link
                                              component={RouterLink}
                                              href={paths.dashboard.product.edit(String(item.product_id))}
                                              color="inherit"
                                              underline="hover"
                                            >
                                              {item.title || `#${item.product_id}`}
                                            </Link>
                                          ) : (
                                            item.title || '-'
                                          )}
                                        </TableCell>
                                        <TableCell>{item.ean || '-'}</TableCell>
                                        <TableCell>{item.quantity ?? '-'}</TableCell>
                                        <TableCell>{item.price_vat ? formatAmount(item.price_vat) : '-'}</TableCell>
                                        <TableCell>{item.total_vat ? formatAmount(item.total_vat) : '-'}</TableCell>
                                      </TableRow>
                                    ))}
                                    {row.items.length === 0 && (
                                      <TableRow>
                                        <TableCell colSpan={5}>
                                          <Typography variant="caption" color="text.secondary">
                                            Geen regels bekend (betaling van een bestaande bestelling).
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </Stack>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}

                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length}>
                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Geen betalingen gevonden.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

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

      <ConfirmDialog
        open={Boolean(convertTarget)}
        onClose={() => setConvertTarget(null)}
        title="Bestelling aanmaken"
        content={
          convertTarget ? (
            <>
              Maak een onbetaalde bestelling van {formatAmount(convertTarget.amount)} voor{' '}
              <strong>{convertTarget.customer?.name || convertTarget.customer?.email}</strong> met de{' '}
              {convertTarget.items.length} regel(s) uit deze betaalpoging? De voorraad wordt direct
              gereserveerd; de klant krijgt geen e-mail.
            </>
          ) : null
        }
        action={
          <Button variant="contained" onClick={handleConvert} disabled={converting}>
            {converting ? 'Bezig...' : 'Maak bestelling'}
          </Button>
        }
      />
    </Container>
  );
}
