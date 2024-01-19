import * as Yup from 'yup';
import moment from 'moment';
import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Divider, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';

type Props = {
  currentUser?: IUserItem;
};

const USER_TYPES = [
  { value: 'special', label: 'Special' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'particular', label: 'Particular' },
  { value: 'admin', label: 'Admin' },
];

export default function UserNewEditForm({ currentUser }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    first_name: Yup.string().required('Name is required'),
    last_name: Yup.string().required('SurName is required'),
    password: Yup.string().required('password is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phone_number: Yup.string().required('Phone number is required'),
    mobile_number: Yup.string().required('Phone number is required'),
    gender: Yup.string().required('Gender is required'),
    type: Yup.string().required('Role is required'),
    birthdate: Yup.string().required('Birthdate is required'),
    fax: Yup.string(),
    facebook: Yup.string(),
    linkedin: Yup.string(),
    twitter: Yup.string(),
    instagram: Yup.string(),
    pinterest: Yup.string(),
    tiktok: Yup.string(),
    notes: Yup.string(),
    website: Yup.string(),
    is_active: Yup.boolean(),
    is_staff: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentUser?.id || null,
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      phone_number: currentUser?.phone_number || '',
      mobile_number: currentUser?.mobile_number || '',
      gender: currentUser?.gender || '',
      type: currentUser?.type || '',
      birthdate: currentUser?.birthdate || '',
      fax: currentUser?.fax || null,
      facebook: currentUser?.facebook || null,
      linkedin: currentUser?.linkedin || null,
      twitter: currentUser?.twitter || null,
      instagram: currentUser?.instagram || null,
      pinterest: currentUser?.pinterest || null,
      tiktok: currentUser?.tiktok || null,
      notes: currentUser?.notes || null,
      website: currentUser?.website || null,
      is_active: currentUser?.is_active || true,
      is_staff: currentUser?.is_staff || false,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.birthdate = moment(data.birthdate).format('YYYY-MM-DD');
      if (currentUser) {
        const response = await axiosInstance.put(`/users/${currentUser.id}/`, data);
      } else {
        const response = await axiosInstance.post('/users/', data);
      }
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      reset();
      router.push(paths.dashboard.user.list);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: 'Hatalı İşlem!' });
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
              <RHFTextField name="first_name" label="Name" />
              <RHFTextField name="last_name" label="Last Name" />
              <RHFTextField name="password" label="Password" type="password" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="phone_number" label="Phone Number" />
              <RHFTextField name="mobile_number" label="Mobile Number" />
              <RHFSelect name="type" label="User Type">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {USER_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="gender" label="Gender">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </RHFSelect>
              <Controller
                name="birthdate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Date create"
                    value={field.value || null}
                    format="yyyy-MM-dd"
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
              <RHFTextField name="fax" label="fax" />
              <RHFTextField name="facebook" label="facebook" />
              <RHFTextField name="linkedin" label="linkedin" />
              <RHFTextField name="twitter" label="twitter" />
              <RHFTextField name="instagram" label="instagram" />
              <RHFTextField name="pinterest" label="pinterest" />
              <RHFTextField name="tiktok" label="tiktok" />
              <RHFTextField name="notes" label="notes" />
              <RHFSwitch
                name="is_staff"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Staff
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_active"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Active
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
