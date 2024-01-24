import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import CountrySelect from 'src/components/country-select';
import { countries } from 'src/assets/data';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance from 'src/utils/axios';

import { _tags } from 'src/_mock';
import { useGetBrands } from 'src/api/brand';
import { useGetSuppliers } from 'src/api/supplier';
import { useGetCategories } from 'src/api/category';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
  RHFMultiSelectCategory, RHFSwitch
} from 'src/components/hook-form';

import { IProductItem } from 'src/types/product';
import { getValue } from '@mui/system';
import { useLocales, useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};



export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { items: categories } = useGetCategories();
  const { items: brands } = useGetBrands();
  const { items: suppliers } = useGetSuppliers();
  const mdUp = useResponsive('up', 'md');
  const { t, onChangeLang } = useTranslate();

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const DELIVERY_CHOICES = [
    { value: '0', label: t('delivery_choice_0') },
    { value: '1', label: t('delivery_choice_1') },
    { value: '2', label: t('delivery_choice_2') },
    { value: '3', label: t('delivery_choice_3') },
  ];

  const UNIT_CHOICES = [
    { value: 'piece', label: t('piece') },
    { value: 'package', label: t('package') },
    { value: 'box', label: t('box') },
    { value: 'pallet_layer', label: t('pallet_layer') },
    { value: 'pallet_full', label: t('pallet_full') },
  ];

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required(t('validation.title')),
    description: Yup.string().required(t('validation.description')),
    ean: Yup.string().required(t('validation.ean')),
    article_code: Yup.string().required(t('validation.articleCode')),
    // sku: Yup.string().required(t('validation.sku')),
    // hs_code: Yup.string().required(t('validation.hsCode')),
    // supplier_article_code: Yup.string().required(t('validation.supplierArticleCode')),
    categories: Yup.array().min(1, t('validation.minCategory')),
    brand: Yup.number().required(t('validation.brand')),
    supplier: Yup.number().required(t('validation.supplier')),
    // tags: Yup.array().min(2, t('validation.minTags')),
    price_per_piece: Yup.number().moreThan(0, t('validation.moreThanZero')),
    price_per_unit: Yup.number().moreThan(0, t('validation.moreThanZero')),
    price_consumers: Yup.number().moreThan(0, t('validation.moreThanZero')),
    price_cost: Yup.number().moreThan(0, t('validation.moreThanZero')),
    vat: Yup.number().required(t('validation.vat')),

    overall_stock: Yup.number().required(t('validation.overallStock')),
    free_stock: Yup.number().required(t('validation.freeStock')),
    ordered_in_progress_stock: Yup.number().required(t('validation.orderedInProgressStock')),
    work_in_progress_stock: Yup.number().required(t('validation.workInProgressStock')),
    max_stock_at_rack: Yup.number().required(t('validation.maxStockAtRack')),
    min_stock_value: Yup.number().required(t('validation.minStockValue')),
    stock_at_supplier: Yup.number().required(t('validation.stockAtSupplier')),

    location: Yup.string().required(t('validation.location')),
    // extra_location: Yup.string().required(t('validation.extra_location')),
    // stock_alert_value: Yup.number().required(t('validation.stock_alert_value')),
    // stock_alert: Yup.boolean().required(t('validation.stock_alert')),
    // stock_disable_when_sold_out: Yup.boolean().required(t('validation.stock_disable_when_sold_out')),
    // stock_check: Yup.boolean().required(t('validation.stock_check')),
    // important_information: Yup.string().required(t('important_information')),
    // languages_on_item_package: Yup.string().required(t('validation.languages_on_item_package')),
    // is_only_for_logged_in_user: Yup.boolean().required(t('validation.is_only_for_logged_in_user')),
    // is_used: Yup.boolean().required(t('validation.is_used')),
    // is_regular: Yup.boolean().required(t('validation.is_regular')),
    // is_featured: Yup.boolean().required(t('validation.is_featured')),
    // is_visible_on_web: Yup.boolean().required(t('validation.is_visible_on_web')),
    // is_visible_on_mobile: Yup.boolean().required(t('validation.is_visible_on_mobile')),
    // is_only_for_export: Yup.boolean().required(t('validation.is_only_for_export')),
    // is_only_for_B2B: Yup.boolean().required(t('validation.is_only_for_B2B')),
    // is_listed_on_marktplaats: Yup.boolean().required(t('validation.is_listed_on_marktplaats')),
    // is_listed_on_2dehands: Yup.boolean().required(t('validation.is_listed_on_2dehands')),
    // has_electronic_barcode: Yup.boolean().required(t('validation.has_electronic_barcode')),
    // size_x_value: Yup.string().required(t('validation.size_x_value')),
    // size_y_value: Yup.string().required(t('validation.size_y_value')),
    // size_z_value: Yup.string().required(t('validation.size_z_value')),
    // size_unit: Yup.string().required(t('validation.size_unit')),
    // weight: Yup.string().required(t('validation.weight')),
    // weight_unit: Yup.string().required(t('validation.weight_unit')),
    // volume_unit: Yup.string().required(t('validation.volume_unit')),
    // volume: Yup.string().required(t('validation.volume')),
    // is_brief_box: Yup.boolean().required(t('validation.is_brief_box')),
    // meta_title: Yup.string().required(t('validation.meta_title')),
    // meta_description: Yup.string().required(t('validation.meta_description')),
    // meta_keywords: Yup.string().required(t('validation.meta_keywords')),
    // url: Yup.string().required(t('validation.url')),

  });


  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      title_long: currentProduct?.title_long || '',
      description: currentProduct?.description || '',
      description_long: currentProduct?.description_long || '',
      ean: currentProduct?.ean || '',
      article_code: currentProduct?.article_code || '',
      sku: currentProduct?.sku || '',
      hs_code: currentProduct?.hs_code || '',
      supplier_article_code: currentProduct?.supplier_article_code || '',
      categories: currentProduct?.categories.map((item) => item.id) || [],
      brand: currentProduct?.brand?.id || null,
      supplier: currentProduct?.supplier?.id || null,
      // tags: currentProduct?.tags || [],
      image_urls: currentProduct?.image_urls || [],
      images: currentProduct?.images || [],
      price_per_piece: currentProduct?.price_per_piece || 0,
      price_per_unit: currentProduct?.price_per_unit || 0,
      price_consumers: currentProduct?.price_consumers || 0,
      price_cost: currentProduct?.price_cost || 0,
      vat: currentProduct?.vat || null,
      overall_stock: currentProduct?.overall_stock || 0,
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
  const [multiCountry, setMultiCountry] = useState<string[]>([]);
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false)

  const values = watch();

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheck = (checkedItems) => {
    setSelectedItems(checkedItems);
  };

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
      // const filtercategories = defaultValues.categories.map((item) => item.id);
      // const findBrand = brands.find((item) => item.id === defaultValues.brand.id);
      // const findSupplier = suppliers.find((item) => item.id === defaultValues.supplier.id);
      // setValue('categories', filtercategories);
      // setValue('brand', findBrand.id);
      // setValue('supplier', findSupplier.id);
    }
  }, [currentProduct, defaultValues, reset]);


  const onSubmit = handleSubmit(async (data) => {
    try {
      const imageIds = data.images.map(item => item.id)
      delete data.image_urls;
      data.images = imageIds
      data.tags = [];
      if (currentProduct) {
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

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("basic_nformation")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("title_short_description_image")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title={t("details")} />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="parent_product" label={t("parent_product")} />
            <RHFTextField name="title" label={t("product_title")} />
            <RHFTextField name="title_long" label={t("product_title_long")} />
            <RHFTextField name="description" label={t("product_description")} />
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t("description_long")}</Typography>
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
              <RHFTextField name="ean" label={t("ean")} />
              <RHFTextField name="article_code" label={t("article_code")} />
              <RHFTextField name="sku" label={t("sku")} />
              <RHFTextField name="hs_code" label={t("hs_code")} />
              <RHFTextField name="supplier_article_code" label={t("supplier_article_code")} />
            </Box>
            <Divider sx={{ borderStyle: 'dashed' }} />

            <RHFMultiSelectCategory checkbox name="categories" label={t("Category")} options={categories} />
            <RHFAutocomplete
              name="brand"
              placeholder={t("Brand")}
              options={brands.map(item => item.id)}
              getOptionLabel={(option) => brands.find(item => item.id === option)?.name || ""}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {brands.find(item => item.id === option)?.name || ""}
                </li>
              )}
            />
            <RHFAutocomplete
              name="supplier"
              placeholder={t("supplier")}
              options={suppliers.map(item => item.id)}
              getOptionLabel={(option) => suppliers.find(item => item.id === option)?.name || ""}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {suppliers.find(item => item.id === option)?.name || ""}
                </li>
              )}
            />
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
    </>
  );


  const handleSelectImage = async (idList) => {
    const { data } = await axiosInstance.get(`/images/${idList[0]}/`);
    const imageList = getValues("images")
    setValue("images", [...imageList, data]);
    setImageGalleryOpen(false)
  }
  const handleDeleteImage = (index) => {
    // Function to delete an image from the list
    const imageList = getValues("images")
    const updatedImageList = imageList.filter(item => item.id !== index);
    setValue("images", updatedImageList);
  };

  const renderImages = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("images")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("upload_images")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        {JSON.stringify(getValues("images"))}
        {JSON.stringify(errors)}

        <Card>
          {!mdUp && <CardHeader title={t("pricing")} />}
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
              {getValues("images")?.map((item, index) => (
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
            <IconButton onClick={() => setImageGalleryOpen(true)}>
              {t("Upload Photo")}
            </IconButton>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("pricing")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("price_related_inputs")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title={t("pricing")} />}
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
              <RHFTextField
                name="price_per_piece"
                label={t("price_per_piece")}
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
                name="price_per_unit"
                label={t("price_per_unit")}
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
                label={t("price_consumers")}
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
                label={t("price_cost")}
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
              <RHFTextField name="vat" label="vat" type="number" />
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderStock = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("stock_and_inventory")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("number_of__products")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title={t("stock_and_inventory")} />}
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
              <RHFTextField name="overall_stock" label={t("overall_stock")} type="number" />
              <RHFTextField name="free_stock" label={t("free_stock")} type="number" />
              <RHFTextField name="ordered_in_progress_stock" label={t("ordered_in_progress_stock")} type="number" />
              <RHFTextField name="work_in_progress_stock" label={t("work_in_progress_stock")} type="number" />
              <RHFTextField name="max_stock_at_rack" label={t("max_stock_at_rack")} type="number" />
              <RHFTextField name="min_stock_value" label={t("min_stock_value")} type="number" />
              <RHFTextField name="stock_at_supplier" label={t("stock_at_supplier")} type="number" />
              <RHFTextField name="location" label={t("location")} />
              <RHFTextField name="extra_location" label={t("extra_location")} />
              <RHFTextField name="stock_alert_value" label={t("stock_alert_value")} type="number" />
              <RHFSwitch
                name="stock_alert"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("stock_alert")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="stock_disable_when_sold_out"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("stock_disable_when_sold_out")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="stock_check"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("stock_check")}
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
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("product_properties")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("product_attributes")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title={t("product_properties")} />}
          <Stack spacing={3} sx={{ p: 3 }}>
            <CountrySelect
              label={t("languages_on_item_package")}
              placeholder={t("select_languages")}
              fullWidth
              multiple
              limitTags={2}
              value={multiCountry}
              onChange={(event, newValue) => setMultiCountry(newValue)}
              options={countries.map((option) => option.label)}
              getOptionLabel={(option) => option}
            />
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t("important_information")}</Typography>
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
              <RHFSelect name="delivery_time" label="delivery_time">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {DELIVERY_CHOICES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="sell_count" label="sell_count" />
              <RHFSwitch
                name="is_only_for_logged_in_user"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_only_for_logged_in_user")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_used"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_used")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_regular"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_regular")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_featured"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_featured")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_visible_on_web"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_visible_on_web")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_visible_on_mobile"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_visible_on_mobile")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_only_for_export"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_only_for_export")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_only_for_B2B"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_only_for_B2B")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_listed_on_marktplaats"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_listed_on_marktplaats")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_listed_on_2dehands"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_listed_on_2dehands")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />


              <RHFSwitch
                name="has_electronic_barcode"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("has_electronic_barcode")}
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


  const renderMetrics = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("size_volume")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("pyhsical_attributes")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title={t("size_volume")} />}
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
              <RHFTextField name="size_x_value" label={t("size_x_value")} />
              <RHFTextField name="size_y_value" label={t("size_y_value")} />
              <RHFTextField name="size_z_value" label={t("size_z_value")} />
              <RHFTextField name="size_unit" label={t("size_unit")} />
              <RHFTextField name="weight" label={t("weight")} />
              <RHFTextField name="weight_unit" label={t("weight_unit")} />
              <RHFTextField name="volume_unit" label={t("volume_unit")} />
              <RHFTextField name="volume" label={t("volume")} />
              <RHFSwitch
                name="is_brief_box"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("is_brief_box")}
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

  const renderMeta = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t("meta_data")}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("data_used_for_SEO")}
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title={t("meta_data")} />}
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="meta_title" label={t("meta_title")} />
            <RHFTextField name="meta_description" label={t("meta_description")} />
            <RHFTextField name="meta_keywords" label={t("meta_keywords")} />
            <RHFTextField name="url" label={t("url")} />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <RHFSwitch
          name="publish"
          labelPlacement="start"
          label={
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {t("publish")}
            </Typography>
          }
          sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
        />
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? t('create_product') : t('save_changes')}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderImages}

        {renderPricing}

        {renderStock}

        {renderProperties}

        {renderMetrics}

        {renderMeta}

        {renderActions}

      </Grid>
      {isImageGalleryOpen ? <ImageGallery maxNumberOfSelectedImages={10} onClose={() => setImageGalleryOpen(false)} onSelect={handleSelectImage} /> : null}
    </FormProvider>
  );
}
