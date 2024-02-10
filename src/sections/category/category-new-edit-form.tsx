import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import { Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ICategoryItem } from 'src/types/category';

type Props = {
  currentCategory?: ICategoryItem;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  console.log(currentCategory);
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [parentCategories, setParentCategories] = useState<ICategoryItem[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>(''); // State to store the selected parent category
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();
  console.log(selectedImage);

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().required(t('name_required')),
    icon: Yup.string().required(t('icon_required')),
    description: Yup.string(),
    image: Yup.mixed().required(t('image_required')),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentCategory?.id || null,
      name: currentCategory?.name || '',
      icon: currentCategory?.icon || '',
      description: currentCategory?.description || '',
      image: currentCategory?.image || null,
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
    formState: { isSubmitting, errors },
    ...rest
  } = methods;

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleSelectImage = async (idList) => {
    const { data } = await axiosInstance.get(`/images/${idList[0]}/`);
    setSelectedImage(data);
    setImageGalleryOpen(false);
  };

  const getAllCategories = async () => {
    try {
      const { data } = await axiosInstance.get(`/categories/?ordering=name`);
      setParentCategories(data);
    } catch {
      enqueueSnackbar({ variant: 'error', message: t('error') });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const finalData = {
      ...data,
      image: selectedImage?.id,
      parent_category: selectedParentCategory,
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
              <RHFTextField name="name" label={t('name')} />
              <RHFTextField name="icon" label={t('icon')} />
              <RHFTextField name="description" label={t('description')} />

              <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t('parent_category')}</Typography>
                <Select
                  value={selectedParentCategory}
                  onChange={(e) => setSelectedParentCategory(e.target.value)}
                  fullWidth
                >
                  {parentCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t('image')}</Typography>
                <Image src={selectedImage?.url || currentCategory?.image} />
                <Button onClick={() => setImageGalleryOpen(true)}>{t('upload')}</Button>
                {errors?.image && <Typography color="error">{errors?.image?.message}</Typography>}
              </Stack>
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
