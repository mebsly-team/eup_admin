import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Iconify from 'src/components/iconify';

import { fDate, fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import Scrollbar from 'src/components/scrollbar';
import { IInvoice } from 'src/types/invoice';

type Props = {
  invoice: IInvoice;
  onRemoveOrder?: (orderId: string) => void;
  onAddOrderClick?: () => void;
};

export default function InvoiceDetails({ invoice, onRemoveOrder, onAddOrderClick }: Props) {
  const { invoice_number, created_at, snelstart_invoice_id, orders } = invoice;

  return (
    <Card sx={{ pt: 5, px: 5, pb: 5 }}>
      <Box
        rowGap={5}
        display="grid"
        alignItems="center"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
      >
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="h6">Invoice {invoice_number}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ID: {invoice.id}
          </Typography>
        </Stack>

        <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
          <Typography variant="body2">Created: {fDateTime(created_at)}</Typography>
          <Typography variant="body2">Snelstart ID: {snelstart_invoice_id || 'Not synced'}</Typography>
        </Stack>
      </Box>

      <Divider sx={{ mt: 5, mb: 5, borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Linked Orders ({orders?.length || 0})</Typography>
        {onAddOrderClick && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onAddOrderClick}
          >
            Add Order
          </Button>
        )}
      </Stack>

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customer?.name}</TableCell>
                  <TableCell>{fDate(order.createdAt)}</TableCell>
                  <TableCell align="right">{order.totalQuantity}</TableCell>
                  <TableCell align="right">{fCurrency(order.totalAmount)}</TableCell>
                  <TableCell align="right">
                    {onRemoveOrder && (
                      <Tooltip title="Remove order from invoice">
                        <IconButton color="error" onClick={() => onRemoveOrder(order.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {!orders?.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No orders linked.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}
