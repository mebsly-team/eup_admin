import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import axiosInstance from 'src/utils/axios';
import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { LoadingScreen } from 'src/components/loading-screen';

import { IInvoice } from 'src/types/invoice';
import InvoiceTableRow from '../invoice-table-row';

const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 80 },
  { id: 'snelstart_invoice_number', label: 'Invoice No' },
  { id: 'created_at', label: 'Created At' },
  { id: 'total_amount', label: 'Total' },
  { id: 'orders_count', label: 'Orders' },
  { id: 'is_paid', label: 'Payment Status' },
  { id: 'status', label: 'Status' },
  { id: '', width: 88 },
];

export default function InvoiceListView() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const router = useRouter();
  const location = useLocation();

  const table = useTable({ defaultOrderBy: 'created_at' });

  const [invoiceList, setInvoiceList] = useState<IInvoice[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAll();
  }, [table.page, table.rowsPerPage]);

  const getAll = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(
        `/invoices/?limit=${table.rowsPerPage}&offset=${table.page * table.rowsPerPage}`
      );
      setCount(data.count || 0);
      setInvoiceList(data.results || []);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error loading invoices', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Invoices')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('invoice'), href: paths.dashboard.invoice.root },
            { name: t('list') },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ width: "100%" }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={invoiceList.length}
                />

                <TableBody>
                  {invoiceList.map((row) => (
                    <InvoiceTableRow
                      key={row.id}
                      row={row}
                      onViewRow={() => handleViewRow(row.id)}
                    />
                  ))}
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
    </>
  );
}
