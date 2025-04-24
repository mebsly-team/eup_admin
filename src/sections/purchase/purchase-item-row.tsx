import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Avatar from '@mui/material/Avatar';

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

            <TableCell>{item.product_detail.ean}</TableCell>
            <TableCell>{item.product_detail.title}</TableCell>

            <TableCell align="center">{item.product_quantity}</TableCell>

            <TableCell align="right">€{parseFloat(item.product_purchase_price).toFixed(2)}</TableCell>
        </TableRow>
    );
} 