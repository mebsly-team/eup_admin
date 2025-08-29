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

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');

    const NewOrderSchema = Yup.object().shape({
        // customer: Yup.mixed().required('Customer is required'),
        // status: Yup.string().required('Status is required'),
        // shipping_method: Yup.string().required('Shipping method is required'),
        // payment_method: Yup.string().required('Payment method is required'),
        // items: Yup.array().min(1, 'At least one item is required'),
        // shipping_address: Yup.object().shape({
        //     street_name: Yup.string().required('Street name is required'),
        //     house_number: Yup.string().required('House number is required'),
        //     zip_code: Yup.string().required('Zip code is required'),
        //     city: Yup.string().required('City is required'),
        //     country: Yup.string().required('Country is required'),
        //     phone_number: Yup.string().required('Phone number is required'),
        // }),
        // notes: Yup.string(),
        // eanSearch: Yup.string(),
    });

    const defaultValues = {
        customer: currentOrder?.customer || null,
        status: currentOrder?.status || 'pending_order',
        shipping_method: '',
        payment_method: '',
        items: currentOrder?.items || [
            {
                product: null,
                quantity: 1,
                price: 0,
            },
        ],
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
        discount: currentOrder?.discount || 0,
        shipping: currentOrder?.shipping || 0,
        taxes: currentOrder?.taxes || 0,
    };

    const methods = useForm({
        resolver: yupResolver(NewOrderSchema),
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

    const watchedItems = watch('items');

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const fetchCustomers = async (searchTerm = '') => {
        try {
            const searchParam = searchTerm ? `&search=${searchTerm}` : '';
            const { data } = await axiosInstance.get(`/users/?${searchParam}`);
            console.log('Fetched customers:', data);

            // Handle different response formats
            let customers = [];
            if (Array.isArray(data)) {
                customers = data;
            } else if (data.results && Array.isArray(data.results)) {
                customers = data.results;
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Single user object returned
                customers = [data];
            }

            setCustomers(customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleCustomerSearch = async (searchTerm: string) => {
        setCustomerSearchTerm(searchTerm);
        if (searchTerm.length >= 2) {
            await fetchCustomers(searchTerm);
        } else if (searchTerm.length === 0) {
            await fetchCustomers();
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axiosInstance.get('/products/');
            setProducts(data.results || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleEanSearch = async () => {
        const eanValue = getValues('eanSearch');
        if (!eanValue) return;

        try {
            const response = await axiosInstance.get(`/products/?ean=${eanValue}`);
            if (response.status === 200) {
                const products = response.data;
                if (Array.isArray(products) && products.length > 0) {
                    const newItems = products.map((product) => ({
                        product,
                        quantity: 1,
                        price: product.price_per_unit || 0,
                    }));

                    const currentItems = watch('items');
                    setValue('items', [...currentItems, ...newItems]);
                    setValue('eanSearch', '');
                    enqueueSnackbar(`${products.length} product(s) added to order`);
                } else {
                    enqueueSnackbar('No products found with this EAN', { variant: 'warning' });
                }
            }
        } catch (error) {
            console.error('Error searching by EAN:', error);
            enqueueSnackbar('Error searching by EAN', { variant: 'error' });
        }
    };

    const onSubmit = handleSubmit(async (data) => {
        console.log("🚀 ~ OrderNewEditForm ~ data:", data)
        setLoading(true);
        try {
            const orderData = {
                "user_id": data.customer.id,
                "sub_total": data.total,
                "total": data.total,
                "cart": {
                    "items": []
                },
                "shipping_address": {},
                "invoice_address": {},
                "delivery_details": {},
                "history": []
            };

            await axiosInstance.post('/orders/', orderData);

            enqueueSnackbar('Order created successfully!');
            router.push(paths.dashboard.order.root);
        } catch (error) {
            console.error('Error creating order:', error);
            enqueueSnackbar('Error creating order', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    });

    const addItem = () => {
        const currentItems = watch('items');
        setValue('items', [
            ...currentItems,
            {
                product: null,
                quantity: 1,
                price: 0,
            },
        ]);
    };

    const removeItem = (index: number) => {
        const currentItems = watch('items');
        const newItems = currentItems.filter((_, i) => i !== index);
        setValue('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const currentItems = watch('items');
        const updatedItems = [...currentItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setValue('items', updatedItems);
    };

    const calculateTotal = () => {
        const items = watch('items');
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const discount = watch('discount') || 0;
        const shipping = watch('shipping') || 0;
        const taxes = watch('taxes') || 0;
        return subtotal - discount + shipping + taxes;
    };

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid xs={12} md={8}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Order Information
                        </Typography>

                        <Stack spacing={3}>
                            <RHFAutocomplete
                                name="customer"
                                label="Customer"
                                placeholder="Search by name, email, business name, or relation code"
                                options={customers}
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
                                            const email = (option.email || '').toLowerCase();
                                            const businessName = (option.business_name || '').toLowerCase();
                                            const relationCode = (option.relation_code || '').toLowerCase();

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

                    {/* <Card sx={{ p: 3, mt: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Order Items</Typography>
                            <Button variant="outlined" onClick={addItem}>
                                Add Item
                            </Button>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid xs={12} md={8}>
                                    <RHFTextField
                                        name="eanSearch"
                                        label="Search by EAN"
                                        placeholder="Enter EAN code to search products"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleEanSearch();
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid xs={12} md={4}>
                                    <Button
                                        variant="contained"
                                        onClick={handleEanSearch}
                                        sx={{ mt: 1 }}
                                        fullWidth
                                    >
                                        Search & Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        <Stack spacing={2}>
                            {watchedItems.map((item, index) => (
                                <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid xs={12} md={6}>
                                            <RHFAutocomplete
                                                name={`items.${index}.product`}
                                                label="Product"
                                                options={products}
                                                getOptionLabel={(option) =>
                                                    typeof option === 'object' ? option.name : option
                                                }
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                onChange={(event, newValue) => updateItem(index, 'product', newValue)}
                                            />
                                        </Grid>
                                        <Grid xs={6} md={2}>
                                            <RHFTextField
                                                name={`items.${index}.quantity`}
                                                label="Quantity"
                                                type="number"
                                                onChange={(event) => updateItem(index, 'quantity', parseInt(event.target.value) || 0)}
                                            />
                                        </Grid>
                                        <Grid xs={6} md={2}>
                                            <RHFTextField
                                                name={`items.${index}.price`}
                                                label="Price"
                                                type="number"
                                                onChange={(event) => updateItem(index, 'price', parseFloat(event.target.value) || 0)}
                                            />
                                        </Grid>
                                        <Grid xs={12} md={1}>
                                            <Typography variant="body2">
                                                €{(item.quantity * item.price).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                        <Grid xs={12} md={1}>
                                            <Button
                                                color="error"
                                                onClick={() => removeItem(index)}
                                                disabled={watchedItems.length === 1}
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid>

                <Grid xs={12} md={4}> */}
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

                        <Stack spacing={2}>


                            <Divider />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <RHFTextField name="total" label="Total" type="number" />
                            </Box>
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
                    Create Order
                </LoadingButton>

                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push(paths.dashboard.order.root)}
                >
                    Cancel
                </Button>
            </Stack>
        </FormProvider>
    );
} 