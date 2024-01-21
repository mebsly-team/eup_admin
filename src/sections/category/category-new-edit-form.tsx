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

import { ICategoryItem } from 'src/types/category';

type Props = {
  currentCategory?: ICategoryItem;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    image: Yup.mixed<any>().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentCategory?.id || null,
      name: currentCategory?.name || '',
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
    formState: { isSubmitting },
    ...rest
  } = methods;

  const handleSelectImage = async (idList) => {
    const { data } = await axiosInstance.get(`/images/${idList[0]}/`);
    setSelectedImage(data)
    setImageGalleryOpen(false)
  }

  const onSubmit = handleSubmit(async (data) => {
    const finalData = { ...data, image: selectedImage?.id }
    try {
      if (currentCategory) {
        const response = await axiosInstance.put(`/categories/${currentCategory.id}/`, finalData);
      } else {
        const response = await axiosInstance.post(`/categories/`, finalData);
      }
      enqueueSnackbar(currentCategory ? 'Update success!' : 'Create success!');
      reset();
      router.push(paths.dashboard.category.root);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: 'Error!' });
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
              <RHFTextField name="name" label=" Name" />
              <RHFTextField name="description" label="Description" />
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Image</Typography>
                {selectedImage ? <Image src={selectedImage?.image} /> : null}
                <Button onClick={() => setImageGalleryOpen(true)}>
                  Upload Photo
                </Button>
              </Stack>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCategory ? 'Create Category' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
          {isImageGalleryOpen ? <ImageGallery onClose={() => setImageGalleryOpen(false)} onSelect={handleSelectImage} /> : null}
        </Grid>
      </Grid>
    </FormProvider>
  );
}
