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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ICategoryItem } from 'src/types/category';

import { CategorySelector } from './CategorySelector';
import { findCategory } from './findCategory';


type Props = {
  currentCategory?: ICategoryItem;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  console.log("currentCategory", currentCategory);
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [parentCategories, setParentCategories] = useState<ICategoryItem[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>(currentCategory?.parent_category);
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();

  const [openDialog, setOpenDialog] = useState(false);

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
  console.log("🚀 ~ CategoryNewEditForm ~ getValues:", getValues())

  const [radioValue, setRadioValue] = useState(currentCategory?.parent_category ? 'sub' : "parent");

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value);
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleSelectImage = async (idList) => {
    const { data } = await axiosInstance.get(`/images/${idList[0]}/`);
    setSelectedImage(data);
    setValue("image", data?.id);
    setImageGalleryOpen(false);
  };

  const getAllCategories = async () => {
    try {
      const { data } = await axiosInstance.get(`/categories/?ordering=name`);
      setParentCategories(data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(errorMessage => {
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
          console.error("An unexpected error occurred:", error);
          enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
        }
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const finalData = {
      ...data,
      image: selectedImage?.id
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
                  value={"parent"}
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
              <RHFTextField name="icon" label={t('icon')} />
              <RHFTextField name="description" label={t('description')} />

              {radioValue === "sub" ? <Stack spacing={1.5}>
                <Typography variant="subtitle2">{t('parent_category')}</Typography>
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
                    {t('parent_category')}:{findCategory(parentCategories, getValues('parent_category'))?.name}
                  </Typography>
                </div>
                <Button type="button" onClick={() => setOpenDialog(true)} color="primary">
                  {t('select_category')}
                </Button>
              </Stack> : null}
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
