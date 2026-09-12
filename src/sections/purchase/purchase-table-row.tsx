import { format } from 'date-fns';

import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

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
    /** Renders an extra "sent at" column, used by the sent-offers list. */
    showSentAt?: boolean;
    /** Bestel advies list: build the PDF and move the offer to the sent list. */
    onSendToSupplier?: VoidFunction;
    sending?: boolean;
    /** Sent-offers list: download the offer PDF again. */
    onDownloadPdf?: VoidFunction;
    downloading?: boolean;
    /** Sent-offers list: book the offer as a purchase (inkoop). */
    onConvertToPurchase?: VoidFunction;
    converting?: boolean;
};

export default function PurchaseTableRow({
    purchase,
    selected,
    onSelectRow,
    onDeleteRow,
    onEditRow,
    expanded,
    onExpand,
    showSentAt = false,
    onSendToSupplier,
    sending = false,
    onDownloadPdf,
    downloading = false,
    onConvertToPurchase,
    converting = false,
}: Props) {
    const { t } = useTranslate();

    const busy = sending || downloading || converting;

    const hasItems = (purchase.items?.length || 0) > 0;
    const hasTotals =
        !!purchase.total_exc_btw &&
        purchase.total_exc_btw !== '0.00' &&
        !!purchase.total_inc_btw &&
        purchase.total_inc_btw !== '0.00';
    const isActionable = hasItems && hasTotals;

    const blockedReason = !hasItems
        ? t('offer_has_no_items')
        : t('calculation_errors_prevent_conversion');

    return (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox checked={selected} onClick={onSelectRow} />
            </TableCell>

            <TableCell>{purchase.id}</TableCell>

            <TableCell>
                <Link
                    component={RouterLink}
                    href={paths.dashboard.supplier.edit(String(purchase.supplier_detail.id))}
                    sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.main',
                        },
                    }}
                >
                    <ListItemText
                        primary={purchase.supplier_detail.name}
                        secondary={purchase.supplier_detail.supplier_code}
                        primaryTypographyProps={{ typography: 'body2' }}
                        secondaryTypographyProps={{ component: 'span', color: 'text.disabled', typography: 'caption' }}
                    />
                </Link>
            </TableCell>

            <TableCell>
                {purchase.purchase_invoice_date && format(new Date(purchase.purchase_invoice_date), 'dd MMM yyyy')}
            </TableCell>

            <TableCell>{purchase.purchase_invoice_number || '-'}</TableCell>

            {showSentAt && (
                <TableCell>
                    {purchase.sent_at ? format(new Date(purchase.sent_at), 'dd MMM yyyy HH:mm') : '-'}
                </TableCell>
            )}

            <TableCell align="center">{purchase.items?.length || 0}</TableCell>

            <TableCell align="right">€{parseFloat(purchase.total_exc_btw).toFixed(2)}</TableCell>

            <TableCell align="right">€{parseFloat(purchase.total_inc_btw).toFixed(2)}</TableCell>

            <TableCell>
                <IconButton onClick={onExpand}>
                    <Iconify icon={expanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />
                </IconButton>
            </TableCell>

            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {onSendToSupplier && (
                    <Tooltip title={isActionable ? t('create_pdf_and_send') : blockedReason}>
                        <span>
                            <IconButton
                                color="info"
                                onClick={onSendToSupplier}
                                disabled={busy || !isActionable}
                            >
                                {sending ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Iconify icon="eva:paper-plane-outline" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {onDownloadPdf && (
                    <Tooltip title={isActionable ? t('download_pdf') : blockedReason}>
                        <span>
                            <IconButton
                                color="default"
                                onClick={onDownloadPdf}
                                disabled={busy || !isActionable}
                            >
                                {downloading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Iconify icon="eva:download-outline" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {onConvertToPurchase && (
                    <Tooltip title={isActionable ? t('save_to_inkoop') : blockedReason}>
                        <span>
                            <IconButton
                                color="success"
                                onClick={onConvertToPurchase}
                                disabled={busy || !isActionable}
                            >
                                {converting ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Iconify icon="eva:shopping-cart-outline" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                <Tooltip title={t('edit')}>
                    <span>
                        <IconButton color="primary" onClick={onEditRow} disabled={busy}>
                            <Iconify icon="eva:edit-fill" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title={t('delete')}>
                    <span>
                        <IconButton color="error" onClick={onDeleteRow} disabled={busy}>
                            <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                    </span>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
