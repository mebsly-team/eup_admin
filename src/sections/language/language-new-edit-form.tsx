import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IBrandItem } from 'src/types/brand';

type Props = {
  currentLanguage?: IBrandItem;
};

export default function BrandNewEditForm({ currentLanguage }: Props) {
  const router = useRouter();
  const { t, onChangeLang } = useTranslate();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    code: Yup.string(),
  });

  const defaultValues = {
    // id: currentLanguage?.id || null,
    name: currentLanguage?.name || '',
    code: currentLanguage?.code || '',
  }

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
      if (currentLanguage) {
        const response = await axiosInstance.put(`/brands/${currentLanguage.id}/`, data);
      } else {
        const response = await axiosInstance.post(`/brands/`, data);
      }
      enqueueSnackbar(currentLanguage ? 'Update success!' : 'Create success!');
      reset();
      router.push(paths.dashboard.brand.root);
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
                {!currentLanguage ? 'Create Language' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
