import * as Yup from 'yup';
import moment from 'moment';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MenuItem } from '@mui/material';

import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { IProfileItem } from 'src/types/user';

type Props = {
  currentUser?: IProfileItem;
};

export default function ProfileEditForm({ currentUser }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  // Form validation schema
  const ProfileSchema = Yup.object().shape({
    first_name: Yup.string().required('required'),
    last_name: Yup.string().required('required'),
    email: Yup.string().required('required').email('email_must_be_valid'),
    phone_number: Yup.string()
      .required('required')
      .matches(/^[0-9]+$/, 'phone_number_must_be_numeric'),
    mobile_number: Yup.string()
      .required('required')
      .matches(/^[0-9]+$/, 'mobile_number_must_be_numeric'),
    gender: Yup.string().required('required'),
    birthdate: Yup.date()
      .required('required')
      .max(moment().subtract(18, 'years').toDate(), 'birthdate_must_be_before_18_years')
      .nullable(),
    facebook: Yup.string().nullable().url('invalid_url'),
    linkedin: Yup.string().nullable().url('invalid_url'),
    twitter: Yup.string().nullable().url('invalid_url'),
    instagram: Yup.string().nullable().url('invalid_url'),
    pinterest: Yup.string().nullable().url('invalid_url'),
    tiktok: Yup.string().nullable().url('invalid_url'),
  });

  const defaultValues = {
    first_name: '',
    last_name: '',
    phone_number: '',
    mobile_number: '',
    email: null,
    gender: '',
    birthdate: null,
    facebook: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    pinterest: '',
    tiktok: '',
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/profile/`);
        const data = response.data;
        console.log(data);

        reset({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          email: data.email || null,
          mobile_number: data.mobile_number || '',
          gender: data.gender || '',
          birthdate: data.birthdate ? moment(data.birthdate).toDate() : null,
          facebook: data.facebook || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          instagram: data.instagram || '',
          pinterest: data.pinterest || '',
          tiktok: data.tiktok || '',
        });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('error_occurred'), { variant: 'error' };
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        birthdate: moment(data.birthdate).format('YYYY-MM-DD'),
      };

      await axiosInstance.put(`/profile/`, formattedData);

      const response = await axiosInstance.get(`/profile/`);
      const newData = response.data;

      reset({
        first_name: newData.first_name || '',
        last_name: newData.last_name || '',
        phone_number: newData.phone_number || '',
        email: newData.email || null,
        mobile_number: newData.mobile_number || '',
        gender: newData.gender || '',
        birthdate: newData.birthdate ? moment(newData.birthdate).toDate() : null,
        facebook: newData.facebook || '',
        linkedin: newData.linkedin || '',
        twitter: newData.twitter || '',
        instagram: newData.instagram || '',
        pinterest: newData.pinterest || '',
        tiktok: newData.tiktok || '',
      });

      enqueueSnackbar('update_success'), { variant: 'success' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'error_occurred';

      console.error(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
            >
              <RHFTextField name="first_name" label="name" />
              <RHFTextField name="last_name" label="lastname" />
              <RHFSelect name="gender" label="Gender">
                <MenuItem value="male">{'male'}</MenuItem>
                <MenuItem value="female">{'female'}</MenuItem>
              </RHFSelect>
              <Controller
                name="birthdate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label={'birthdate'}
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <RHFTextField {...params} error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
              <RHFTextField name="phone_number" label={'phone'} />
              <RHFTextField name="mobile_number" label={'mobile'} />
              <RHFTextField name="email" label={'email'} />
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
              <RHFTextField name="facebook" label="facebook" />
              <RHFTextField name="linkedin" label="linkedin" />
              <RHFTextField name="twitter" label="twitter" />
              <RHFTextField name="instagram" label="instagram" />
              <RHFTextField name="pinterest" label="pinterest" />
              <RHFTextField name="tiktok" label="tiktok" />
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {'save'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
