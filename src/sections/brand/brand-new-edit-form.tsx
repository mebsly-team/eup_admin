import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import Image from 'src/components/image';

import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField } from 'src/components/hook-form';

import { IBrandItem } from 'src/types/brand';
import { useLocales, useTranslate } from 'src/locales';

type Props = {
  currentBrand?: IBrandItem;
};

export default function BrandNewEditForm({ currentBrand }: Props) {
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();

  const NewBrandSchema = Yup.object().shape({
    name: Yup.string().required(t('name_required')),
    description: Yup.string(),
    logo: Yup.mixed<any>().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentBrand?.id || null,
      name: currentBrand?.name || '',
      description: currentBrand?.description || '',
      logo: currentBrand?.logo || null,
    }),
    [currentBrand]
  );

  const methods = useForm({
    resolver: yupResolver(NewBrandSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
    ...rest
  } = methods;

  const handleSelectImage = async (idList) => {
    const { data } = await axiosInstance.get(`/images/${idList[0]}/`);
    setSelectedImage(data)
    setImageGalleryOpen(false)
  }

  const onSubmit = handleSubmit(async (data) => {
    const finalData = { ...data, logo_id: selectedImage?.id }
    try {
      if (currentBrand) {
        const response = await axiosInstance.put(`/brands/${currentBrand.id}/`, finalData);
      } else {
        const response = await axiosInstance.post(`/brands/`, finalData);
      }
      enqueueSnackbar(currentBrand ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.brand.root);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: t('error') });
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
              <RHFTextField name="name" label={t("name")} />
              <RHFTextField name="description" label={t("description")} />
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Logo</Typography>
                {selectedImage ? <Image src={selectedImage?.url} /> : null}
                <Button onClick={() => setImageGalleryOpen(true)}>
                  {t("upload")}
                </Button>
              </Stack>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentBrand ? t('create_brand') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
          {isImageGalleryOpen ? <ImageGallery onClose={() => setImageGalleryOpen(false)} onSelect={handleSelectImage} /> : null}
        </Grid>
      </Grid>
    </FormProvider>
  );
}
