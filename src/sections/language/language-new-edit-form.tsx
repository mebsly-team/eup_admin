import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField } from 'src/components/hook-form';

import { IBrandItem } from 'src/types/brand';

type Props = {
  currentBrand?: IBrandItem;
};

export default function BrandNewEditForm({ currentBrand }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    code: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentBrand?.id || null,
      name: currentBrand?.name || '',
      code: currentBrand?.code || '',
    }),
    [currentBrand]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentBrand) {
        const response = await axiosInstance.put(`/brands/${currentBrand.id}/`, data);
      } else {
        const response = await axiosInstance.post(`/brands/`, data);
      }
      enqueueSnackbar(currentBrand ? 'Update success!' : 'Create success!');
      reset();
      router.push(paths.dashboard.brand.root);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: 'Hatalı İşlem!' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('logo', file, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('logo', null);
  }, [setValue]);

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
              <RHFTextField name="code" label="code" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentBrand ? 'Create Language' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
