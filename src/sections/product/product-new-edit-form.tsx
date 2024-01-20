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
  RHFMultiSelectCategory,RHFSwitch
} from 'src/components/hook-form';

import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: IProductItem;
};


const UNIT_CHOICES = [
  { value: 'piece', label: 'piece' },
  { value: 'package', label: 'package' },
  { value: 'box', label: 'box' },
  { value: 'pallet_layer', label: 'pallet_layer' },
  { value: 'pallet_full', label: 'pallet_full' },
];

export default function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { items } = useGetCategories();
  const { items: brands } = useGetBrands();
  const { items: suppliers } = useGetSuppliers();
  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    // image_urls: Yup.array().notRequired(),
    // image_urls: Yup.array().min(1, 'image_urls is required'),
    tags: Yup.array().min(2, 'Must have at least 2 tags'),
    brand: Yup.mixed(),
    supplier: Yup.mixed(),
    categories: Yup.array(),
    price_per_piece: Yup.number().moreThan(0, 'Price should not be $0.00'),
    price_per_unit: Yup.number().moreThan(0, 'Price should not be $0.00'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentProduct?.title || '',
      description: currentProduct?.description || '',
      image_urls: currentProduct?.image_urls || [],
      price_per_piece: currentProduct?.price_per_piece || 0,
      price_per_unit: currentProduct?.price_per_unit || 0,
      brand: currentProduct?.brand || [],
      tags: currentProduct?.tags || [],
      categories: currentProduct?.categories || [],
      supplier: currentProduct?.supplier || null,
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
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheck = (checkedItems) => {
    setSelectedItems(checkedItems);
  };

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
      const filtercategories = defaultValues.categories.map((item) => item.id);
      const findBrand = brands.find((item) => item.id === defaultValues.brand.id);
      const findSupplier = suppliers.find((item) => item.id === defaultValues.supplier.id);
      setValue('categories', filtercategories);
      setValue('brand', findBrand.id);
      setValue('supplier', findSupplier.id);
    }
  }, [currentProduct, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      delete data.image_urls;
      data.tags = [];
      if (currentProduct) {
        const response = await axiosInstance.put(`/products/${currentProduct.id}/`, data);
      } else {
        const response = await axiosInstance.post('/products/', data);
      }
      reset();
      enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.product.root);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: 'Hatalı İşlem!' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = values.image_urls || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('image_urls', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.image_urls]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = values.image_urls && values.image_urls?.filter((file) => file !== inputFile);
      setValue('image_urls', filtered);
    },
    [setValue, values.image_urls]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('image_urls', []);
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, short description, image...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="parent_product" label="parent_product" />
            <RHFTextField name="title" label="Product Title" />
            <RHFTextField name="title_long" label="Product Title Long" />
            <RHFTextField name="description" label="Product description" />
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">description_long</Typography>
              <RHFEditor simple name="description_long" />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Images</Typography>
              <RHFUpload
                multiple
                thumbnail
                name="image_urls"
                maxSize={3145728}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
              // onUpload={() => console.info('ON UPLOAD')}
              />
            </Stack>
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
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional functions and attributes...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

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
              <RHFTextField name="price_per_piece" label="price_per_piece" />
              <RHFTextField name="price_per_unit" label="price_per_unit" />
              <RHFTextField name="price_consumers" label="price_consumers" />
              <RHFTextField name="price_cost" label="price_cost" />
              <RHFSelect name="unit" label="unit">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {UNIT_CHOICES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="quantity_per_unit" label="quantity_per_unit" type="number" />
              <RHFTextField name="quantity_total_content" label="quantity_total_content" type="number" />
              <RHFTextField name="max_order_allowed_per_unit" label="max_order_allowed_per_unit" type="number" />
              <RHFTextField name="overall_stock" label="overall_stock" type="number" />
              <RHFTextField name="free_stock" label="free_stock" type="number" />
              <RHFTextField name="ordered_in_progress_stock" label="ordered_in_progress_stock" type="number" />
              <RHFTextField name="work_in_progress_stock" label="work_in_progress_stock" type="number" />
              <RHFTextField name="max_stock_at_rack" label="max_stock_at_rack" type="number" />
              <RHFTextField name="min_stock_value" label="min_stock_value" type="number" />
              <RHFTextField name="stock_at_supplier" label="stock_at_supplier" type="number" />
              <RHFSwitch
                name="stock_disable_when_sold_out"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    stock_disable_when_sold_out
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

              <RHFTextField name="ean" label="ean" />
              <RHFTextField name="article_code" label="article_code" />
              <RHFTextField name="hs_code" label="hs_code" />
              <RHFTextField name="supplier_article_code" label="supplier_article_code" />
              <RHFTextField name="sku" label="Product SKU" />

              <RHFTextField name="delivery_time" label="delivery_time" />
              <RHFTextField name="location" label="location" />
              <RHFTextField name="extra_location" label="extra_location" />
              <RHFTextField name="size_x_value" label="size_x_value" />
              <RHFTextField name="size_y_value" label="size_y_value" />
              <RHFTextField name="size_z_value" label="size_z_value" />
              <RHFTextField name="size_unit" label="size_unit" />
              <RHFTextField name="weight" label="weight" />
              <RHFTextField name="weight_unit" label="weight_unit" />
              <RHFTextField name="volume_value" label="volume_value" />
              <RHFTextField name="volume_unit" label="volume_unit" />
              <RHFTextField name="volume" label="volume" />

              <RHFTextField name="important_information" label="important_information" />
              <RHFTextField name="meta_title" label="meta_title" />
              <RHFTextField name="meta_description" label="meta_description" />
              <RHFTextField name="meta_keywords" label="meta_keywords" />
              <RHFTextField name="url" label="url" />


              <RHFTextField name="vat" label="vat" />
              <RHFTextField name="stock_alert_value" label="stock_alert_value" />
              <RHFTextField name="languages_on_item_package" label="languages_on_item_package" />
              <RHFTextField name="sell_count" label="sell_count" />
    
              <RHFSwitch
                name="is_only_for_logged_in_user"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_only_for_logged_in_user
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_used"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_used
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_regular"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_regular
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_featured"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_featured
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_visible_on_web"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_visible_on_web
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_visible_on_mobile"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_visible_on_mobile
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_only_for_export"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_only_for_export
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_only_for_B2B"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_only_for_B2B
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_listed_on_marktplaats"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_listed_on_marktplaats
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_listed_on_2dehands"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_listed_on_2dehands
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="stock_check"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    stock_check
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="stock_alert"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    stock_alert
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="has_electronic_barcode"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    has_electronic_barcode
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_brief_box"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_brief_box
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />










              {/* <RHFTextField
                name="quantity"
                label="Quantity"
                placeholder="0"
                type="number"
                InputLabelProps={{ shrink: true }}
              /> */}
              {/* 
              <FormControl component="fieldset">
                <CheckboxTree data={items} onCheck={handleCheck} />
              </FormControl>
              <div>Selected Items: {selectedItems}</div> */}
              <RHFMultiSelectCategory checkbox name="categories" label="Category" options={items} />
              <RHFSelect name="brand" label="Brands">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {brands.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="supplier" label="Suppliers">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {suppliers.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              {/* <RHFSelect
                native
                name="categories"
                label="Category"
                InputLabelProps={{ shrink: true }}
              >
                {items.map((category) => (
                  <optgroup key={category.parent_category} label={category.name}>
                    {category.sub_categories.map((classify) => (
                      <option key={classify.id} value={classify.id}>
                        {classify.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </RHFSelect> */}
              {/* <RHFMultiSelect
                checkbox
                name="brand"
                label="Colors"
                options={PRODUCT_COLOR_NAME_OPTIONS}
              />

              <RHFMultiSelect
                checkbox
                name="supplier"
                label="Sizes"
                options={PRODUCT_SIZE_OPTIONS}
              /> */}
            </Box>

            <RHFAutocomplete
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
            />
            <Divider sx={{ borderStyle: 'dashed' }} />
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
            Pricing
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Price related inputs
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Pricing" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField
              name="price_per_piece"
              label="Regular Price"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            <RHFTextField
              name="price_per_unit"
              label="Sale Price"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Create Product' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPricing}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
