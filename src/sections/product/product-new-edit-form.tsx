/* eslint-disable no-nested-ternary */
import * as Yup from 'yup';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, Fragment, useEffect, useCallback, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  List,
  alpha,
  Dialog,
  Button,
  MenuItem,
  ListItem,
  Checkbox,
  DialogTitle,
  ListItemText,
  ListItemIcon,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { countries } from 'src/assets/data';
import { useGetBrands } from 'src/api/brand';
import { useGetSuppliers } from 'src/api/supplier';
import { useGetCategories } from 'src/api/category';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery';
import CountrySelect from 'src/components/country-select';
import FormProvider, {
  RHFEditor,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};

export default function ProductNewEditForm({ currentProduct: mainProduct }: Props) {
  const router = useRouter();
  const { items: categories } = useGetCategories();
  const { items: brands } = useGetBrands();
  const { items: suppliers } = useGetSuppliers();
  const mdUp = useResponsive('up', 'md');
  const { t, onChangeLang } = useTranslate();

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [activeVariant, setActiveVariant] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(mainProduct);
  console.log('currentProduct', currentProduct);
  const [variant1, setVariant1] = useState({});
  const [variant2, setVariant2] = useState({});
  const [variant3, setVariant3] = useState({});
  const currentProductVariants = currentProduct?.variants || [];
  const [openDialog, setOpenDialog] = useState(false);
  const parent_price_per_piece = Number(
    currentProduct?.parent_price_per_piece || mainProduct?.price_per_unit || 0
  );

  const getVariants = () => {
    if (currentProductVariants.length) {
      currentProductVariants.forEach(async (item) => {
        const { data } = await axiosInstance.get(`/products/${item}/`);
        if (data.unit === 'box') setVariant1(data);
        if (data.unit === 'pallet_layer') setVariant2(data);
        if (data.unit === 'pallet_full') setVariant3(data);
      });
    }
  };

  useEffect(() => {
    getVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainProduct?.variants, currentProduct?.variants, activeVariant]);

  const DELIVERY_CHOICES = [
    { value: '0', label: t('delivery_choice_0') },
    { value: '1', label: t('delivery_choice_1') },
    { value: '2', label: t('delivery_choice_2') },
    { value: '3', label: t('delivery_choice_3') },
  ];

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required(t('validation_title')),
    description: Yup.string().required(t('validation_description')),
    unit: Yup.string().required(t('validation_unit')),
    ean: Yup.string().required(t('validation_ean')),
    article_code: Yup.string().required(t('validation_articleCode')),
    // sku: Yup.string().required(t('validation_sku')),
    // hs_code: Yup.string().required(t('validation_hsCode')),
    // supplier_article_code: Yup.string().required(t('validation_supplierArticleCode')),
    categories: Yup.array().min(1, t('validation_minCategory')),
    brand: Yup.number().required(t('validation_brand')),
    supplier: Yup.number().required(t('validation_supplier')),
    // tags: Yup.array().min(2, t('validation_minTags')),
    price_per_piece: Yup.number().moreThan(0, t('validation_moreThanZero')),
    price_per_unit: Yup.number().moreThan(0, t('validation_moreThanZero')),
    price_consumers: Yup.number().moreThan(0, t('validation_moreThanZero')),
    price_cost: Yup.number().moreThan(0, t('validation_moreThanZero')),
    vat: Yup.number().required(t('validation_vat')),

    overall_stock: Yup.number().required(t('validation_overallStock')),
    free_stock: Yup.number().required(t('validation_freeStock')),
    ordered_in_progress_stock: Yup.number().required(t('validation_orderedInProgressStock')),
    work_in_progress_stock: Yup.number().required(t('validation_workInProgressStock')),
    max_stock_at_rack: Yup.number().required(t('validation_maxStockAtRack')),
    min_stock_value: Yup.number().required(t('validation_minStockValue')),
    stock_at_supplier: Yup.number().required(t('validation_stockAtSupplier')),

    location: Yup.string().required(t('validation_location')),
    // extra_location: Yup.string().required(t('validation_extra_location')),
    // stock_alert_value: Yup.number().required(t('validation_stock_alert_value')),
    // stock_alert: Yup.boolean().required(t('validation_stock_alert')),
    // stock_disable_when_sold_out: Yup.boolean().required(t('validation_stock_disable_when_sold_out')),
    // stock_check: Yup.boolean().required(t('validation_stock_check')),
    // important_information: Yup.string().required(t('important_information')),
    // languages_on_item_package: Yup.string().required(t('validation_languages_on_item_package')),
    // is_only_for_logged_in_user: Yup.boolean().required(t('validation_is_only_for_logged_in_user')),
    // is_used: Yup.boolean().required(t('validation_is_used')),
    // is_regular: Yup.boolean().required(t('validation_is_regular')),
    // is_featured: Yup.boolean().required(t('validation_is_featured')),
    // is_visible_on_web: Yup.boolean().required(t('validation_is_visible_on_web')),
    // is_visible_on_mobile: Yup.boolean().required(t('validation_is_visible_on_mobile')),
    // is_only_for_export: Yup.boolean().required(t('validation_is_only_for_export')),
    // is_only_for_B2B: Yup.boolean().required(t('validation_is_only_for_B2B')),
    // is_listed_on_marktplaats: Yup.boolean().required(t('validation_is_listed_on_marktplaats')),
    // is_listed_on_2dehands: Yup.boolean().required(t('validation_is_listed_on_2dehands')),
    // has_electronic_barcode: Yup.boolean().required(t('validation_has_electronic_barcode')),
    // size_x_value: Yup.string().required(t('validation_size_x_value')),
    // size_y_value: Yup.string().required(t('validation_size_y_value')),
    // size_z_value: Yup.string().required(t('validation_size_z_value')),
    // size_unit: Yup.string().required(t('validation_size_unit')),
    // weight: Yup.string().required(t('validation_weight')),
    // weight_unit: Yup.string().required(t('validation_weight_unit')),
    // volume_unit: Yup.string().required(t('validation_volume_unit')),
    // volume: Yup.string().required(t('validation_volume')),
    // is_brief_box: Yup.boolean().required(t('validation_is_brief_box')),
    // meta_title: Yup.string().required(t('validation_meta_title')),
    // meta_description: Yup.string().required(t('validation_meta_description')),
    // meta_keywords: Yup.string().required(t('validation_meta_keywords')),
    // url: Yup.string().required(t('validation_url')),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      title_long: currentProduct?.title_long || '',
      description: currentProduct?.description || '',
      description_long: currentProduct?.description_long || '',
      unit:
        currentProduct?.unit ||
        (activeVariant === 1
          ? 'box'
          : activeVariant === 2
            ? 'pallet_layer'
            : activeVariant === 3
              ? 'pallet_full'
              : ''),
      parent_product: currentProduct?.parent_product || '',
      ean: currentProduct?.ean || '',
      article_code: currentProduct?.article_code || '',
      sku: currentProduct?.sku || '',
      hs_code: currentProduct?.hs_code || '',
      supplier_article_code: currentProduct?.supplier_article_code || '',
      categories: currentProduct?.categories?.map((item) => item.id) || [],
      brand: currentProduct?.brand?.id || null,
      supplier: currentProduct?.supplier?.id || null,
      // tags: currentProduct?.tags || [],
      image_urls: currentProduct?.image_urls || [],
      images: currentProduct?.images || [],
      quantity_per_unit: activeVariant === 0 ? 1 : currentProduct?.quantity_per_unit || 0,
      variant_discount: currentProduct?.variant_discount || null,
      price_per_piece: currentProduct?.price_per_piece || 0,
      price_per_unit: currentProduct?.price_per_unit || 0,
      price_consumers: currentProduct?.price_consumers || 0,
      price_cost: currentProduct?.price_cost || 0,
      vat: Number(currentProduct?.vat || 0),
      overall_stock: currentProduct?.overall_stock || 0,
      expiry_date: currentProduct?.expiry_date || null,
      free_stock: currentProduct?.free_stock || 0,
      ordered_in_progress_stock: currentProduct?.ordered_in_progress_stock || 0,
      work_in_progress_stock: currentProduct?.work_in_progress_stock || 0,
      max_stock_at_rack: currentProduct?.max_stock_at_rack || 0,
      min_stock_value: currentProduct?.min_stock_value || 0,
      stock_at_supplier: currentProduct?.stock_at_supplier || 0,
      location: currentProduct?.location || '',
      extra_location: currentProduct?.extra_location || '',
      stock_alert_value: currentProduct?.stock_alert_value || '',
      stock_alert: currentProduct?.stock_alert || false,
      stock_disable_when_sold_out: currentProduct?.stock_disable_when_sold_out || false,
      stock_check: currentProduct?.stock_check || false,
      delivery_time: currentProduct?.delivery_time || '',
      important_information: currentProduct?.important_information || '',
      languages_on_item_package: currentProduct?.languages_on_item_package || [],
      sell_count: currentProduct?.sell_count || 0,
      is_only_for_logged_in_user: currentProduct?.is_only_for_logged_in_user || false,
      is_used: currentProduct?.is_used || false,
      is_regular: currentProduct?.is_regular || true,
      is_featured: currentProduct?.is_featured || false,
      is_visible_on_web: currentProduct?.is_visible_on_web || true,
      is_visible_on_mobile: currentProduct?.is_visible_on_mobile || true,
      is_only_for_export: currentProduct?.is_only_for_export || false,
      is_only_for_B2B: currentProduct?.is_only_for_B2B || false,
      is_listed_on_marktplaats: currentProduct?.is_listed_on_marktplaats || false,
      is_listed_on_2dehands: currentProduct?.is_listed_on_2dehands || false,
      has_electronic_barcode: currentProduct?.has_electronic_barcode || false,
      size_x_value: currentProduct?.size_x_value || '',
      size_y_value: currentProduct?.size_y_value || '',
      size_z_value: currentProduct?.size_z_value || '',
      size_unit: currentProduct?.size_unit || '',
      weight: currentProduct?.weight || '',
      weight_unit: currentProduct?.weight_unit || '',
      volume_unit: currentProduct?.volume_unit || '',
      volume: currentProduct?.volume || '',
      is_brief_box: currentProduct?.is_brief_box || false,
      meta_title: currentProduct?.meta_title || '',
      meta_description: currentProduct?.meta_description || '',
      meta_keywords: currentProduct?.meta_keywords || '',
      url: currentProduct?.url || '',
    }),
    [currentProduct]
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
    formState: { isSubmitting, errors },
    ...rest
  } = methods;

  useEffect(() => {
    const calculateVolume = () => {
      const sizeX = parseFloat(watch('size_x_value') || 0);
      const sizeY = parseFloat(watch('size_y_value') || 0);
      const sizeZ = parseFloat(watch('size_z_value') || 0);
      const unit = watch('size_unit');
      const weight = parseFloat(watch('weight') || 0);
      const weightUnit = watch('weight_unit');

      let calculatedVolume = 0;
      let calculatedVolumeUnit = '';
      let isBriefBox = true;

      if (unit === 'mm') {
        calculatedVolume = (sizeX * sizeY * sizeZ) / 1000000; // Conversion from mm^3 to cm^3
        calculatedVolumeUnit = 'cm^3';
        isBriefBox =
          sizeX <= 264 &&
          sizeY <= 380 &&
          sizeZ <= 32 &&
          (weightUnit === 'kg' ? weight <= 1 : weight <= 1000);
      } else if (unit === 'cm') {
        calculatedVolume = sizeX * sizeY * sizeZ;
        calculatedVolumeUnit = 'cm^3';
        isBriefBox =
          sizeX <= 26.4 &&
          sizeY <= 38 &&
          sizeZ <= 3.2 &&
          (weightUnit === 'kg' ? weight <= 1 : weight <= 1000);
      } else if (unit === 'm') {
        calculatedVolume = sizeX * sizeY * sizeZ;
        calculatedVolumeUnit = 'm^3';
        isBriefBox =
          sizeX <= 0.264 &&
          sizeY <= 0.38 &&
          sizeZ <= 0.32 &&
          (weightUnit === 'kg' ? weight <= 1 : weight <= 1000);
      }

      setValue('volume', calculatedVolume.toFixed(2)); // Setting the calculated volume in the form
      setValue('volume_unit', calculatedVolumeUnit); // Setting the calculated volume unit
      setValue('is_brief_box', isBriefBox); // Setting is_brief_box based on size and weight
    };

    calculateVolume();
  }, [
    watch('size_unit'),
    watch('size_x_value'),
    watch('size_y_value'),
    watch('size_z_value'),
    watch('weight'),
    watch('weight_unit'),
  ]);

  const handleVariantChange = (e: { target: { id: SetStateAction<number> } }) => {
    const variant = Number(e.target.id);
    setActiveVariant(variant);
    if (variant === 0) {
      setCurrentProduct(mainProduct);
    }
    if (variant === 1) {
      setCurrentProduct(variant1);
    }
    if (variant === 2) {
      setCurrentProduct(variant2);
    }
    if (variant === 3) {
      setCurrentProduct(variant3);
    }
  };

  const [multiCountry, setMultiCountry] = useState<string[]>([]);
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  console.log('getValues', getValues());

  const values = watch();

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheck = (checkedItems) => {
    setSelectedItems(checkedItems);
  };

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('handleSubmit data', data);
    try {
      const ex_date = format(new Date(data.expiry_date), 'yyyy-MM-dd');
      data.expiry_date = ex_date;
      const imageIds = data.images.map((item) => item.id);
      delete data.image_urls;
      data.images = imageIds;
      data.tags = [];
      if (currentProduct?.id) {
        const response = await axiosInstance.put(`/products/${currentProduct.id}/`, data);
      } else {
        const response = await axiosInstance.post('/products/', data);
      }
      reset();
      enqueueSnackbar(currentProduct ? t('update_success') : t('create_success'));
      router.push(paths.dashboard.product.root);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: t('error') });
    }
  });

  const handleChangeIncludeTaxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderTabs = (
    <Tabs
      value={activeVariant}
      onChange={handleVariantChange}
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
        label={`${t('variant_1')} (${t('box')})`}
        disabled={!currentProduct}
      />
      <Tab
        iconPosition="end"
        id={2}
        value={2}
        label={`${t('variant_2')} (${t('pallet_layer')})`}
        disabled={!currentProduct}
      />
      <Tab
        iconPosition="end"
        id={3}
        value={3}
        label={`${t('variant_3')} (${t('pallet_full')})`}
        disabled={!currentProduct}
      />
    </Tabs>
  );

  const handleImportMainProduct = () => {
    const copyData = {
      ...mainProduct,
      id: '',
      parent_product: mainProduct?.id,
      unit:
        activeVariant === 1
          ? 'box'
          : activeVariant === 2
            ? 'pallet_layer'
            : activeVariant === 3
              ? 'pallet_full'
              : '',
    };
    setCurrentProduct(copyData);
  };

  const renderDetails = (
    <Grid xs={12}>
      <Card>
        {activeVariant !== 0 && (
          <Typography
            fontSize="14px"
            color="blue"
            sx={{ px: 3, pt: 2, cursor: 'pointer', float: 'right' }}
            onClick={handleImportMainProduct}
          >
            {t('import_data_from_main_product')}
          </Typography>
        )}
        <CardHeader title={t('basic_information')} />
        <Stack spacing={3} sx={{ p: 3 }}>
          {/* <RHFTextField name="parent_product" label={t('parent_product')} /> */}
          <RHFTextField name="title" label={t('product_title')} />
          <RHFTextField name="title_long" label={t('product_title_long')} />
          <RHFTextField name="description" label={t('product_description')} />
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t('description_long')}</Typography>
            <RHFEditor simple name="description_long" />
          </Stack>
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
            <RHFSelect name="unit" label={t('unit')}>
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              {activeVariant === 0 && <MenuItem value="piece">{t('piece')}</MenuItem>}
              {activeVariant === 0 && <MenuItem value="package">{t('package')}</MenuItem>}
              {activeVariant === 0 && <MenuItem value="rol">{t('rol')}</MenuItem>}
              {activeVariant === 1 && <MenuItem value="box">{t('box')}</MenuItem>}
              {activeVariant === 2 && <MenuItem value="pallet_layer">{t('pallet_layer')}</MenuItem>}
              {activeVariant === 3 && <MenuItem value="pallet_full">{t('pallet_full')}</MenuItem>}
            </RHFSelect>
            <RHFTextField name="ean" label={t('ean')} />
            <RHFTextField name="article_code" label={t('article_code')} />
            <RHFTextField name="sku" label={t('sku')} />
            <RHFTextField name="hs_code" label={t('hs_code')} />
            <RHFTextField name="supplier_article_code" label={t('supplier_article_code')} />
          </Box>

          <RHFAutocomplete
            name="brand"
            placeholder={t('brand')}
            options={brands.map((item) => item.id)}
            getOptionLabel={(option) => brands.find((item) => item.id === option)?.name || ''}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {brands.find((item) => item.id === option)?.name || ''}
              </li>
            )}
          />
          <RHFAutocomplete
            name="supplier"
            placeholder={t('supplier')}
            options={suppliers.map((item) => item.id)}
            getOptionLabel={(option) => suppliers.find((item) => item.id === option)?.name || ''}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {suppliers.find((item) => item.id === option)?.name || ''}
              </li>
            )}
          />
          <CategorySelector
            t={t}
            categories={categories}
            defaultSelectedCategories={getValues('categories')}
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            onSave={(ct) => {
              setValue('categories', ct);
              setOpenDialog(false); // Close the dialog after saving
            }}
          />
          <div>
            <Typography variant="subtitle2" onClick={handleImportMainProduct}>
              {t('selected_categories')}:
            </Typography>
            <ul>
              {getValues('categories').map((categoryId) => {
                const category = findCategory(categories, categoryId);
                return (
                  <li key={categoryId}>
                    {category ? (
                      <>
                        <strong>{category.name}</strong>
                        {category.sub_categories.length > 0 && (
                          <ul>
                            {category.sub_categories.map((subCategory) => (
                              <li key={subCategory.id}>{subCategory.name}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      `Category Not Found: ${categoryId}`
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <Button type="button" onClick={() => setOpenDialog(true)} color="primary">
            {t('select_category')}
          </Button>

          {/* <RHFAutocomplete
              name="tags"
              label="Tags"
              placeholder="+ Tags"
              multiple
              freeSolo
              options={_tags.map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            /> */}
        </Stack>
      </Card>
    </Grid>
  );

  const handleSelectImage = (idList = []) => {
    idList.forEach(async (element) => {
      const { data } = await axiosInstance.get(`/images/${element}/`);
      const imageList = getValues('images');
      setValue('images', [...imageList, data]);
    });
    setImageGalleryOpen(false);
  };
  const handleDeleteImage = (index) => {
    // Function to delete an image from the list
    const imageList = getValues('images');
    const updatedImageList = imageList.filter((item) => item.id !== index);
    setValue('images', updatedImageList);
  };

  const renderImages = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('images')} />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            {/* List images with delete icon */}
            {getValues('images')?.map((item, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={item.url}
                  alt={`Image ${index + 1}`}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                />

                <IconButton
                  style={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleDeleteImage(item.id)}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                </IconButton>
              </div>
            ))}
          </Box>
          {/* Add Image button */}
          <IconButton onClick={() => setImageGalleryOpen(true)}>{t('upload_images')}</IconButton>
        </Stack>
      </Card>
    </Grid>
  );

  const renderPricing = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('pricing')} />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            {Number(activeVariant) > 0 ? (
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
              disabled={Number(activeVariant) > 0}
              name="price_per_piece"
              label={t('price_per_piece')}
              placeholder="0.00"
              type="number"
              value={getValues('price_per_piece')}
              onChange={(e) => {
                setValue('price_per_piece', Number(e.target.value));
                setValue('price_per_unit', Number(e.target.value) * getValues('quantity_per_unit'));
                setValue(
                  'price_consumers',
                  Number(e.target.value) * getValues('quantity_per_unit') * 1.75
                );
              }}
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
              name="quantity_per_unit"
              label={t('quantity_per_unit')}
              placeholder="0.00"
              type="number"
              value={getValues('quantity_per_unit')}
              onChange={(e) => {
                setValue('quantity_per_unit', Number(e.target.value));
                setValue(
                  'price_per_unit',
                  Number(e.target.value) * Number(getValues('price_per_piece'))
                );
                setValue(
                  'price_consumers',
                  Number(e.target.value) * Number(getValues('price_per_piece')) * 1.75
                );
              }}
              InputLabelProps={{ shrink: true }}
            />

            <RHFTextField
              disabled
              name="price_per_unit"
              label={t('price_per_unit')}
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
            <RHFTextField
              name="price_cost"
              label={t('price_cost')}
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
            <RHFSelect name="vat" label={t('vat')}>
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value={0}>0</MenuItem>
              <MenuItem value={9}>9</MenuItem>
              <MenuItem value={21}>21</MenuItem>
            </RHFSelect>
          </Box>
        </Stack>
      </Card>
    </Grid>
  );

  const renderStock = (
    <>
      {/*       {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t('stock_and_inventory')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('number_of_products')}
          </Typography>
        </Grid>
      )}
 */}
      <Grid xs={12}>
        <Card>
          <CardHeader title={t('stock_and_inventory')} />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="overall_stock" label={t('overall_stock')} type="number" />
              <RHFTextField name="free_stock" label={t('free_stock')} type="number" />
              <RHFTextField
                name="ordered_in_progress_stock"
                label={t('ordered_in_progress_stock')}
                type="number"
              />
              <RHFTextField
                name="work_in_progress_stock"
                label={t('work_in_progress_stock')}
                type="number"
              />
              <RHFTextField name="max_stock_at_rack" label={t('max_stock_at_rack')} type="number" />
              <RHFTextField name="min_stock_value" label={t('min_stock_value')} type="number" />
              <RHFTextField name="stock_at_supplier" label={t('stock_at_supplier')} type="number" />
              <RHFTextField name="location" label={t('location')} />
              <RHFTextField name="extra_location" label={t('extra_location')} />
              <RHFTextField name="stock_alert_value" label={t('stock_alert_value')} type="number" />
              <RHFSwitch
                name="stock_alert"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t('stock_alert')}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="stock_disable_when_sold_out"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t('stock_disable_when_sold_out')}
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
            </Box>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('product_properties')} />
        <Stack spacing={3} sx={{ p: 3 }}>
          <CountrySelect
            label={t('languages_on_item_package')}
            placeholder={t('select_languages')}
            fullWidth
            multiple
            limitTags={2}
            value={multiCountry}
            onChange={(event, newValue) => setMultiCountry(newValue)}
            options={countries.map((option) => option.label)}
            getOptionLabel={(option) => option}
          />
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t('important_information')}</Typography>
            <RHFEditor simple name="important_information" />
          </Stack>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="delivery_time" label={t('delivery_time')}>
              <MenuItem value="">None</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              {DELIVERY_CHOICES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="sell_count" label={t('sell_count')} />
            <DatePicker
              label={t('expiry_date')}
              value={new Date(getValues('expiry_date'))}
              format="dd/MM/yyyy"
              onChange={(newValue) => setValue('expiry_date', newValue)}
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
              name="is_visible_on_web"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_visible_on_web')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
            {/*       <RHFSwitch
              name="is_visible_on_mobile"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_visible_on_mobile')}
                </Typography>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            /> */}
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
              name="is_only_for_B2B"
              labelPlacement="start"
              label={
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('is_only_for_B2B')}
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
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
        </Stack>
      </Card>
    </Grid>
  );

  const renderMetrics = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('size_volume')} />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="size_unit" label={t('size_unit')}>
              <MenuItem value="">--</MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <MenuItem value="mm">{t('mm')}</MenuItem>
              <MenuItem value="cm">{t('cm')}</MenuItem>
              <MenuItem value="m">{t('m')}</MenuItem>
            </RHFSelect>
            <RHFTextField name="size_x_value" label={t('size_x_value')} />
            <RHFTextField name="size_y_value" label={t('size_y_value')} />
            <RHFTextField name="size_z_value" label={t('size_z_value')} />
            <RHFTextField sx={{ pointerEvents: 'none' }} name="volume" label={t('volume')} />
            <RHFTextField
              sx={{ pointerEvents: 'none' }}
              name="volume_unit"
              label={t('volume_unit')}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Divider sx={{ borderStyle: 'dashed' }} />

            <RHFTextField name="weight" label={t('weight')} />
            <RHFSelect name="weight_unit" label={t('weight_unit')}>
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
        </Stack>
      </Card>
    </Grid>
  );

  const renderMeta = (
    <Grid xs={12}>
      <Card>
        <CardHeader title={t('seo_meta_data')} />
        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFTextField name="meta_title" label={t('meta_title')} />
          <RHFTextField name="meta_description" label={t('meta_description')} />
          <RHFTextField name="meta_keywords" label={t('meta_keywords')} />
          <RHFTextField name="url" label={t('url')} />
        </Stack>
      </Card>
    </Grid>
  );

  const renderActions = (
    <Grid xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
      <RHFSwitch
        name="publish"
        labelPlacement="start"
        label={
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {t('publish')}
          </Typography>
        }
        sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
      />
      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {!currentProduct ? t('create_product') : t('save_changes')}
      </LoadingButton>
    </Grid>
  );

  const renderPreview = mdUp ? (
    <Grid md={4} sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <Card id="my-card" sx={{ position: 'sticky', top: 64, width: '100%' }}>
        <CardHeader title={t('preview')} />
        <Stack>
          <Card sx={{ padding: 3 }}>
            <Box sx={{ position: 'unset' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                {getValues('images')?.[0]?.url && (
                  <img src={getValues('images')?.[0]?.url} alt="" />
                )}
                <Box sx={{ textAlign: 'left', mt: 1 }}>
                  <Typography variant="h6" fontWeight="600" color="text.secondary">
                    {getValues('title')}
                  </Typography>
                  <Typography fontSize="14px" color="text.muted">
                    {getValues('description')}
                  </Typography>
                  {getValues('price_per_piece') ? (
                    <Typography variant="h6" fontWeight="600" fontSize="14px" color="#E94560">
                      €{getValues('price_per_piece')}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </Box>
          </Card>
        </Stack>
      </Card>
    </Grid>
  ) : null;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderTabs}

      <Grid container spacing={3}>
        <Grid container md={8} spacing={3}>
          {renderDetails}
          {renderImages}
          {renderPricing}
          {renderStock}
          {renderProperties}
          {renderMetrics}
          {renderMeta}
          {renderActions}
        </Grid>

        {renderPreview}
      </Grid>

      {isImageGalleryOpen ? (
        <ImageGallery
          maxNumberOfSelectedImages={10}
          onClose={() => setImageGalleryOpen(false)}
          onSelect={handleSelectImage}
        />
      ) : null}
    </FormProvider>
  );
}

const CategorySelector = ({ t, categories, defaultSelectedCategories, open, onClose, onSave }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  useEffect(() => {
    if (defaultSelectedCategories) {
      setSelectedCategories(defaultSelectedCategories);
    }
  }, [defaultSelectedCategories]);
  const renderOptions = (categories, level = 0) =>
    categories.map((category) => (
      <Fragment key={category.id}>
        <ListItem dense button onClick={() => toggleCategory(category.id)}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={selectedCategories.includes(category.id)}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={category.name} />
        </ListItem>
        {category.sub_categories.length > 0 && (
          <List style={{ paddingLeft: `${(level + 1) * 20}px` }}>
            {renderOptions(category.sub_categories, level + 1)}
          </List>
        )}
      </Fragment>
    ));

  const handleSave = () => {
    onSave(selectedCategories);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('select_category')}</DialogTitle>
      <DialogContent>
        <List>{renderOptions(categories)}</List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          {t('save')}
        </Button>
        <Button onClick={onClose} color="primary">
          {t('cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const findCategory = (categories, categoryId) => {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category;
    }
    if (category.sub_categories.length > 0) {
      const foundSubCategory = findCategory(category.sub_categories, categoryId);
      if (foundSubCategory) {
        return foundSubCategory;
      }
    }
  }
  return null;
};

const roundUp = (num) => Math.round(num * 100) / 100;
