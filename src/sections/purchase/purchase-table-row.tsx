import { useState } from 'react';
import { format } from 'date-fns';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import { IPurchaseItem } from 'src/types/purchase';

// ----------------------------------------------------------------------

type Props = {
    purchase: IPurchaseItem;
    selected: boolean;
    onSelectRow: VoidFunction;
    onDeleteRow: VoidFunction;
    onEditRow: VoidFunction;
    expanded: boolean;
    onExpand: VoidFunction;
};

export default function PurchaseTableRow({
    purchase,
    selected,
    onSelectRow,
    onDeleteRow,
    onEditRow,
    expanded,
    onExpand,
}: Props) {
    const { t } = useTranslate();

    const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

    const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
        setOpenPopover(event.currentTarget);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };

    const handleDelete = () => {
        handleClosePopover();
        onDeleteRow();
    };

    return (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox checked={selected} onClick={onSelectRow} />
            </TableCell>

            <TableCell>{purchase.id}</TableCell>

            <TableCell>
                <RouterLink
                    href={paths.dashboard.supplier.edit(purchase.supplier_detail.id)}
                    sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.main',
                        },
                    }}
                >
                    {purchase.supplier_detail.name}
                </RouterLink>
            </TableCell>

            <TableCell>
                {purchase.purchase_invoice_date && format(new Date(purchase.purchase_invoice_date), 'dd MMM yyyy')}
            </TableCell>

            <TableCell align="center">{purchase.items?.length || 0}</TableCell>

            <TableCell align="right">€{parseFloat(purchase.total_exc_btw).toFixed(2)}</TableCell>

            <TableCell align="right">€{parseFloat(purchase.total_inc_btw).toFixed(2)}</TableCell>

            <TableCell>
                <IconButton onClick={onExpand}>
                    <Iconify icon={expanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />
                </IconButton>
            </TableCell>

            <TableCell align="right">
                <IconButton color="primary" onClick={onEditRow}>
                    <Iconify icon="eva:edit-fill" />
                </IconButton>

                <IconButton color="error" onClick={onDeleteRow}>
                    <Iconify icon="eva:trash-2-outline" />
                </IconButton>
            </TableCell>
        </TableRow>
    );
} 