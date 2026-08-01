import Link from '@mui/material/Link';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { fDate, fTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';

import { IInvoice } from 'src/types/invoice';

type Props = {
  row: IInvoice;
  onViewRow: VoidFunction;
};

export default function InvoiceTableRow({
  row,
  onViewRow,
}: Props) {
  const { id, created_at, snelstart_invoice_number, orders, total_amount, is_sent_to_snelstart, user } = row;

  return (
    <TableRow hover>
      <TableCell>{id}</TableCell>

      <TableCell>
        <Link
          noWrap
          variant="body2"
          onClick={onViewRow}
          sx={{ color: 'text.primary', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {user?.email ? `${user.email} - ${snelstart_invoice_number || id}` : (snelstart_invoice_number || id)}
        </Link>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDate(created_at)}
          secondary={fTime(created_at)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell>{fCurrency(total_amount)}</TableCell>

      <TableCell>
        <ListItemText
          primary={`${orders?.length || 0} order(s)`}
          secondary={orders?.map(o => o.snelstart_order_number || o.id).join(', ')}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ typography: 'caption', color: 'text.secondary' }}
        />
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={is_sent_to_snelstart ? 'success' : 'warning'}
        >
          {is_sent_to_snelstart ? 'Sent' : 'Pending'}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        <IconButton color="default" onClick={onViewRow}>
          <Iconify icon="solar:eye-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
