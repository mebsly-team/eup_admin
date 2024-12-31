import * as Yup from 'yup';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';

type Props = {
  currentUser?: IUserItem;
};

export default function UserNewEditForm({ currentUser }: Props) {
  const { t, onChangeLang } = useTranslate();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    password: currentUser ? null : Yup.string().required(t('required')),
    email: Yup.string().required(t('required')).email(t('email_must_be_valid')),
  });

  const defaultValues = {
    // id: currentUser?.id || null,
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone_number: currentUser?.phone_number || '',
    type: 'admin',
    notes: currentUser?.notes || null,
    is_active: currentUser?.is_active || true,
    is_staff: currentUser?.is_staff || true,
  }

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting, isDirty, errors },
    ...rest
  } = methods;
  const values = watch();
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  useEffect(() => {
    if (isDirty) localStorage.setItem('formData', JSON.stringify(values));
  }, [isDirty, values]);

  useEffect(() => {
    console.log('useEffect');
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData) {
      methods.reset(savedData); // Reset form with saved data
    }
  }, [methods]);

  console.log('errors', errors);
  const onSubmit = handleSubmit(async (data) => {
    try {
      data.birthdate = moment.isDate(data.birthdate)
        ? moment(data.birthdate).format('YYYY-MM-DD')
        : null;
      if (currentUser) {
        const response = await axiosInstance.put(`/users/${currentUser.id}/`, data);
      } else {
        const response = await axiosInstance.post('/users/', data);
      }
      localStorage.removeItem('formData');

      enqueueSnackbar(currentUser ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.log('error', error);
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
            errors?.forEach((errorMsg) => {
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
              <RHFTextField name="email" label={t('email')} />
              <RHFTextField name="first_name" label={t('name')} />
              <RHFTextField name="last_name" label={t('lastname')} />
              {currentUser ? null : (
                <RHFTextField name="password" label={t('password')} type="password" />
              )}
              <RHFTextField name="phone_number" label={t('phone')} />
            </Box>
          </Card>
          <Card sx={{ p: 3, mt: 5 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="notes" label={t('notes')} type="textarea" />
            </Box>
          </Card>

          <Card sx={{ p: 3, mt: 5 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFSwitch
                name="is_active"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t('active')}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Box>
          </Card>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentUser ? t('create_employee') : t('save')}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
