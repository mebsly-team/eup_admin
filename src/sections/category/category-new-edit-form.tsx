import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
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

import Image from 'src/components/image';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ICategoryItem } from 'src/types/category';

import { findCategory } from './findCategory';
import { CategorySelector } from './CategorySelector';

type Props = {
  currentCategory?: ICategoryItem;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  console.log('currentCategory', currentCategory);
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [parentCategories, setParentCategories] = useState<ICategoryItem[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();

  const [openDialog, setOpenDialog] = useState(false);

  const [radioValue, setRadioValue] = useState(currentCategory?.parent_category ? 'sub' : 'parent');

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().required(t('name_required')),
    icon: radioValue === 'parent' && Yup.string().required(t('icon_required')),
    description: Yup.string(),
    parent_category: radioValue === 'sub' && Yup.string().required(t('category_is_required')),
    image: radioValue === 'parent' && Yup.mixed().required(t('image_required')),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentCategory?.id || null,
      name: currentCategory?.name || '',
      icon: currentCategory?.icon || '',
      description: currentCategory?.description || '',
      image: currentCategory?.image || null,
      parent_category: currentCategory?.parent_category || null,
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
    getAllCategories();
  }, []);

  const handleSelectImage = async (idList) => {
    setValue('image', idList[0]);
    setImageGalleryOpen(false);
  };

  const getAllCategories = async () => {
    try {
      const { data } = await axiosInstance.get(`/categories/?ordering=name`);
      setParentCategories(data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((errorMessage) => {
          console.error(errorMessage);
          enqueueSnackbar({ variant: 'error', message: errorMessage });
        });
      } else {
        const errorMessages = Object.entries(error);
        if (errorMessages.length) {
          errorMessages.forEach(([fieldName, errors]) => {
            errors.forEach((errorMsg) => {
              enqueueSnackbar({
                variant: 'error',
                message: `${t(fieldName)}: ${errorMsg}`,
              });
            });
          });
        } else {
          console.error('An unexpected error occurred:', error);
          enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
        }
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const finalData = {
      ...data,
    }; // Include selected parent category in the final data
    try {
      if (currentCategory) {
        const response = await axiosInstance.put(`/categories/${currentCategory.id}/`, finalData);
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
              <RHFTextField name="name" label={t('name')} />
              {radioValue === 'parent' ? <RHFTextField name="icon" label={t('icon')} /> : null}
              <RHFTextField name="description" label={t('description')} />

              {radioValue === 'sub' ? (
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">{t('parent_category')}:</Typography>
                  <CategorySelector
                    single
                    t={t}
                    categories={parentCategories}
                    defaultSelectedCategories={[getValues('parent_category')]}
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    onSave={(ct) => {
                      setValue('parent_category', ct);
                      setOpenDialog(false);
                    }}
                  />
                  <div>
                    <Typography variant="subtitle2">
                      {findCategory(parentCategories, getValues('parent_category'))?.name}
                    </Typography>
                  </div>
                  {errors?.parent_category && (
                    <Typography color="error">{errors?.parent_category?.message}</Typography>
                  )}
                  <Button type="button" onClick={() => setOpenDialog(true)} color="primary">
                    {t('select_category')}
                  </Button>
                </Stack>
              ) : null}
              {radioValue === 'parent' ? (
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">{t('image')}</Typography>
                  <Image src={getValues('image')} />
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
