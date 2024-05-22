import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { CardHeader, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { useGetCategories } from 'src/api/category';

import Image from 'src/components/image';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { findCategory } from 'src/sections/category/findCategory';

import { ICampaignItem } from 'src/types/campaign';

import { CategorySelector } from '../category/CategorySelector';

type Props = {
  currentCampaign?: ICampaignItem;
};

export default function CampaignNewEditForm({ currentCampaign }: Props) {
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();
  const { items: categories } = useGetCategories();
  const [openDialogCategory, setOpenDialogCategory] = useState(false);

  const NewCampaignSchema = Yup.object().shape({
    name: Yup.string().required(t('required')),
    description: Yup.string(),
    discount_percentage: Yup.string(),
    start_date: Yup.string(),
    end_date: Yup.string(),
    images: Yup.array().min(1, t('validation_images')),
    products: Yup.array().min(1, t('validation_images')),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentCampaign?.id || null,
      name: currentCampaign?.name || '',
      description: currentCampaign?.description || '',
      discount_percentage: currentCampaign?.discount_percentage || null,
      images: currentCampaign?.images || [],
      products: currentCampaign?.products || [],
      start_date: currentCampaign?.start_date || null,
      end_date: currentCampaign?.end_date || null,
    }),
    [currentCampaign]
  );

  const methods = useForm({
    resolver: yupResolver(NewCampaignSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting, errors },
    ...rest
  } = methods;

  console.log('getValues', getValues());
  const handleSelectImage = async (urlList) => {
    setValue('images', urlList);
    setImageGalleryOpen(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    const finalData = { ...data };
    try {
      let response;
      if (currentCampaign) {
        response = await axiosInstance.put(`/campaigns/${currentCampaign.id}/`, finalData);
      } else {
        response = await axiosInstance.post(`/campaigns/`, finalData);
      }
      enqueueSnackbar(currentCampaign ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.campaign.root);
    } catch (error) {
      if (error) {
        console.log('error', error);
        const errorData = error;
        if (errorData) {
          Object.entries(errorData).forEach(([fieldName, errors]) => {
            errors.forEach((errorMsg) => {
              enqueueSnackbar({
                variant: 'error',
                message: `${t(fieldName)}: ${errorMsg}`,
              });
            });
          });
        }
      } else {
        console.error('Error:', error.message);
        enqueueSnackbar({ variant: 'error', message: t('error') });
      }
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label={t('name')} />
              <RHFTextField name="description" label={t('description')} />
              <RHFTextField
                name="discount_percentage"
                label={t('discount_percentage')}
                type="number"
              />
              <DatePicker
                label={t('start_date')}
                value={getValues('start_date') ? new Date(getValues('start_date')) : new Date()}
                format="dd/MM/yyyy"
                onChange={(newValue) => setValue('start_date', newValue)}
              />
              <DatePicker
                label={t('end_date')}
                value={getValues('end_date') ? new Date(getValues('end_date')) : new Date()}
                format="dd/MM/yyyy"
                onChange={(newValue) => setValue('end_date', newValue)}
              />
            </Box>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">{t('image')}</Typography>
              <Image src={getValues('images')?.[0]} />
              <Button onClick={() => setImageGalleryOpen(true)}>{t('upload')}</Button>
              {errors?.images && <Typography color="error">{errors?.images?.message}</Typography>}
            </Stack>

            <Card>
              <CardHeader title={t('categories')} />
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
                  <CategorySelector
                    t={t}
                    categories={categories}
                    defaultSelectedCategories={getValues('categories')}
                    open={openDialogCategory}
                    onClose={() => setOpenDialogCategory(false)}
                    onSave={(ct) => {
                      setValue('categories', ct);
                      setOpenDialogCategory(false); // Close the dialog after saving
                    }}
                  />
                  <div>
                    <Typography variant="subtitle2">{t('selected_categories')}:</Typography>
                    <ul>
                      {getValues('categories')?.map((categoryId) => {
                        const category = findCategory(categories, categoryId);
                        return (
                          <li key={categoryId}>
                            {category ? (
                              <strong>{category.name}</strong>
                            ) : (
                              `Category Not Found: ${categoryId}`
                            )}
                          </li>
                        );
                      })}
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

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCampaign ? t('create_campaign') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
          {isImageGalleryOpen ? (
            <ImageGallery onClose={() => setImageGalleryOpen(false)} onSelect={handleSelectImage} />
          ) : null}
        </Grid>
      </Grid>
    </FormProvider>
  );
}
