import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

type Props = {
    item: {
        id: string;
        product: number;
        product_detail: {
            id: number;
            title: string;
            images: string[];
            ean: string;
        };
        product_quantity: number;
        product_purchase_price: string;
    };
    selected: boolean;
    onSelectRow: VoidFunction;
};

export default function PurchaseItemRow({ item, selected, onSelectRow }: Props) {
    return (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox checked={selected} onClick={onSelectRow} />
            </TableCell>

            <TableCell align="center">
                <Avatar
                    alt={item.product_detail.title}
                    src={item.product_detail.images[0] || ''}
                    sx={{ width: 48, height: 48 }}
                    variant="rounded"
                />
            </TableCell>

            <TableCell>
                <Link
                    href={paths.dashboard.product.edit(item.product_detail.id.toString())}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                        fontWeight: 'normal',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        color: 'primary.main',
                    }}
                >
                    <Typography variant="body2">{item.product_detail.ean}</Typography>
                </Link>
            </TableCell>
            <TableCell>{item.product_detail.title}</TableCell>

            <TableCell align="center">{item.product_quantity}</TableCell>

            <TableCell align="right">€{parseFloat(item.product_purchase_price).toFixed(2)}</TableCell>
        </TableRow>
    );
} 