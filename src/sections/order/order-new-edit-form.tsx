import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { roundToTwoDecimals } from 'src/utils/format-number';
import FormProvider, {
    RHFSelect,
    RHFTextField,
    RHFAutocomplete,
    RHFCheckbox,
} from 'src/components/hook-form';

import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import axiosInstance from 'src/utils/axios';

import { IOrderItem } from 'src/types/order';
import { IProductItem } from 'src/types/product';

interface IOrderFormItem {
    product: IProductItem | null;
    quantity: number;
    price: number;
    vat_rate: number;
}

interface IOrderFormCustomer {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    business_name?: string;
    relation_code?: string;
    customer_percentage?: number;
    is_vat_document_printed?: boolean;
}

interface IOrderFormData {
    customer: IOrderFormCustomer | null;
    status: string;
    shipping_method: string;
    payment_method: string;
    items: IOrderFormItem[];
    shipping_address: {
        street_name: string;
        house_number: string;
        house_suffix: string;
        zip_code: string;
        city: string;
        country: string;
        phone_number: string;
    };
    notes: string;
    eanSearch: string;
    source_host: string;
    discount: number;
    shipping: number;
    taxes: number;
    total: number;
}

const ORDER_STATUS_OPTIONS = [
    { value: 'pending_order', label: 'Order' },
    { value: 'user_pending', label: 'Op klant' },
    { value: 'werkbon', label: 'Orderpicker' },
    { value: 'packing', label: 'Pakbon' },
    { value: 'shipped', label: 'Verzonden' },
    { value: 'delivered', label: 'Geleverd' },
    { value: 'cancelled', label: 'Geannuleerd' },
    { value: 'refunded', label: 'Terugbetaald' },
    { value: 'pending_offer', label: 'Offer' },
    { value: 'confirmed', label: 'Bevestigd' },
    { value: 'other', label: 'Anders' },
];

const SHIPPING_METHODS = [
    { value: 'dhl', label: 'DHL' },
    { value: 'europower', label: 'Europower' },
    { value: 'postnl', label: 'PostNL' },
    { value: 'pickup', label: 'Afhalen' },
];

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash', label: 'Cash' },
];

type Props = {
    currentOrder?: IOrderItem;
};

export default function OrderNewEditForm({ currentOrder }: Props) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslate();
    const settings = useSettingsContext();

    const [customers, setCustomers] = useState<IOrderFormCustomer[]>([]);
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');

    const NewOrderSchema = Yup.object().shape({
        customer: Yup.mixed().nullable(),
        status: Yup.string(),
        shipping_method: Yup.string(),
        payment_method: Yup.string(),
        items: Yup.array().of(Yup.object().shape({
            product: Yup.mixed().nullable(),
            quantity: Yup.number().required('Quantity is required'),
            price: Yup.number().required('Price is required'),
            vat_rate: Yup.number().required('VAT rate is required'),
        })),
        shipping_address: Yup.object().shape({
            street_name: Yup.string(),
            house_number: Yup.string(),
            house_suffix: Yup.string(),
            zip_code: Yup.string(),
            city: Yup.string(),
            country: Yup.string(),
            phone_number: Yup.string(),
        }),
        notes: Yup.string(),
        eanSearch: Yup.string(),
        source_host: Yup.string().required('Source host is required'),
        discount: Yup.number().min(0),
        shipping: Yup.number().min(0),
        taxes: Yup.number().min(0),
        total: Yup.number(),
    });

    const defaultValues = {
        customer: currentOrder?.customer || null,
        status: currentOrder?.status || 'pending_order',
        shipping_method: '',
        payment_method: '',
        items: currentOrder?.items || [],
        shipping_address: {
            street_name: '',
            house_number: '',
            house_suffix: '',
            zip_code: '',
            city: '',
            country: 'NL',
            phone_number: '',
        },
        notes: '',
        eanSearch: '',
        source_host: 'europowerbv.com',
        discount: currentOrder?.discount || 0,
        shipping: currentOrder?.shipping || 0,
        taxes: currentOrder?.taxes || 0,
        total: 0,
    };

    const methods = useForm<IOrderFormData>({
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { isSubmitting },
    } = methods;

    const watchedItems = watch('items') || [];

    useEffect(() => {
        // No initial loading of products
    }, []);

    useEffect(() => {
        const total = calculateTotal();
        setValue('total', total);
    }, [watchedItems, watch('discount'), watch('shipping'), watch('taxes'), setValue]);

    const fetchCustomers = async (searchTerm = '') => {
        if (!searchTerm) {
            setCustomers([]);
            return;
        }

        try {
            const { data } = await axiosInstance.get(`/users/?search=${searchTerm}&limit=20`);
            console.log('Fetched customers:', data);

            // Handle different response formats
            let customers: IOrderFormCustomer[] = [];
            if (Array.isArray(data)) {
                customers = data.slice(0, 20); // Ensure max 20 results
            } else if (data.results && Array.isArray(data.results)) {
                customers = data.results.slice(0, 20); // Ensure max 20 results
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Single user object returned
                customers = [data];
            }

            setCustomers(customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        }
    };

    const handleCustomerSearch = async (searchTerm: string) => {
        setCustomerSearchTerm(searchTerm);
        if (searchTerm.length >= 2) {
            await fetchCustomers(searchTerm);
        } else {
            setCustomers([]);
        }
    };

    const fetchProducts = async (searchTerm = '') => {
        if (!searchTerm) {
            setProducts([]);
            return;
        }

        try {
            const { data } = await axiosInstance.get(`/products/?search=${searchTerm}&limit=20`);
            console.log('Fetched products:', data);

            let products: IProductItem[] = [];
            if (Array.isArray(data)) {
                products = data.slice(0, 20);
            } else if (data.results && Array.isArray(data.results)) {
                products = data.results.slice(0, 20);
            }

            setProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    const handleProductSearch = async (searchTerm: string) => {
        if (searchTerm.length >= 2) {
            await fetchProducts(searchTerm);
        } else {
            setProducts([]);
        }
    };

    const handleEanSearch = async () => {
        const eanValue = getValues('eanSearch');
        if (!eanValue) {
            enqueueSnackbar(t('please_enter_ean'), { variant: 'warning' });
            return;
        }

        if (!watch('customer')) {
            enqueueSnackbar(t('please_select_customer_first'), { variant: 'warning' });
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get(`/products/?ean=${eanValue}`);
            if (response.status === 200) {
                const products = Array.isArray(response.data) ? response.data :
                    response.data.results ? response.data.results : [];

                if (products.length > 0) {
                    const customer = watch('customer');
                    const customerPercentage = customer?.customer_percentage || 0;
                    const discountFactor = 1 - (customerPercentage / 100);

                    const newItems = products.map((product: IProductItem) => {
                        const basePrice = product.price_per_unit || 0;
                        const discountedPrice = basePrice * discountFactor;

                        return {
                            product,
                            quantity: 1,
                            price: Number(discountedPrice.toFixed(2)),
                            vat_rate: product.vat || 21,
                        };
                    });

                    const currentItems = watch('items') || [];

                    const existingProductIds = new Set(
                        currentItems.map(item => item.product?.id).filter(Boolean)
                    );

                    const itemsToAdd = newItems.filter((item: IOrderFormItem) => !existingProductIds.has(item.product?.id));

                    if (itemsToAdd.length > 0) {
                        setValue('items', [...currentItems, ...itemsToAdd]);
                        setValue('eanSearch', '');
                        enqueueSnackbar(t('products_added_to_order', { count: itemsToAdd.length }), { variant: 'success' });

                        if (itemsToAdd.length < newItems.length) {
                            enqueueSnackbar(t('products_already_in_order', { count: newItems.length - itemsToAdd.length }), { variant: 'info' });
                        }
                    } else {
                        enqueueSnackbar(t('all_products_already_in_order'), { variant: 'info' });
                    }
                } else {
                    enqueueSnackbar(t('no_products_found_ean'), { variant: 'warning' });
                }
            }
        } catch (error) {
            console.error('Error searching by EAN:', error);
            enqueueSnackbar(t('error_searching_ean'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const submitOrder = async (data: IOrderFormData, status: string | null = 'pending_order', extra_note: string = "") => {
        console.log("🚀 ~ OrderNewEditForm ~ data:", data)

        if (!data.customer) {
            enqueueSnackbar(t('please_select_customer'), { variant: 'error' });
            return;
        }

        if (!data.items || data.items.length === 0) {
            enqueueSnackbar(t('please_add_at_least_one_product'), { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            const subtotal = roundToTwoDecimals(data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0));
            const subtotalWithVat = roundToTwoDecimals(subtotal + data.items.reduce((sum, item) => sum + (item.quantity * item.price * item.vat_rate / 100), 0));
            const total = roundToTwoDecimals((data.customer?.is_vat_document_printed ? subtotal : subtotalWithVat) - (data.discount || 0) + (data.shipping || 0) + (data.taxes || 0));

            const cartItems = data.items.map(item => ({
                id: item.product?.id,
                product: item.product,
                quantity: item.quantity,
                completed: false,
                single_product_discounted_price_per_unit: item.price,
                single_product_discounted_price_per_unit_vat: roundToTwoDecimals(item.price * (1 + item.vat_rate / 100)),
                product_item_total_price: roundToTwoDecimals(item.quantity * item.price),
                product_item_total_price_vat: roundToTwoDecimals(item.quantity * item.price * (1 + item.vat_rate / 100)),
                vat_rate: item.vat_rate,
            }));

            const orderData = {
                "user_id": data.customer.id,
                "status": status || "pending_order",
                "extra_note": extra_note,
                "source_host": data.source_host,
                "sub_total": subtotal,
                "total": total,
                "cart": {
                    "items": cartItems,
                    "cart_total_price": roundToTwoDecimals(subtotal),
                    "cart_total_price_vat": data.customer?.is_vat_document_printed ? roundToTwoDecimals(subtotal) : subtotalWithVat,
                },
                "shipping_address": data.shipping_address,
                "invoice_address": data.shipping_address,
                "delivery_details": {
                    "shipping_method": data.shipping_method,
                    "payment_method": data.payment_method
                },
                "notes": data.notes || "",
                "discount": data.discount || 0,
                "shipping_cost": data.shipping || 0,
                "taxes": data.taxes || 0,
                "history": []
            };

            console.log("🚀 ~ Sending order data:", orderData);
            await axiosInstance.post('/orders/', orderData);

            const successMessage = status === 'other' ? t('offer_created_successfully') : t('order_created_successfully');
            enqueueSnackbar(successMessage);
            router.push(paths.dashboard.order.root);
        } catch (error) {
            console.error('Error creating order:', error);
            const errorMessage = status === 'other' ? t('error_creating_offer') : t('error_creating_order');
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = handleSubmit(async (data: IOrderFormData) => {
        await submitOrder(data, 'pending_order');
    });

    const onSubmitOffer = handleSubmit(async (data: IOrderFormData) => {
        await submitOrder(data, null, "offer");
    });

    const addItem = () => {
        const currentItems = watch('items') || [];
        setValue('items', [
            ...currentItems,
            {
                product: null,
                quantity: 1,
                price: 0,
                vat_rate: 21,
            },
        ]);
    };

    const removeItem = (index: number) => {
        const currentItems = watch('items') || [];
        const newItems = currentItems.filter((_, i) => i !== index);
        setValue('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const currentItems = watch('items') || [];
        const updatedItems = [...currentItems];

        if (field === 'product' && value) {
            const customer = watch('customer');
            const customerPercentage = customer?.customer_percentage || 0;
            const discountFactor = 1 - (customerPercentage / 100);
            const basePrice = value.price_per_unit || 0;
            const discountedPrice = basePrice * discountFactor;

            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
                price: Number(discountedPrice.toFixed(2)),
                vat_rate: value.vat || 21
            };
        } else {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
        }

        setValue('items', updatedItems);
    };

    const calculateSubtotal = () => {
        const items = watch('items') || [];
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const calculateVAT = () => {
        const isVatZero = !!watch('customer')?.is_vat_document_printed;
        if (isVatZero) return 0;
        const items = watch('items') || [];
        return items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.price;
            const vatAmount = itemTotal * (item.vat_rate / 100);
            return sum + vatAmount;
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const vat = calculateVAT();
        const discount = watch('discount') || 0;
        const shipping = watch('shipping') || 0;
        const taxes = watch('taxes') || 0;
        return roundToTwoDecimals(subtotal + vat - discount + shipping + taxes);
    };

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid xs={12} md={8}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            {t('order_information')}
                        </Typography>

                        <Stack spacing={3}>
                            <RHFAutocomplete
                                name="customer"
                                label={t('customer')}
                                placeholder={t('customer_search_placeholder')}
                                options={customers}
                                noOptionsText={customerSearchTerm.length < 2 ? t('customer_search_min_chars') : t('no_customers_found')}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'object' && option) {
                                        const firstName = option.first_name || '';
                                        const lastName = option.last_name || '';
                                        const email = option.email || '';
                                        const businessName = option.business_name || '';

                                        if (businessName) {
                                            return `${businessName} (${firstName} ${lastName}) - ${email}`;
                                        }
                                        return `${firstName} ${lastName} - ${email}`;
                                    }
                                    return '';
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    if (option && value && typeof option === 'object' && typeof value === 'object') {
                                        return option.id === value.id;
                                    }
                                    return false;
                                }}
                                onInputChange={(event, newInputValue) => {
                                    handleCustomerSearch(newInputValue);
                                }}
                                filterOptions={(options, { inputValue }) => {
                                    if (!inputValue) return options;

                                    const searchTerm = inputValue.toLowerCase();
                                    return options.filter((option) => {
                                        if (typeof option === 'object' && option) {
                                            const fullName = `${option.first_name || ''} ${option.last_name || ''}`.toLowerCase();
                                            const email = String(option.email || '').toLowerCase();
                                            const businessName = String(option.business_name || '').toLowerCase();
                                            const relationCode = String(option.relation_code || '').toLowerCase();

                                            return (
                                                fullName.includes(searchTerm) ||
                                                email.includes(searchTerm) ||
                                                businessName.includes(searchTerm) ||
                                                relationCode.includes(searchTerm)
                                            );
                                        }
                                        return false;
                                    });
                                }}
                            />

                            <RHFSelect name="source_host" label={t('source_host')}>
                                <MenuItem value="europowerbv.com">europowerbv.com</MenuItem>
                                <MenuItem value="kooptop.com">kooptop.com</MenuItem>
                            </RHFSelect>

                            {/* <RHFSelect name="status" label="Status">
                                {ORDER_STATUS_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect> */}

                            {/* <RHFSelect name="shipping_method" label="Shipping Method">
                                {SHIPPING_METHODS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect>

                            <RHFSelect name="payment_method" label="Payment Method">
                                {PAYMENT_METHODS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect> */}

                            {/* <RHFTextField name="notes" label="Notes" multiline rows={3} /> */}
                        </Stack>
                    </Card>

                    {watch('customer') && (
                        <Card sx={{ p: 3, mt: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6">{t('order_items')}</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid xs={12} md={8}>
                                        <RHFTextField
                                            name="eanSearch"
                                            label={t('search_by_ean')}
                                            placeholder={t('enter_ean_placeholder')}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleEanSearch();
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid xs={12} md={4}>
                                        <LoadingButton
                                            variant="contained"
                                            onClick={handleEanSearch}
                                            loading={loading}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                        >
                                            {t('search_and_add')}
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Stack spacing={2}>
                                {watchedItems.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 1 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {t('no_products_added')}
                                        </Typography>
                                    </Box>
                                ) : (
                                    watchedItems.map((item, index) => (
                                        <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid xs={12} md={5}>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                            {t('product')}
                                                        </Typography>
                                                        {item.product ? (
                                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                {item.product.title}
                                                            </Typography>
                                                        ) : (
                                                            <RHFAutocomplete
                                                                name={`items.${index}.product`}
                                                                label={t('select_product')}
                                                                placeholder={t('product_search_placeholder')}
                                                                options={products}
                                                                noOptionsText={t('product_search_min_chars')}
                                                                getOptionLabel={(option) =>
                                                                    typeof option === 'object' ? option.title : option
                                                                }
                                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                                onChange={(event, newValue) => updateItem(index, 'product', newValue)}
                                                                onInputChange={(event, newInputValue) => {
                                                                    handleProductSearch(newInputValue);
                                                                }}
                                                            />
                                                        )}
                                                        {item.product && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {t('ean')}: {item.product.ean} | {t('price')}: €{item.product.price_per_unit}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                <Grid xs={6} md={2}>
                                                    <RHFTextField
                                                        name={`items.${index}.quantity`}
                                                        label={t('quantity')}
                                                        type="number"
                                                        value={item.quantity === 0 ? '' : item.quantity}
                                                        onChange={(event) => {
                                                            const value = event.target.value === '' ? 0 : parseInt(event.target.value);
                                                            updateItem(index, 'quantity', isNaN(value) ? 0 : value);
                                                        }}
                                                        inputProps={{ step: 1 }}
                                                    />
                                                </Grid>
                                                <Grid xs={6} md={2}>
                                                    <RHFTextField
                                                        name={`items.${index}.price`}
                                                        label={t('price_euro')}
                                                        type="number"
                                                        value={item.price === 0 ? '' : item.price}
                                                        onChange={(event) => {
                                                            const value = event.target.value === '' ? 0 : parseFloat(event.target.value);
                                                            updateItem(index, 'price', isNaN(value) ? 0 : value);
                                                        }}
                                                        inputProps={{ step: 0.01 }}
                                                    />
                                                </Grid>
                                                <Grid xs={6} md={1.5}>
                                                    <RHFSelect
                                                        name={`items.${index}.vat_rate`}
                                                        label={t('vat_rate')}
                                                        value={item.vat_rate}
                                                        onChange={(event) => updateItem(index, 'vat_rate', parseInt(event.target.value))}
                                                        size="small"
                                                    >
                                                        <MenuItem value={0}>0%</MenuItem>
                                                        <MenuItem value={9}>9%</MenuItem>
                                                        <MenuItem value={21}>21%</MenuItem>
                                                    </RHFSelect>
                                                </Grid>
                                                <Grid xs={6} md={1.5}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {t('total_excl_vat')}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            €{(item.quantity * item.price).toFixed(2)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {t('total_incl_vat')}
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            €{(item.quantity * item.price * (1 + item.vat_rate / 100)).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid xs={6} md={1}>
                                                    <Button
                                                        color="error"
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => removeItem(index)}
                                                        sx={{ minWidth: 'auto', px: 1 }}
                                                    >
                                                        ×
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))
                                )}
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        {t('subtotal')} (excl. BTW): €{calculateSubtotal().toFixed(2)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        BTW: €{calculateVAT().toFixed(2)}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {t('total')} (incl. BTW): €{calculateTotal().toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    )}
                </Grid>

                <Grid xs={12} md={4}>
                    {/* <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Shipping Address
                        </Typography>

                        <Stack spacing={3}>
                            <RHFTextField name="shipping_address.street_name" label="Street Name" />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <RHFTextField name="shipping_address.house_number" label="House Number" />
                                <RHFTextField name="shipping_address.house_suffix" label="Suffix" />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <RHFTextField name="shipping_address.zip_code" label="Zip Code" />
                                <RHFTextField name="shipping_address.city" label="City" />
                            </Box>
                            <RHFSelect name="shipping_address.country" label="Country">
                                <MenuItem value="NL">Netherlands</MenuItem>
                                <MenuItem value="BE">Belgium</MenuItem>
                                <MenuItem value="DE">Germany</MenuItem>
                                <MenuItem value="FR">France</MenuItem>
                            </RHFSelect>
                            <RHFTextField name="shipping_address.phone_number" label="Phone Number" />
                        </Stack>
                    </Card> */}

                    <Card sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            {t('order_summary')}
                        </Typography>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">{t('subtotal')} (excl. BTW):</Typography>
                                <Typography variant="body1">
                                    €{calculateSubtotal().toFixed(2)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">BTW:</Typography>
                                <Typography variant="body1">
                                    €{calculateVAT().toFixed(2)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">{t('discount')}:</Typography>
                                <RHFTextField
                                    name="discount"
                                    size="small"
                                    type="number"
                                    inputProps={{ step: 0.01 }}
                                    sx={{ width: '100px' }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">{t('shipping')}:</Typography>
                                <RHFTextField
                                    name="shipping"
                                    size="small"
                                    type="number"
                                    inputProps={{ step: 0.01 }}
                                    sx={{ width: '100px' }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">{t('taxes')}:</Typography>
                                <RHFTextField
                                    name="taxes"
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={{ width: '100px' }}
                                />
                            </Box>

                            <Divider />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('total')} (incl. BTW):</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    €{calculateTotal().toFixed(2)}
                                </Typography>
                            </Box>

                            <RHFTextField
                                name="total"
                                type="hidden"
                                sx={{ display: 'none' }}
                            />
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={loading}
                    size="large"
                >
                    {t('create_order')}
                </LoadingButton>

                <LoadingButton
                    variant="outlined"
                    loading={loading}
                    size="large"
                    onClick={onSubmitOffer}
                    sx={{
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        '&:hover': {
                            borderColor: 'warning.dark',
                            backgroundColor: 'warning.light',
                            color: 'warning.dark'
                        }
                    }}
                >
                    {t('create_offer')}
                </LoadingButton>

                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push(paths.dashboard.order.root)}
                >
                    {t('cancel')}
                </Button>
            </Stack>
        </FormProvider>
    );
} 