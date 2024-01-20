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
    type: Yup.string().required('Role is required'),
    first_name: Yup.string().required('Name is required'),
    last_name: Yup.string().required('SurName is required'),
    password: Yup.string().required('password is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
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
              <RHFSelect name="type" label="User Type">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {USER_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="first_name" label="Name" />
              <RHFTextField name="last_name" label="Last Name" />
              <RHFTextField name="password" label="Password" type="password" />
              <RHFTextField name="phone_number" label="Phone Number" />
              <RHFTextField name="mobile_number" label="Mobile Number" />
              <Controller
                name="birthdate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Birth Date"
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
              <RHFSwitch
                name="is_subscribed_newsletters"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_subscribed_newsletters
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_access_granted_social_media"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_access_granted_social_media
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
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
              <RHFTextField name="business_name" label="business_name" />
              <RHFTextField name="contact_person_name" label="contact_person_name" />
              <RHFTextField name="contact_person_phone_number" label="contact_person_phone_number" />
              <RHFTextField name="contact_person_email" label="contact_person_email" />
              <RHFTextField name="department" label="department" />
              <RHFTextField name="classification" label="classification" />
              <RHFTextField name="branch" label="branch" />
              <RHFTextField name="iban" label="iban" />
              <RHFTextField name="bic" label="bic" />
              <RHFTextField name="account_holder_name" label="account_holder_name" />
              <RHFTextField name="account_holder_city" label="account_holder_city" />
              <RHFTextField name="vat" label="vat" />
              <RHFTextField name="kvk" label="kvk" />
              <RHFTextField name="payment_method" label="payment_method" />
              <RHFTextField name="customer_percentage" label="customer_percentage" />
              <RHFTextField name="invoice_discount" label="invoice_discount" />
              <RHFTextField name="payment_termin" label="payment_termin" />
              <RHFTextField name="credit_limit" label="credit_limit" />
              <RHFTextField name="payment_method" label="payment_method" />
              <RHFTextField name="invoice_address" label="invoice_address" />
              <RHFTextField name="discount_group" label="discount_group" />
              <RHFTextField name="customer_color" label="customer_color" />
              <RHFTextField name="relation_type" label="relation_type" />
              <RHFTextField name="relation_via" label="relation_via" />
              <RHFTextField name="days_closed" label="days_closed" />
              <RHFTextField name="days_no_delivery" label="days_no_delivery" />
              <RHFTextField name="fax" label="fax" />
              <RHFTextField name="website" label="website" />
              <RHFSwitch
                name="incasseren"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    incasseren
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_payment_termin_active"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_payment_termin_active
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="is_eligible_to_work_with"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    is_eligible_to_work_with
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="inform_when_new_products"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    inform_when_new_products
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="inform_via"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    inform_via
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="invoice_language"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    invoice_language
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="notify"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    notify
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
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
              <RHFTextField name="notes" label="notes" type="textarea" />
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
          </Card>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentUser ? 'Create User' : 'Save Changes'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
