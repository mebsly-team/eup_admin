/* eslint-disable no-nested-ternary */
import * as Yup from 'yup';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import 'yet-another-react-lightbox/styles.css';
import Lightbox from 'yet-another-react-lightbox';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Link, alpha, MenuItem, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { countries } from 'src/assets/data';
import { HOST_API, IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery';
import CountrySelect from 'src/components/country-select';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, {
  RHFEditor,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { CategorySelector } from 'src/sections/category/CategorySelector';

import { IProductItem } from 'src/types/product';

import Rating from './Rating';
import ProductVariantForm from './product-variant-form';

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};

function updateQueryParams(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
}
export default function ProductNewEditForm({ currentProduct }: Props) {
  console.log('currentProduct', currentProduct);
  const router = useRouter();
  const location = useLocation();
  const isNewProduct = location?.pathname?.includes('/new');
  let activeAction = '';
  const [results, setResults] = useState({
    singleLayer: [],
    fullPallet: [],
  });

  // Now you can access query parameters from the location object
  const queryParams = new URLSearchParams(location.search);
  const tab = Number(queryParams.get('tab') || 0);
  const [openLightBox, setOpenLightBox] = useState(false);
  const [lightBoxSlides, setLightBoxSlides] = useState();

  const handleLightBoxSlides = useCallback((images) => {
    if (images.length) {
      setOpenLightBox(true);
      const slides = images.map((img) => ({
        src: `${IMAGE_FOLDER_PATH}${img}`,
      }));
      setLightBoxSlides(slides);
    }
  }, []);
  const mdUp = useResponsive('up', 'md');
  const { t, onChangeLang } = useTranslate();
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(tab || 0);
  const [openDialogCategory, setOpenDialogCategory] = useState(false);
  const [isBrandEdit, setBrandEdit] = useState(false);
  const [isDeleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [parentProduct, setParentProduct] = useState({});
  const [isSupplierEdit, setSupplierEdit] = useState(false);
  const parent_price_per_piece = Number(currentProduct?.parent_price_per_piece || 0);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const getParentProduct = async () => {
    try {
      const response = await axiosInstance.get(`/products/${currentProduct?.parent_product}/`);
      setParentProduct(response?.data);
    } catch (error) {
      setParentProduct({});
    }
  };

  useEffect(() => {
    if (currentProduct?.parent_product) {
      getParentProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct?.parent_product]);

  const getAllSuppliers = async () => {
    const { data } = await axiosInstance.get(`/suppliers/`);
    setSupplierList(data || []);
  };
  const getAllBrands = async () => {
    const { data } = await axiosInstance.get(`/brands/`);
    setBrandList(data || []);
  };

  const DELIVERY_CHOICES = [
    { value: '0', label: t('delivery_choice_0') },
    { value: '1', label: t('delivery_choice_1') },
    { value: '2', label: t('delivery_choice_2') },
    { value: '3', label: t('delivery_choice_3') },
  ];

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required(t('required')),
    price_per_piece: Yup.number()
      .when('min_price_to_sell', (min_price_to_sell, schema) =>
        min_price_to_sell ? schema.moreThan(min_price_to_sell, `min: ${min_price_to_sell}`) : schema
      )
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    quantity_per_unit: Yup.number().required(t('required')),
    variant_discount: Yup.number().test(
      'is-decimal',
      t('Max. 2 decimale posities'),
      (value) =>
        value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
    ),
    price_per_unit: Yup.number()
      .required(t('required'))
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    price_consumers: Yup.number()
      .required(t('required'))
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    price_cost: Yup.number()
      .required(t('required'))
      .test(
        'is-decimal',
        t('Max. 4 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,4})?$/.test(value.toString())
      ),
    vat: Yup.number().required(t('required')),

    overall_stock: Yup.number().required(t('required')),
    free_stock: Yup.number().required(t('required')),
    ordered_in_progress_stock: Yup.number().required(t('required')),

    number_in_order: Yup.number().required(t('required')),
    number_in_offer: Yup.number().required(t('required')),
    number_in_pakbon: Yup.number().required(t('required')),
    number_in_confirmation: Yup.number().required(t('required')),
    number_in_werkbon: Yup.number().required(t('required')),
    number_in_other: Yup.number().required(t('required')),

    order_unit_amount: Yup.number().required(t('required')),
    min_order_amount: Yup.number().required(t('required')),
    min_stock_value: Yup.number().required(t('required')),
    max_stock_at_rack: Yup.number().required(t('required')),

    stock_at_supplier: Yup.number().required(t('required')),

    max_order_allowed_per_unit: Yup.number().required(t('required')),

    sell_count: Yup.number().required(t('required')),

    size_x_value: Yup.string()
      .nullable()
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    size_y_value: Yup.string()
      .nullable()
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    liter: Yup.string()
      .nullable()
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    liter_unit: Yup.string().nullable(),

    size_z_value: Yup.string()
      .nullable()
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    size_unit: Yup.string().nullable(),
    weight: Yup.number()
      .nullable()
      .test(
        'is-decimal',
        t('Max. 2 decimale posities'),
        (value) =>
          value === undefined || value === null || /^[0-9]+(\.[0-9]{1,2})?$/.test(value.toString())
      ),
    weight_unit: Yup.string().nullable(),
    volume_unit: Yup.string().nullable(),
    volume: Yup.string().nullable(),
    pallet_full_total_number: Yup.number().required(t('required')),
    pallet_layer_total_number: Yup.number().required(t('required')),

    inhoud_number: Yup.number().required(t('required')),
  });

  const defaultValues = useMemo(
    () => ({
      is_variant: currentProduct?.is_variant,
      unit: currentProduct?.unit,
      color: currentProduct?.color || '',
      size: currentProduct?.size,
      variants: currentProduct?.variants,
      title: currentProduct?.title || '',
      title_long: currentProduct?.title_long || '',
      // description: currentProduct?.description || '',
      parent_product: currentProduct?.parent_product || '',
      min_price_to_sell: currentProduct?.min_price_to_sell || '',
      ean: currentProduct?.ean || '',
      article_code: currentProduct?.article_code || '',
      sku: currentProduct?.sku || '',
      hs_code: currentProduct?.hs_code || '',
      chip: currentProduct?.chip || '',
      supplier_article_code: currentProduct?.supplier_article_code || '',
      categories: currentProduct?.categories || [],
      brand: currentProduct?.brand || null,
      supplier: currentProduct?.supplier || null,
      // tags: currentProduct?.tags || [],
      images: currentProduct?.images || [],
      quantity_per_unit: currentProduct?.quantity_per_unit || 0,
      variant_discount: currentProduct?.variant_discount || 0,
      price_per_piece: currentProduct?.price_per_piece || 0,
      price_per_unit: currentProduct?.price_per_unit || 0,
      price_consumers: currentProduct?.price_consumers || 0,
      price_cost: currentProduct?.price_cost || 0,
      vat: Number(currentProduct?.vat || 0),
      expiry_date: currentProduct?.expiry_date || null,
      has_no_expiry_date: !currentProduct?.expiry_date,
      comm_channel_after_out_of_stock: currentProduct?.comm_channel_after_out_of_stock || 'all',

      overall_stock: currentProduct?.is_variant
        ? Math.floor(
            Number(parentProduct?.overall_stock || 0) / Number(currentProduct?.quantity_per_unit)
          )
        : currentProduct?.overall_stock || 0, // # Huidege Voorraad
      free_stock: currentProduct?.is_variant
        ? Math.floor(
            Number(parentProduct?.free_stock || 0) / Number(currentProduct?.quantity_per_unit)
          )
        : currentProduct?.free_stock || 0, // # Vrije Voorraad
      ordered_in_progress_stock: currentProduct?.ordered_in_progress_stock || 0, // # Voorraad Aantal in bestelling

      number_in_order: currentProduct?.number_in_order || 0, // Aantal in order
      number_in_offer: currentProduct?.number_in_offer || 0, // Aantal in offerte
      number_in_pakbon: currentProduct?.number_in_pakbon || 0, // Aantal in pakbon
      number_in_confirmation: currentProduct?.number_in_confirmation || 0, // Aantal in bevestiging
      number_in_werkbon: currentProduct?.number_in_werkbon || 0, //  Aantal in werkbon
      number_in_other: currentProduct?.number_in_other || 0, // Aantal in anders

      order_unit_amount: currentProduct?.order_unit_amount || 0, // Bestellenheid
      min_order_amount: currentProduct?.min_order_amount || 0, //  Minimum bestelaantal
      min_stock_value: currentProduct?.is_variant
        ? Math.floor(
            Number(parentProduct?.min_stock_value || 0) / Number(currentProduct?.quantity_per_unit)
          )
        : currentProduct?.min_stock_value || 0, // minimumvoorraad
      max_stock_at_rack: currentProduct?.is_variant
        ? Math.floor(
            Number(parentProduct?.max_stock_at_rack || 0) /
              Number(currentProduct?.quantity_per_unit)
          )
        : currentProduct?.max_stock_at_rack || 0, // Geweenste voorraad
      stock_check: currentProduct?.stock_check || false, // voorraadcontrole

      stock_at_supplier: currentProduct?.stock_at_supplier || 0,
      location: currentProduct?.location || '',
      extra_location: currentProduct?.extra_location || '',
      /* stock_alert_value: currentProduct?.stock_alert_value || '',
      stock_alert: currentProduct?.stock_alert || false,
      stock_disable_when_sold_out: currentProduct?.stock_disable_when_sold_out || false,
      */
      max_order_allowed_per_unit: currentProduct?.max_order_allowed_per_unit || 0, // max verkoopaantal
      delivery_time: currentProduct?.delivery_time || '',
      important_information: currentProduct?.important_information || '',
      extra_etiket_nl: currentProduct?.extra_etiket_nl || '',
      extra_etiket_fr: currentProduct?.extra_etiket_fr || '',
      languages_on_item_package: currentProduct?.languages_on_item_package || [],
      sell_count: currentProduct?.is_variant
        ? Math.floor(
            Number(parentProduct?.sell_count || 0) / Number(currentProduct?.quantity_per_unit)
          )
        : currentProduct?.sell_count || 0,
      is_only_for_logged_in_user: currentProduct?.is_only_for_logged_in_user || false,
      is_used: currentProduct?.is_used || false,
      is_regular: currentProduct?.is_regular ?? true,
      is_featured: currentProduct?.is_featured || false,
      is_only_for_export: currentProduct?.is_only_for_export || false,
      // is_only_for_B2B: currentProduct?.is_only_for_B2B || false,
      is_listed_on_marktplaats: currentProduct?.is_listed_on_marktplaats || false,
      is_listed_on_2dehands: currentProduct?.is_listed_on_2dehands || false,
      has_electronic_barcode: currentProduct?.has_electronic_barcode || false,
      size_x_value: currentProduct?.size_x_value || 0,
      size_y_value: currentProduct?.size_y_value || 0,
      pallet_x_value: 120,
      pallet_y_value: 80,
      pallet_z_value: 144,
      pallet_max_weight_value: 400,
      liter: currentProduct?.liter || 0,
      liter_unit: currentProduct?.liter_unit || '',
      is_clearance: currentProduct?.is_clearance || false,
      is_party_sale: currentProduct?.is_party_sale || false,
      sell_from_supplier: currentProduct?.sell_from_supplier || false,
      is_taken_from_another_package: currentProduct?.is_taken_from_another_package || false,
      size_z_value: currentProduct?.size_z_value || 0,
      size_unit: currentProduct?.size_unit || '',
      weight: currentProduct?.weight || 0,
      weight_unit: currentProduct?.weight_unit || '',
      volume_unit: currentProduct?.volume_unit || '',
      volume: currentProduct?.volume || '',
      pallet_full_total_number: currentProduct?.pallet_full_total_number || 0,
      pallet_layer_total_number: currentProduct?.pallet_layer_total_number || 0,
      is_brief_box: currentProduct?.is_brief_box || false,
      meta_title: currentProduct?.meta_title || '',
      meta_description: currentProduct?.meta_description || '',
      meta_keywords: currentProduct?.meta_keywords || '',
      url: currentProduct?.url || '',
      is_visible_particular: currentProduct?.is_visible_particular,
      is_visible_B2B: currentProduct?.is_visible_B2B,

      inhoud_number: currentProduct?.inhoud_number || 1,
      inhoud_unit: currentProduct?.inhoud_unit || '',
      inhoud_price: currentProduct?.inhoud_price || 0,
    }),
    [currentProduct, parentProduct]
  );
  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting, isDirty, errors, ...rest2 },
    ...rest
  } = methods;
  const values = watch();
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  const handleEmptyNumbers = (event) => {
    const { value } = event.target;
    if (value === '' || value === null) {
      setValue(event.target.name, 0);
    }
  };

  const getLocalSavedData = () => {
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData) {
      methods.reset(savedData); // Reset form with saved data
    }
  };

  useEffect(() => {
    const calculateVolume = () => {
      const size_unit = watch('size_unit');
      const weightUnit = watch('weight_unit');
      const sizeX = convertSizeToCm(parseFloat(watch('size_x_value') || 0), size_unit);
      const sizeY = convertSizeToCm(parseFloat(watch('size_y_value') || 0), watch('size_unit'));
      const sizeZ = convertSizeToCm(parseFloat(watch('size_z_value') || 0), watch('size_unit'));
      const weight = convertWeightToKg(parseFloat(watch('weight') || 0), weightUnit);

      let calculatedVolume = 0;
      let calculatedVolumeUnit = '';
      let isBriefBox = true;

      if (size_unit === 'mm') {
        calculatedVolume = (sizeX * sizeY * sizeZ) / 1000000; // Conversion from mm^3 to cm^3
        calculatedVolumeUnit = 'cm^3';
        isBriefBox =
          sizeX <= 264 &&
          sizeY <= 380 &&
          sizeZ <= 32 &&
          (weightUnit === 'kg' ? weight <= 1 : weight <= 1000);
      } else if (size_unit === 'cm') {
        calculatedVolume = sizeX * sizeY * sizeZ;
        calculatedVolumeUnit = 'cm^3';
        isBriefBox =
          sizeX <= 26.4 &&
          sizeY <= 38 &&
          sizeZ <= 3.2 &&
          (weightUnit === 'kg' ? weight <= 1 : weight <= 1000);
      } else if (size_unit === 'm') {
        calculatedVolume = sizeX * sizeY * sizeZ;
        calculatedVolumeUnit = 'm^3';
        isBriefBox =
          sizeX <= 0.264 &&
          sizeY <= 0.38 &&
          sizeZ <= 0.32 &&
          (weightUnit === 'kg' ? weight <= 1 : weight <= 1000);
      }

      setValue('volume', roundUp(calculatedVolume)); // Setting the calculated volume in the form
      setValue('volume_unit', calculatedVolumeUnit); // Setting the calculated volume unit
      setValue('is_brief_box', isBriefBox); // Setting is_brief_box based on size and weight

      const orientations = [
        { name: 'Normaal', x: sizeX, y: sizeY, z: sizeZ },
        { name: 'Zijkant', x: sizeY, y: sizeX, z: sizeZ },
      ];
      // Hem tek katman hem de tam dolu palet için en fazla ürün sayısını bulma
      let max_items_single_layer = 0;
      let best_orientation_single_layer = '';
      let max_items_full_pallet = 0;
      let best_orientation_full_pallet = '';
      const tmpResult = {
        singleLayer: [],
        fullPallet: [],
      };
      orientations.forEach((orientation) => {
        const items_per_layer_x = Math.floor(watch('pallet_x_value') / orientation.x);
        const items_per_layer_y = Math.floor(watch('pallet_y_value') / orientation.y);
        const items_per_layer = items_per_layer_x * items_per_layer_y;

        // Tek katman (layer) için hesaplama
        const total_items_single_layer = items_per_layer;
        const total_weight_single_layer = total_items_single_layer * weight;
        if (total_weight_single_layer <= watch('pallet_max_weight_value')) {
          tmpResult?.singleLayer.push({
            orientation: orientation.name,
            total: total_items_single_layer,
            weight: total_weight_single_layer,
          });

          if (total_items_single_layer > max_items_single_layer) {
            max_items_single_layer = total_items_single_layer;
            best_orientation_single_layer = orientation.name;
          }
        }

        // Tam dolu palet (çok katmanlı) için hesaplama
        const layers_by_height = Math.floor(watch('pallet_z_value') / orientation.z);
        const max_weight_per_layer = Math.floor(
          watch('pallet_max_weight_value') / (items_per_layer * weight)
        );
        const layers_by_weight = Math.floor(max_weight_per_layer);
        const layers = Math.min(layers_by_height, layers_by_weight);
        console.log('layers', layers);

        const total_items_full_pallet = items_per_layer * layers;
        const total_weight_full_pallet = total_items_full_pallet * weight;

        if (total_weight_full_pallet <= watch('pallet_max_weight_value')) {
          tmpResult.fullPallet.push({
            orientation: orientation.name,
            total: total_items_full_pallet,
            weight: total_weight_full_pallet,
          });

          if (total_items_full_pallet > max_items_full_pallet) {
            max_items_full_pallet = total_items_full_pallet;
            best_orientation_full_pallet = orientation.name;
          }
        }
      });
      setResults(tmpResult);
    };

    calculateVolume();
  }, [
    watch('size_unit'),
    watch('size_x_value'),
    watch('size_y_value'),
    watch('size_z_value'),
    watch('weight'),
    watch('weight_unit'),
    watch('pallet_x_value'),
    watch('pallet_y_value'),
    watch('pallet_z_value'),
    watch('pallet_max_weight_value'),
  ]);

  useEffect(() => {
    setValue('meta_title', `${watch('title')} EAN:${watch('ean')}`);
    setValue('meta_description', `${watch('title_long')} EAN:${watch('ean')}`);
  }, [watch('title'), watch('title_long'), watch('ean')]);

  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  console.log('getValues', getValues());

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('handleSubmit data', data);
    localStorage.setItem('formData', JSON.stringify(data));
    try {
      const ex_date = data.expiry_date ? format(new Date(data.expiry_date), 'yyyy-MM-dd') : null;
      data.expiry_date = ex_date;
      data.tags = [];
      data.brand = typeof data.brand === 'object' ? data.brand?.id : data.brand;
      data.supplier = typeof data.supplier === 'object' ? data.supplier?.id : data.supplier;
      data.categories = data.categories.map((item) => item?.id);
      let response;
      if (currentProduct?.id) {
        response = await axiosInstance.put(`/products/${currentProduct.id}/`, data);
      } else {
        response = await axiosInstance.post('/products/', data);
      }
      const responseData = response.data; // Assuming the response contains updated data
      // Update the form data with the new data
      methods.reset(responseData); // Assuming methods.reset updates the form data
      localStorage.removeItem('formData');
      enqueueSnackbar(currentProduct ? t('update_success') : t('create_success'));

      if (activeAction === 'save_stay') {
        // Do nothing, stay on the same page
      } else if (activeAction === 'save_back') {
        if (currentProduct?.is_variant)
          router.push(`/dashboard/product/${currentProduct?.parent_product}/edit?tab=1`);
        else router.back();
      }
    } catch (error) {
      console.log('error', error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages?.forEach((errorMessage) => {
          console.error(errorMessage);
          enqueueSnackbar({ variant: 'error', message: errorMessage });
        });
      } else if (typeof error === 'object') {
        const errorMessages = Object.entries(error);
        if (errorMessages.length) {
          errorMessages.forEach(([fieldName, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach((errorMsg) => {
                enqueueSnackbar({
                  variant: 'error',
                  message: `${t(fieldName)}: ${errorMsg}`,
                });
              });
            } else {
              enqueueSnackbar({
                variant: 'error',
                message: `${t(fieldName)}: ${errors}`,
              });
            }
          });
        } else {
          console.error('An unexpected error occurred:', error);
          enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
        }
      }
    }
  });

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      try {
        const { data } = await axiosInstance.delete(`/products/${id}/`);
        enqueueSnackbar(t('delete_success'));
        router.push(paths.dashboard.product.root);
      } catch (error) {
        enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
      }
    },
    [enqueueSnackbar, router, t]
  );

  const renderTabs = (
    <Tabs
      value={activeTab}
      onChange={(e) => {
        setActiveTab(Number(e.target.id));
        updateQueryParams('tab', Number(e.target.id));
      }}
      sx={{
        px: 2.5,
        boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
      }}
    >
      <Tab iconPosition="end" id={0} value={0} label={t('main_product')} />
      <Tab
        iconPosition="end"
        id={1}
        value={1}
        label={`${t('variants')}`}
        disabled={!currentProduct}
      />
    </Tabs>
  );

  // const handleImportMainProduct = async () => {
  //   if (currentProduct?.parent_product) {
  //     const response = await axiosInstance.get(`/products/${currentProduct?.parent_product}/`);
  //     const {
  //       title,
  //       images,
  //       hs_code,
  //       has_electronic_barcode,
  //       sku,
  //       brand,
  //       supplier,
  //       is_only_for_logged_in_user,
  //       is_used,
  //       location,
  //       categories,
  //       ...copyData
  //     } = {
  //       ...response?.data,
  //     };
  //     if (['box', 'pallet_layer', 'pallet_full'].includes(copyData?.unit)) {
  //       delete copyData.quantity_per_unit;
  //       delete copyData.price_per_unit;
  //       delete copyData.max_order_allowed_per_unit;
  //       delete copyData.order_unit_amount;
  //       delete copyData.min_order_amount;
  //       delete copyData.min_stock_value;
  //       delete copyData.max_stock_at_rack;
  //       delete copyData.price_per_piece;
  //       delete copyData.price_consumers;
  //       delete copyData.price_cost;
  //       delete copyData.size_unit;
  //       delete copyData.size_x_value;
  //       delete copyData.size_y_value;
  //       delete copyData.size_z_value;
  //       delete copyData.volume_unit;
  //       delete copyData.liter;
  //       delete copyData.pallet_layer_total_number;
  //       delete copyData.weight;
  //       delete copyData.pallet_full_total_number;
  //       delete copyData.is_brief_box;
  //     }
  //     if (!['pallet_layer', 'pallet_full'].includes(copyData?.unit)) {
  //       delete copyData.ean;
  //       delete copyData.article_code;
  //     }
  //     reset({
  //       title: getValues('title'),
  //       ean: getValues('ean'),
  //       article_code: getValues('article_code'),
  //       hs_code: getValues('hs_code'),
  //       sku: getValues('sku'),
  //       supplier,
  //       brand,
  //       categories: categories || [],
  //       ...copyData,
  //     });
  //   }
  // };

  const handleBrandEditClick = () => {
    getAllBrands();
    setBrandEdit(true);
  };
  const handleSupplierEditClick = () => {
    getAllSuppliers();
    setSupplierEdit(true);
  };
  const renderDetails = (
    <Grid xs={12}>
      <Card>
        <Box>
          {localStorage.getItem('formData') && (
            <Typography
              fontSize="14px"
              color="blue"
              sx={{ px: 3, pt: 2, cursor: 'pointer', display: 'block' }}
              onClick={getLocalSavedData}
            >
              {t('import_data_from_local_storage')}
            </Typography>
          )}
        </Box>
        {/* {currentProduct?.is_variant && (
          <Typography
            fontSize="14px"
            color="blue"
            sx={{ px: 3, pt: 2, cursor: 'pointer', float: 'right' }}
            onClick={handleImportMainProduct}
          >
            {t('import_data_from_main_product')}
          </Typography>
        )} */}
        <CardHeader title={t('basic_information')} />

        <Stack spacing={1} sx={{ p: 3 }}>
          {/* <RHFTextField name="parent_product" label={t('parent_product')} /> */}
          <Box
            columnGap={2}
            rowGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            <RHFTextField name="article_code" label={t('article_code')} labelColor="violet" />
            <RHFTextField name="ean" label={t('ean')} labelColor="violet" />
            <RHFTextField name="sku" label={t('sku')} />
            <RHFTextField name="hs_code" label={t('hs_code')} />
            <RHFSelect name="unit" label={t('unit')} labelColor="violet">
              <MenuItem value="piece">{t('piece')}</MenuItem>
              <MenuItem value="package">{t('package')}</MenuItem>
              <MenuItem value="rol">{t('rol')}</MenuItem>
              <MenuItem value="box">{t('box')}</MenuItem>
              {currentProduct?.is_variant && (
                <MenuItem value="pallet_layer">{t('pallet_layer')}</MenuItem>
              )}
              {currentProduct?.is_variant && (
                <MenuItem value="pallet_full">{t('pallet_full')}</MenuItem>
              )}
            </RHFSelect>

            <RHFSelect name="color" label={t('color')}>
              <MenuItem value="red">{t('red')}</MenuItem>
              <MenuItem value="blue">{t('blue')}</MenuItem>
              <MenuItem value="green">{t('green')}</MenuItem>
              <MenuItem value="yellow">{t('yellow')}</MenuItem>
              <MenuItem value="brown">{t('brown')}</MenuItem>
              <MenuItem value="pink">{t('pink')}</MenuItem>
              <MenuItem value="purple">{t('purple')}</MenuItem>
              <MenuItem value="black">{t('black')}</MenuItem>
              <MenuItem value="white">{t('white')}</MenuItem>
              <MenuItem value="orange">{t('orange')}</MenuItem>
              <MenuItem value="gray">{t('gray')}</MenuItem>
              <MenuItem value="cyan">{t('cyan')}</MenuItem>
              <MenuItem value="magenta">{t('magenta')}</MenuItem>
              <MenuItem value="turquoise">{t('turquoise')}</MenuItem>
              <MenuItem value="gold">{t('gold')}</MenuItem>
              <MenuItem value="silver">{t('silver')}</MenuItem>
              <MenuItem value="lavender">{t('lavender')}</MenuItem>
              <MenuItem value="maroon">{t('maroon')}</MenuItem>
              <MenuItem value="teal">{t('teal')}</MenuItem>
              <MenuItem value="navy">{t('navy')}</MenuItem>
              <MenuItem value="indigo">{t('indigo')}</MenuItem>
              <MenuItem value="olive">{t('olive')}</MenuItem>
              <MenuItem value="salmon">{t('salmon')}</MenuItem>
              <MenuItem value="peach">{t('peach')}</MenuItem>
              <MenuItem value="violet">{t('violet')}</MenuItem>
              <MenuItem value="coral">{t('coral')}</MenuItem>
              <MenuItem value="lime">{t('lime')}</MenuItem>
              <MenuItem value="beige">{t('beige')}</MenuItem>
              <MenuItem value="khaki">{t('khaki')}</MenuItem>
              <MenuItem value="azure">{t('azure')}</MenuItem>
              <MenuItem value="orchid">{t('orchid')}</MenuItem>
              <MenuItem value="crimson">{t('crimson')}</MenuItem>
              <MenuItem value="fuchsia">{t('fuchsia')}</MenuItem>
              <MenuItem value="ivory">{t('ivory')}</MenuItem>
              <MenuItem value="tan">{t('tan')}</MenuItem>
              <MenuItem value="mint">{t('mint')}</MenuItem>
            </RHFSelect>

            <RHFTextField name="size" label={t('variant')} />
          </Box>
          {getValues('article_code') ? (
            <a
              href={`https://www.google.com/search?q=${getValues('article_code')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                display: 'block',
                // marginLeft: '1.5rem',
              }}
            >
              Zoek op Google
            </a>
          ) : null}
        </Stack>
      </Card>
    </Grid>
  );

  const renderMeta = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('seo_meta_data')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <RHFTextField name="title" label={t('product_title')} labelColor="violet" />
          <RHFTextField name="title_long" label={t('product_title_long')} labelColor="violet" />
          <RHFTextField name="meta_title" label={t('meta_title')} labelColor="violet" />
          {/* <RHFTextField name="meta_description" label={t('meta_description')} /> */}
          <RHFTextField name="meta_keywords" label={t('meta_keywords')} />
          {/* <RHFTextField name="url" label={t('url')} /> */}
        </Stack>
      </Card>
    </Grid>
  );

  const renderDetails2 = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('basic_information2')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            {isBrandEdit ? (
              <RHFAutocomplete
                name="brand"
                placeholder={t('brand')}
                options={brandList?.map((item) => item.id)}
                getOptionLabel={(option) =>
                  brandList.find((item) => item.id === option)?.name || ''
                }
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {brandList.find((item) => item.id === option)?.name || ''}
                  </li>
                )}
              />
            ) : (
              <Box>
                <Link
                  href={paths.dashboard.brand.edit(currentProduct?.brand?.id)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    fontWeight: 'normal',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  {`${t('brand')}: ${getValues('brand') ? getValues('brand')?.name : '-'}`}
                </Link>

                <Typography
                  typography="caption"
                  sx={{ alignSelf: 'center', color: 'blue', cursor: 'pointer' }}
                  onClick={handleBrandEditClick}
                >{`${t('edit')}`}</Typography>
              </Box>
            )}

            {isSupplierEdit ? (
              <RHFAutocomplete
                name="supplier"
                placeholder={t('supplier')}
                options={supplierList?.map((item) => item.id)}
                getOptionLabel={(option) =>
                  supplierList.find((item) => item.id === option)?.name || ''
                }
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {supplierList.find((item) => item.id === option)?.name || ''}
                  </li>
                )}
              />
            ) : (
              <Box>
                <Link
                  href={paths.dashboard.supplier.edit(currentProduct?.supplier?.id)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    fontWeight: 'normal',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  {`${t('supplier')}: ${
                    getValues('supplier') ? getValues('supplier')?.supplier_code : ''
                  }-${getValues('supplier') ? getValues('supplier')?.name : ''}`}{' '}
                </Link>

                <Typography
                  typography="caption"
                  sx={{ alignSelf: 'center', color: 'blue', cursor: 'pointer' }}
                  onClick={handleSupplierEditClick}
                >{`${t('edit')}`}</Typography>
              </Box>
            )}
          </Box>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFTextField
              name="supplier_article_code"
              label={t('supplier_article_code')}
              labelColor="violet"
            />
            <RHFTextField
              name="stock_at_supplier"
              label={t('stock_at_supplier')}
              type="number"
              onBlur={handleEmptyNumbers}
            />

            <RHFSwitch
              name="sell_from_supplier"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('sell_from_supplier')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
        </Stack>
      </Card>
    </Grid>
  );

  const handleSelectImage = (urlList = []) => {
    const imageList = getValues('images') || [];

    const elementsToAdd = [];
    urlList.forEach((element) => {
      if (!imageList?.includes(element)) {
        elementsToAdd.push(element);
      }
    });
    setValue('images', [...imageList, ...elementsToAdd]);

    setImageGalleryOpen(false);
  };

  const handleDeleteImage = (image: string) => {
    // Function to delete an image from the list
    const imageList = getValues('images');
    const updatedImageList = imageList?.filter((item) => item !== image);
    setValue('images', updatedImageList);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return; // dropped outside the list

    const items = Array.from(getValues('images'));
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setValue('images', items);
  };
  const renderImages = (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                display: 'flex',
                padding: '8px',
                background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                overflowX: 'auto',
              }}
              {...provided.droppableProps}
            >
              {getValues('images')?.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: '8px',
                        margin: '0 8px 0 0',
                        userSelect: 'none',
                        background: snapshot.isDragging ? 'lightgreen' : 'none',
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          border: '1px solid whitesmoke',
                          minWidth: '150px',
                          textAlign: 'center',
                        }}
                      >
                        <img
                          src={`${IMAGE_FOLDER_PATH}${item}`}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover',
                            maxHeight: '200px',
                          }}
                          onClick={() => handleLightBoxSlides(getValues('images'))}
                        />

                        <IconButton
                          style={{ position: 'absolute', top: 0, right: 0, color: 'black' }}
                          onClick={() => handleDeleteImage(item)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                        </IconButton>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Add Image button */}
      <Typography typography="caption" sx={{ color: 'error.main' }}>
        {(errors.images as any)?.message}
      </Typography>
      <Button sx={{ color: 'violet' }} onClick={() => setImageGalleryOpen(true)}>
        {t('upload_images')}
      </Button>
    </>
  );

  const renderCategories = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('categories')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            {openDialogCategory && (
              <CategorySelector
                t={t}
                defaultSelectedCategories={getValues('categories')}
                open={openDialogCategory}
                onClose={() => setOpenDialogCategory(false)}
                onSave={(ct) => {
                  currentProduct.categories = ct;
                  setValue('categories', ct);
                  setOpenDialogCategory(false); // Close the dialog after saving
                }}
              />
            )}
            <div>
              <Typography color="violet" variant="subtitle2">
                {t('selected_categories')}:
              </Typography>
              <ul>
                {currentProduct?.categories?.map((category, index) => (
                  <li key={index}>
                    {category ? <strong>{category?.name}</strong> : `Category: ${category?.id}`}
                  </li>
                ))}
              </ul>
            </div>
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {(errors.categories as any)?.message}
            </Typography>
          </Box>
          {/* Add Image button */}
          <Button onClick={() => setOpenDialogCategory(true)}>{t('select_category')}</Button>
        </Stack>
      </Card>
    </Grid>
  );

  const renderPricing = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('pricing')} />

        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            {getValues('is_variant') ? (
              <RHFTextField
                name="variant_discount"
                label={t('variant_discount')}
                placeholder="0.00"
                type="number"
                value={getValues('variant_discount')}
                onChange={(e) => {
                  setValue('variant_discount', e.target.value);
                  setValue(
                    'price_per_piece',
                    roundUp((1 - Number(e.target.value) / 100) * parent_price_per_piece)
                  );
                  setValue(
                    'price_per_unit',
                    roundUp(
                      (1 - Number(e.target.value) / 100) *
                        Number(getValues('quantity_per_unit')) *
                        parent_price_per_piece
                    )
                  );
                  setValue(
                    'price_consumers',
                    roundUp(
                      (1 - Number(e.target.value) / 100) *
                        Number(getValues('quantity_per_unit')) *
                        1.75 *
                        parent_price_per_piece
                    )
                  );
                }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        %
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            ) : null}

            <RHFTextField
              name="quantity_per_unit"
              label={t('quantity_per_unit')}
              placeholder="0"
              type="number"
              value={getValues('quantity_per_unit')}
              onChange={(e) => {
                setValue(
                  'quantity_per_unit',
                  e.target.value !== '' ? Number(e.target.value) : e.target.value
                );
                setValue(
                  'price_per_unit',
                  roundUp(Number(e.target.value) * Number(getValues('price_per_piece')))
                );
                setValue(
                  'inhoud_price',
                  (
                    (Number(e.target.value || 1) * Number(getValues('price_per_piece') || 0)) /
                    Number(getValues('inhoud_number') || 1)
                  ).toFixed(4)
                );
                setValue(
                  'price_consumers',
                  roundUp(Number(e.target.value) * Number(getValues('price_per_piece')) * 1.75)
                );
                setValue(
                  'max_order_allowed_per_unit',
                  Math.round(
                    Number(parentProduct?.max_order_allowed_per_unit || 0) / Number(e.target.value)
                  )
                );
                if (currentProduct?.is_variant) {
                  setValue(
                    'min_stock_value',
                    Math.floor(Number(parentProduct?.min_stock_value || 0) / Number(e.target.value))
                  );
                  setValue(
                    'max_stock_at_rack',
                    Math.floor(
                      Number(parentProduct?.max_stock_at_rack || 0) / Number(e.target.value)
                    )
                  );
                  setValue(
                    'free_stock',
                    Math.floor(Number(parentProduct?.free_stock || 0) / Number(e.target.value))
                  );
                  setValue(
                    'overall_stock',
                    Math.floor(Number(parentProduct?.overall_stock || 0) / Number(e.target.value))
                  );
                  setValue(
                    'sell_count',
                    Math.floor(Number(parentProduct?.sell_count || 0) / Number(e.target.value))
                  );
                }
              }}
              InputLabelProps={{ shrink: true, sx: { color: 'violet!important' } }}
            />
            <RHFTextField
              name="price_cost"
              label={t('price_cost')}
              disabled={['box', 'pallet_full', 'pallet_layer'].includes(currentProduct?.unit)}
              placeholder="0.00"
              type="number"
              value={getValues('price_cost')}
              onChange={(e) => {
                setValue(
                  'price_cost',
                  e.target.value !== '' ? Number(e.target.value) : e.target.value
                );
                setValue(
                  'variant_discount',
                  currentProduct?.is_variant
                    ? roundUp(
                        100 *
                          ((parent_price_per_piece -
                            (Number(e.target.value) +
                              (Number(e.target.value) *
                                Number(getValues('supplier').percentage_to_add)) /
                                100)) /
                            parent_price_per_piece)
                      )
                    : 0
                );
                setValue(
                  'price_per_piece',
                  roundUp(
                    Number(e.target.value) +
                      (Number(e.target.value) * Number(getValues('supplier').percentage_to_add)) /
                        100
                  )
                );
                setValue(
                  'price_per_unit',
                  roundUp(
                    Number(getValues('quantity_per_unit')) *
                      (Number(e.target.value) +
                        (Number(e.target.value) * Number(getValues('supplier').percentage_to_add)) /
                          100)
                  )
                );
                setValue(
                  'price_consumers',
                  roundUp(
                    Number(getValues('quantity_per_unit')) *
                      (Number(e.target.value) +
                        (Number(e.target.value) * Number(getValues('supplier').percentage_to_add)) /
                          100) *
                      1.75
                  )
                );
                setValue(
                  'inhoud_price',
                  (
                    (Number(getValues('quantity_per_unit') || 0) *
                      (Number(e.target.value) +
                        (Number(e.target.value) * Number(getValues('supplier').percentage_to_add)) /
                          100)) /
                    Number(getValues('inhoud_number') || 1)
                  ).toFixed(4)
                );
              }}
              InputLabelProps={{ shrink: true, sx: { color: 'violet!important' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      €
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField
              name="price_per_piece"
              label={t('price_per_piece')}
              helperText={
                getValues('min_price_to_sell') ? (
                  <FormHelperText error={errors.price_per_piece} sx={{ p: 0, m: -1 }}>
                    min: {getValues('min_price_to_sell')}
                  </FormHelperText>
                ) : (
                  ''
                )
              }
              placeholder="0.00"
              type="number"
              value={getValues('price_per_piece')}
              onChange={(e) => {
                setValue(
                  'price_per_piece',
                  e.target.value !== '' ? Number(e.target.value) : e.target.value
                );
                setValue(
                  'variant_discount',
                  currentProduct?.is_variant
                    ? roundUp(
                        100 *
                          ((parent_price_per_piece - Number(e.target.value)) /
                            parent_price_per_piece)
                      )
                    : 0
                );
                setValue(
                  'price_per_unit',
                  roundUp(Number(e.target.value) * getValues('quantity_per_unit')) || 0
                );
                setValue(
                  'inhoud_price',
                  (
                    (Number(e.target.value) * Number(getValues('quantity_per_unit') || 0)) /
                    Number(getValues('inhoud_number') || 1)
                  ).toFixed(4)
                );
                setValue(
                  'price_consumers',
                  roundUp(Number(e.target.value) * getValues('quantity_per_unit') * 1.75) || 0
                );
              }}
              InputLabelProps={{ shrink: true, sx: { color: 'violet!important' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      €
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            <RHFTextField
              name="price_per_unit"
              disabled
              label={`${t('price_per')} ${t(getValues('unit'))}`}
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      €
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField
              name="price_consumers"
              label={t('price_consumers')}
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      €
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
            <RHFSelect name="vat" label={t('vat')} labelColor="violet">
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value={0}>0</MenuItem>
              <MenuItem value={9}>9</MenuItem>
              <MenuItem value={21}>21</MenuItem>
            </RHFSelect>
          </Box>

          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFTextField
              name="inhoud_number"
              labelColor="violet"
              label={t('inhoud_number')}
              type="number"
              value={getValues('inhoud_number')}
              onChange={(e) => {
                setValue('inhoud_number', e.target.value !== '' ? Number(e.target.value) : '');

                setValue(
                  'inhoud_price',
                  (Number(getValues('price_per_unit')) / Number(e.target.value || 1)).toFixed(4)
                );
              }}
            />
            <RHFSelect name="inhoud_unit" label={t('inhoud_unit')} labelColor="violet">
              <MenuItem value="piece">{t('piece')}</MenuItem>
              <MenuItem value="package">{t('package')}</MenuItem>
              <MenuItem value="rol">{t('rol')}</MenuItem>
              <MenuItem value="scoop">{t('scoop')}</MenuItem>
              <MenuItem value="vel">{t('vel')}</MenuItem>
              <MenuItem value="stok">{t('stok')}</MenuItem>
              <MenuItem value="ml">{t('ml')}</MenuItem>
              <MenuItem value="onderdeel">{t('onderdeel')}</MenuItem>
              <MenuItem value="gram">{t('gram')}</MenuItem>
              <MenuItem value="cm">{t('cm')}</MenuItem>
              <MenuItem value="paar">{t('paar')}</MenuItem>
            </RHFSelect>
            <RHFTextField
              disabled
              name="inhoud_price"
              label={t('inhoud_price')}
              onBlur={handleEmptyNumbers}
              placeholder="0.0000"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      €
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Stack>
      </Card>
    </Grid>
  );

  const renderProperties = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('product_properties')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFTextField name="location" label={t('location')} labelColor="violet" />
            <RHFTextField name="extra_location" label={t('extra_location')} labelColor="violet" />
            <RHFSelect name="delivery_time" label={t('delivery_time')}>
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              {DELIVERY_CHOICES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="chip" label={t('chip')} />

            <RHFSelect
              name="comm_channel_after_out_of_stock"
              label={t('comm_channel_after_out_of_stock')}
            >
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="email">{t('email_only')}</MenuItem>
              <MenuItem value="whatsapp">{t('whatsapp_only')}</MenuItem>
              <MenuItem value="all">{t('all')}</MenuItem>
            </RHFSelect>

            <RHFTextField
              disabled={['box', 'pallet_full', 'pallet_layer'].includes(currentProduct?.unit)}
              name="max_order_allowed_per_unit"
              label={t('max_order_allowed_per_unit')}
              type="number"
              onBlur={handleEmptyNumbers}
            />

            <RHFTextField
              name="order_unit_amount"
              label={t('order_unit_amount')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              name="min_order_amount"
              label={t('min_order_amount')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              disabled={currentProduct?.is_variant}
              name="min_stock_value"
              label={t('min_stock_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              disabled={currentProduct?.is_variant}
              name="max_stock_at_rack"
              label={t('max_stock_at_rack')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFSwitch
              name="has_electronic_barcode"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('has_electronic_barcode')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_used"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_used')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_regular"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_regular')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_only_for_logged_in_user"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_only_for_logged_in_user')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_taken_from_another_package"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_taken_from_another_package')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="stock_check"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('stock_check')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_only_for_export"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_only_for_export')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_featured"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_featured')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_party_sale"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_party_sale')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_clearance"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_clearance')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            <RHFSwitch
              name="is_listed_on_marktplaats"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_listed_on_marktplaats')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            <RHFSwitch
              name="is_listed_on_2dehands"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_listed_on_2dehands')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box
            columnGap={2}
            rowGap={1}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
            }}
          >
            <CountrySelect
              label={t('languages_on_item_package')}
              placeholder={t('select_languages')}
              fullWidth
              multiple
              limitTags={2}
              value={getValues('languages_on_item_package') || []}
              onChange={(event, newValue) => setValue('languages_on_item_package', newValue)}
              options={countries?.map((option) => option.code) || []}
              getOptionLabel={(option) => option}
            />
            {!getValues('languages_on_item_package')?.includes('NL') && (
              <>
                <Typography variant="subtitle2">{t('extra_etiket_nl')}:</Typography>
                <RHFEditor simple name="extra_etiket_nl" />
              </>
            )}
            {!getValues('languages_on_item_package')?.includes('FR') && (
              <>
                <Typography variant="subtitle2">{t('extra_etiket_fr')}:</Typography>
                <RHFEditor simple name="extra_etiket_fr" />
              </>
            )}
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFSwitch
              name="has_no_expiry_date"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('has_no_expiry_date')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between', color: 'violet' }}
            />
            <DatePicker
              sx={{ pointerEvents: getValues('has_no_expiry_date') ? 'none' : 'auto' }}
              label={t('expiry_date')}
              value={
                getValues('has_no_expiry_date')
                  ? null
                  : getValues('expiry_date')
                    ? new Date(getValues('expiry_date'))
                    : new Date()
              }
              format="dd/MM/yyyy"
              onChange={(newValue) => setValue('expiry_date', newValue)}
            />
          </Box>
        </Stack>
      </Card>
    </Grid>
  );

  const renderMetrics = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('size_volume')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            <RHFSelect name="size_unit" label={t('size_unit')} labelColor="violet">
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="mm">{t('mm')}</MenuItem>
              <MenuItem value="cm">{t('cm')}</MenuItem>
              <MenuItem value="m">{t('m')}</MenuItem>
            </RHFSelect>
            <RHFTextField
              labelColor="violet"
              name="size_x_value"
              label={t('size_x_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="size_y_value"
              label={t('size_y_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="size_z_value"
              label={t('size_z_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              sx={{ pointerEvents: 'none', backgroundColor: '#f5f3f3' }}
              name="volume"
              label={t('volume')}
            />
            <RHFTextField
              sx={{ pointerEvents: 'none', backgroundColor: '#f5f3f3' }}
              name="volume_unit"
              label={t('volume_unit')}
            />
            <RHFTextField
              labelColor="violet"
              name="liter"
              label={t('liter')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFSelect name="liter_unit" label={t('liter_unit')} labelColor="violet">
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="l">{t('l')}</MenuItem>
              <MenuItem value="ml">{t('ml')}</MenuItem>
            </RHFSelect>
            <RHFTextField name="weight" label={t('weight')} labelColor="violet" />
            <RHFSelect name="weight_unit" label={t('weight_unit')} labelColor="violet">
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="gr">{t('gr')}</MenuItem>
              <MenuItem value="kg">{t('kg')}</MenuItem>
            </RHFSelect>
            <RHFSwitch
              name="is_brief_box"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_brief_box')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            <RHFTextField
              labelColor="violet"
              name="pallet_x_value"
              label={t('pallet_x_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="pallet_y_value"
              label={t('pallet_y_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="pallet_z_value"
              label={t('pallet_z_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="pallet_max_weight_value"
              label={t('pallet_max_weight_value')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="pallet_layer_total_number"
              label={t('pallet_layer_total_number')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              labelColor="violet"
              name="pallet_full_total_number"
              label={t('pallet_full_total_number')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <div>
            <h2>Resultaten met één laag:</h2>
            <ul>
              {results.singleLayer.map((result, index) => (
                <li key={index}>
                  {result?.orientation}: {result?.total} producten, {result?.weight.toFixed(2)}{' '}
                  kg
                </li>
              ))}
            </ul>

            <h2>Resultaten voor volle pallets:</h2>
            <ul>
              {results.fullPallet.map((result, index) => (
                <li key={index}>
                  {result?.orientation}: {result?.total} producten, {' '}
                  {result?.weight.toFixed(2)} kg
                </li>
              ))}
            </ul>
          </div>
        </Stack>
      </Card>
    </Grid>
  );

  const renderExtra = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('other')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography variant="subtitle2">{t('important_information')}:</Typography>
          <RHFTextField
            name="important_information"
            // label={t('important_information')}
            type="textarea"
          />
        </Stack>
      </Card>
    </Grid>
  );

  const handleActionClick = (action) => {
    activeAction = action;
    onSubmit();
  };
  const renderActions = (
    <Grid
      xs={12}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: '1rem' }}
    >
      {!currentProduct ? (
        <LoadingButton
          type="button"
          variant="contained"
          size="large"
          loading={isSubmitting}
          onClick={() => handleActionClick('save_back')}
        >
          {t('create_product')}
        </LoadingButton>
      ) : (
        <>
          <LoadingButton
            type="button"
            variant="contained"
            color="warning"
            size="large"
            loading={isSubmitting}
            onClick={() => setDeleteConfirmDialogOpen(true)}
          >
            {t('delete')}
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="contained"
            size="large"
            loading={isSubmitting}
            onClick={() => handleActionClick('save_stay')}
          >
            {t('save_stay')}
          </LoadingButton>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            onClick={() => handleActionClick('save_back')}
          >
            {t('save_back')}
          </LoadingButton>
        </>
      )}
    </Grid>
  );

  const renderPreview = mdUp ? (
    <Card id="my-card">
      {currentProduct?.parent_product ? (
        <Link
          href={paths.dashboard.product.edit(currentProduct?.parent_product)}
          color="blue"
          sx={{
            alignItems: 'center',
            typography: '',
            display: 'inline-flex',
            alignSelf: 'flex-end',
            fontWeight: 'fontWeightBold',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: 3,
          }}
        >
          {t('main_product')}
        </Link>
      ) : null}
      {currentProduct?.id && currentProduct?.is_visible_particular ? (
        <Link
          target="_blank"
          href={`http://${
            HOST_API.includes('kooptop') ? 'kooptop.com' : '52.28.100.129:3000'
          }/product/${currentProduct?.id}/${currentProduct?.slug}`}
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          sx={{
            typography: '',
            float: 'right',
            fontWeight: 'fontWeightBold',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginRight: 3,
          }}
        >
          WEB
        </Link>
      ) : null}
      {currentProduct?.id && currentProduct?.is_visible_B2B ? (
        <Link
          target="_blank"
          href={`http://${
            HOST_API.includes('kooptop') ? 'kooptop.com' : '52.28.100.129:3000'
          }/product/${currentProduct?.id}/${currentProduct?.slug}`}
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          sx={{
            typography: '',
            float: 'right',
            fontWeight: 'fontWeightBold',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginRight: 3,
          }}
        >
          B2B
        </Link>
      ) : null}
      {currentProduct?.parent_product ? (
        <Link
          href={`${paths.dashboard.product.edit(currentProduct?.parent_product)}?tab=1`}
          color="blue"
          sx={{
            alignItems: 'center',
            typography: '',
            display: 'inline-flex',
            alignSelf: 'flex-end',
            fontWeight: 'fontWeightBold',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: 3,
          }}
        >
          {t('variants')}
        </Link>
      ) : null}
      <CardHeader title={t('preview')} />

      <Stack>
        <Card sx={{ padding: 3 }}>
          <Box sx={{ position: 'unset' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
              {getValues('images')?.[0] && (
                <img
                  src={`${IMAGE_FOLDER_PATH}${getValues('images')?.[0]}`}
                  alt=""
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxHeight: '250px',
                    maxWidth: 'fit-content',
                    alignSelf: 'center',
                  }}
                />
              )}
              <Box sx={{ textAlign: 'left', mt: 1 }}>
                <Typography variant="h6" fontWeight="600" color="text.secondary">
                  {getValues('title')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    {getValues('price_per_piece') ? (
                      <Typography variant="h6" fontWeight="600" fontSize="14px" color="#E94560">
                        €{roundUp(getValues('price_per_piece') * (1 + getValues('vat') / 100))}
                      </Typography>
                    ) : null}
                    <Typography
                      variant="subtitle2"
                      ml={1}
                      sx={{ color: 'grey', textDecoration: 'line-through' }}
                    >
                      {roundUp(getValues('price_consumers') * (1 + getValues('vat') / 100))}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ color: 'grey' }}>
                    {getValues('sell_count')} verkocht
                  </Typography>
                </Box>
                <Rating
                  defaultValue={parseFloat(getValues('average_rating')) || 4.55}
                  onChange={undefined}
                />
              </Box>
            </Box>
          </Box>
        </Card>
      </Stack>
    </Card>
  ) : null;

  const renderStock = (
    <Grid
      xs={12}
      sx={{
        pointerEvents: currentProduct?.is_variant ? 'none' : 'auto',
      }}
    >
      <Card>
        <CardHeader title={t('stock')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField
              name="overall_stock"
              label={t('overall_stock')}
              type="number"
              onBlur={handleEmptyNumbers}
              labelColor="violet"
            />
            <RHFTextField
              name="free_stock"
              label={t('free_stock')}
              type="number"
              onBlur={handleEmptyNumbers}
              labelColor="violet"
            />
            <RHFTextField
              name="ordered_in_progress_stock"
              label={t('ordered_in_progress_stock')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
          </Box>
        </Stack>
      </Card>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Card>
        <CardHeader title={t('inventory')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField
              name="number_in_order"
              label={t('number_in_order')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              name="number_in_offer"
              label={t('number_in_offer')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              name="number_in_pakbon"
              label={t('number_in_pakbon')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              name="number_in_confirmation"
              label={t('number_in_confirmation')}
              type="number"
            />
            <RHFTextField
              name="number_in_werkbon"
              label={t('number_in_werkbon')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
            <RHFTextField
              name="number_in_other"
              label={t('number_in_other')}
              type="number"
              onBlur={handleEmptyNumbers}
            />
          </Box>
        </Stack>
      </Card>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Card>
        <CardHeader title={t('stats')} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField
              disabled={currentProduct?.is_variant}
              name="sell_count"
              label={t('sell_count')}
              type="number"
              onBlur={handleEmptyNumbers}
              labelColor="violet"
            />
          </Box>
        </Stack>
      </Card>
    </Grid>
  );

  if (!isNewProduct && !currentProduct)
    return (
      <div style={{ textAlign: 'center' }}>
        <Iconify icon="svg-spinners:8-dots-rotate" />
      </div>
    );
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!currentProduct?.is_variant ? renderTabs : null}

      {activeTab === 0 ? (
        <Grid container spacing={1}>
          <Grid container md={9} spacing={1}>
            {renderDetails}
            {renderMeta}
            {renderPricing}
            {renderDetails2}
            {renderMetrics}
            {renderProperties}
            {renderExtra}
            {renderCategories}
            {renderImages}
            {renderActions}
          </Grid>
          <Grid md={3}>
            <Card id="my-card" sx={{ position: 'sticky', top: 64, width: '100%' }}>
              {renderPreview}
              {renderStock}
              {getValues('article_code') ? (
                <a
                  href={`https://www.google.com/search?q=${getValues('article_code')}&tbm=isch`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    float: 'left',
                    fontWeight: 'fontWeightBold',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                  }}
                >
                  Zoek afbeeldingen op Google
                </a>
              ) : null}
            </Card>
          </Grid>
        </Grid>
      ) : (
        <ProductVariantForm currentProduct={currentProduct} activeTab={activeTab} />
      )}

      {isImageGalleryOpen ? (
        <ImageGallery
          maxNumberOfSelectedImages={10}
          onClose={() => setImageGalleryOpen(false)}
          onSelect={handleSelectImage}
          name={getValues('ean')}
        />
      ) : null}
      {isDeleteConfirmDialogOpen ? (
        <ConfirmDialog
          open={isDeleteConfirmDialogOpen}
          onClose={() => setDeleteConfirmDialogOpen(false)}
          title={t('delete')}
          content={t('sure_delete')}
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteProduct(currentProduct?.id)}
            >
              {t('delete')}
            </Button>
          }
        />
      ) : null}
      <Lightbox open={openLightBox} close={() => setOpenLightBox(false)} slides={lightBoxSlides} />
    </FormProvider>
  );
}

const roundUp = (num) => parseFloat(num || 0).toFixed(2);

function convertSizeToCm(size, unit) {
  if (unit === 'mm') return size / 10;
  if (unit === 'm') return size * 100; 
  return size; 
}

function convertWeightToKg(weight, unit) {
  if (unit === 'gr') return weight / 1000;
  return weight; 
}
