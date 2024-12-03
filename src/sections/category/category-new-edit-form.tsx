import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import RadioGroup from '@mui/material/RadioGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Image from 'src/components/image';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ICategoryItem } from 'src/types/category';

import { CategorySelector } from './CategorySelector';

type Props = {
  currentCategory?: ICategoryItem;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [parentCategory, setParentCategory] = useState();

  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();
  const location = useLocation();

  // Now you can access query parameters from the location object
  const queryParams = new URLSearchParams(location.search);
  const parentId = queryParams.get('parent');
  const [openDialog, setOpenDialog] = useState(false);

  const [radioValue, setRadioValue] = useState(
    parentId || currentCategory?.parent_category ? 'sub' : 'parent'
  );

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().required(t('required')),
    icon: radioValue === 'parent' && Yup.string().required(t('required')),
    description: Yup.string(),
    parent_category: radioValue === 'sub' && Yup.mixed().required(t('category_is_required')),
    image: radioValue === 'parent' && Yup.mixed().required(t('image_required')),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentCategory?.id || null,
      name: currentCategory?.name || '',
      icon: currentCategory?.icon || '',
      description: currentCategory?.description || '',
      image: currentCategory?.image || null,
      data0: currentCategory?.data0 || null,
      data1: currentCategory?.data1 || null,
      data2: currentCategory?.data2 || null,
      data3: currentCategory?.data3 || null,
      data4: currentCategory?.data4 || null,
      data5: currentCategory?.data5 || null,
      data6: currentCategory?.data6 || null,
      parent_category: parentId || currentCategory?.parent_category,
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(NewCategorySchema),
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

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value);
  };
  useEffect(() => {
    if (parentId || currentCategory?.parent_category) getCategoryDetail();
  }, []);

  const handleSelectImage = async (idList) => {
    setValue('image', idList[0]);
    setImageGalleryOpen(false);
  };

  const getCategoryDetail = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/categories/${parentId || currentCategory?.parent_category}/`
      );
      setParentCategory(data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((errorMessage) => {
          console.error(errorMessage);
          enqueueSnackbar({ variant: 'error', message: errorMessage });
        });
      } else {
        console.error('An unexpected error occurred:', error);
        enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const finalData = {
      ...data,
      parent_category:
        typeof data?.parent_category === 'object'
          ? data?.parent_category?.id
          : data?.parent_category,
    }; // Include selected parent category in the final data
    try {
      if (currentCategory) {
        const response = await axiosInstance.put(`/categories/${currentCategory?.id}/`, finalData);
      } else {
        const response = await axiosInstance.post(`/categories/`, finalData);
      }
      enqueueSnackbar(currentCategory ? t('update_success') : t('create_success'));

      reset();
      router.push(paths.dashboard.category.root);
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
                sm: 'repeat(1, 1fr)',
              }}
            >
              {!parentId && !currentCategory?.parent_category && (
                <RadioGroup value={radioValue} onChange={handleRadioChange}>
                  <FormControlLabel
                    value="parent"
                    control={<Radio size="medium" />}
                    label={t('parent_category')}
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <FormControlLabel
                    value="sub"
                    control={<Radio size="medium" />}
                    label={t('subcategory')}
                  />
                </RadioGroup>
              )}
              <RHFTextField name="name" label={t('name')} />
              {radioValue === 'parent' && (
                <Grid container spacing={2}>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data0" label={t('btw0')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data1" label={t('omzetNL')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data2" label={t('omzetBinnenEU')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data3" label={t('omzetBuitenEU')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data4" label={t('inkoopNL')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data5" label={t('inkoopBinnenEU')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="data6" label={t('inkoopBuitenEU')} />
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <RHFTextField name="icon" label={t('icon')} />
                  </Grid>
                </Grid>
              )}
              <RHFTextField name="description" label={t('description')} />
              {radioValue === 'sub' ? (
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">
                    {t('parent_category')}:{' '}
                    {parentCategory?.name || getValues('parent_category')?.name}
                  </Typography>

                  {!parentId ? (
                    <>
                      {openDialog && (
                        <CategorySelector
                          single
                          t={t}
                          defaultSelectedCategories={[getValues('parent_category')]}
                          open={openDialog}
                          onClose={() => setOpenDialog(false)}
                          onSave={(ct) => {
                            setValue('parent_category', ct);
                            setParentCategory(ct);
                            setOpenDialog(false);
                          }}
                        />
                      )}

                      <Button type="button" onClick={() => setOpenDialog(true)} color="primary">
                        {t('select_category')}
                      </Button>
                    </>
                  ) : null}
                </Stack>
              ) : null}
              {radioValue === 'parent' ? (
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">{t('image')}</Typography>
                  <Image src={`${IMAGE_FOLDER_PATH}${getValues('image')}`} />
                  <Button onClick={() => setImageGalleryOpen(true)}>{t('upload')}</Button>
                  {errors?.image && <Typography color="error">{errors?.image?.message}</Typography>}
                </Stack>
              ) : null}
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCategory ? t('create_category') : t('save_changes')}
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
