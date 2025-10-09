import { useEffect, useMemo, useState, useCallback } from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import axiosInstance from 'src/utils/axios';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import {
    useTable,
    TableHeadCustom,
    TablePaginationCustom,
} from 'src/components/table';
import Iconify from 'src/components/iconify';

type CartItemProduct = {
    id: number | string;
    title?: string;
};

type CartItem = {
    id: number | string;
    product: CartItemProduct;
    quantity: number;
    product_item_total_price?: string; // without VAT
    product_item_total_price_vat?: string; // with VAT
};

type CartListItem = {
    id: number | string;
    user: number | string;
    user_name?: string;
    user_email?: string;
    last_updated?: string;
    total_items?: number;
    items?: CartItem[];
};

const TABLE_HEAD = [
    { id: 'id', label: 'ID', width: 80 },
    { id: 'user', label: 'User' },
    { id: 'items', label: 'Items', align: 'center', width: 80 },
    { id: 'total', label: 'Total', width: 120 },
    { id: 'last_updated', label: 'Updated', width: 160 },
    { id: '', label: '', width: 64 },
];

export default function OrderCartsView() {
    const settings = useSettingsContext();
    const { t } = useTranslate();

    const table = useTable({ defaultOrderBy: 'last_updated' });

    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [carts, setCarts] = useState<CartListItem[]>([]);
    const [expandedId, setExpandedId] = useState<string | number | null>(null);

    const dataInPage = useMemo(
        () => carts.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage),
        [carts, table.page, table.rowsPerPage]
    );

    useEffect(() => {
        fetchCarts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table.page, table.rowsPerPage, table.orderBy, table.order]);

    const fetchCarts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axiosInstance.get(`/cart/admin/list/`);
            const list: CartListItem[] = Array.isArray(data) ? data : (data?.results || []);
            setCount(list.length);
            setCarts(list);
        } catch (e) {
            setCount(0);
            setCarts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sortedCarts = useMemo(() => {
        const key = table.orderBy as keyof CartListItem | undefined;
        if (!key) return carts;
        const sorted = [...carts].sort((a, b) => {
            const av = (a as any)[key];
            const bv = (b as any)[key];
            if (av == null && bv == null) return 0;
            if (av == null) return table.order === 'asc' ? -1 : 1;
            if (bv == null) return table.order === 'asc' ? 1 : -1;
            if (key === 'last_updated') {
                const ad = new Date(av).getTime();
                const bd = new Date(bv).getTime();
                return table.order === 'asc' ? ad - bd : bd - ad;
            }
            if (typeof av === 'number' && typeof bv === 'number') {
                return table.order === 'asc' ? av - bv : bv - av;
            }
            return table.order === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
        return sorted;
    }, [carts, table.order, table.orderBy]);

    const toggleExpand = useCallback((id: string | number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading={t('carts')}
                links={[
                    { name: t('app'), href: '/' },
                    { name: t('order') },
                    { name: t('carts') },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card>
                <Scrollbar>
                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <Table size={table.dense ? 'small' : 'medium'}>
                            <TableHeadCustom
                                order={table.order}
                                orderBy={table.orderBy}
                                headLabel={TABLE_HEAD}
                                rowCount={carts.length}
                                numSelected={0}
                                onSort={table.onSort}
                            />

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

                                {!isLoading && dataInPage.map((row) => {
                                    const userDisplay = row.user_name || row.user_email || String(row.user) || '-';
                                    const itemsCount = row.total_items ?? row.items?.length ?? 0;
                                    const total = (row.items || []).reduce((sum, it) => sum + (parseFloat(it.product_item_total_price_vat || '0') || 0), 0);
                                    const open = expandedId === row.id;
                                    return (
                                        <>
                                            <TableRow key={String(row.id)} hover>
                                                <TableCell>{row.id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{userDisplay}</Typography>
                                                    {row.user_email && (
                                                        <Typography variant="caption" color="text.secondary">{row.user_email}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">{itemsCount}</TableCell>
                                                <TableCell>{total ? total.toFixed(2) : '-'}</TableCell>
                                                <TableCell>{row.last_updated ? new Date(row.last_updated).toLocaleString() : '-'}</TableCell>
                                                <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                                                    <IconButton
                                                        color={open ? 'inherit' : 'default'}
                                                        onClick={() => toggleExpand(row.id)}
                                                        sx={{ ...(open && { bgcolor: 'action.hover' }) }}
                                                    >
                                                        <Iconify icon="eva:arrow-ios-downward-fill" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>

                                            <TableRow>
                                                <TableCell sx={{ p: 0, border: 'none' }} colSpan={TABLE_HEAD.length}>
                                                    <Collapse in={open} timeout="auto" unmountOnExit sx={{ bgcolor: 'background.neutral' }}>
                                                        <Stack component={Paper} sx={{ m: 1.5, p: 2 }}>
                                                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                                {t('items')}
                                                            </Typography>
                                                            <Table size="small">
                                                                <TableHeadCustom
                                                                    headLabel={[
                                                                        { id: 'product', label: t('product') },
                                                                        { id: 'quantity', label: t('quantity'), width: 100 },
                                                                        { id: 'line_total', label: t('total'), width: 140 },
                                                                    ]}
                                                                />
                                                                <TableBody>
                                                                    {(row.items || []).map((it) => (
                                                                        <TableRow key={String(it.id)}>
                                                                            <TableCell>{it.product?.title || it.product?.id}</TableCell>
                                                                            <TableCell>{it.quantity}</TableCell>
                                                                            <TableCell>{it.product_item_total_price_vat || it.product_item_total_price || '-'}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </Stack>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    );
                                })}

                                {!isLoading && dataInPage.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={TABLE_HEAD.length}>
                                            <Box sx={{ p: 3 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('no_data')}
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
        </Container>
    );
}


