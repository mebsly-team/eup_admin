import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { Divider, MenuItem, Typography } from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { ISupplierItem } from 'src/types/supplier';

type Props = {
  currentSupplier?: ISupplierItem;
};

export default function SupplierNewEditForm({ currentSupplier }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const NewSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email_general: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address'),
    phone: Yup.string().required('Phone number is required'),
    mobile_phone: Yup.string().required('Phone number is required'),
    contact_person: Yup.string().required('contact_person is required'),
  });
  const defaultValues = useMemo(
    () => ({
      name: currentSupplier?.name || null,
      email_general: currentSupplier?.email_general || null,
      phone: currentSupplier?.phone || null,
      mobile_phone: currentSupplier?.mobile_phone || null,
      gender: currentSupplier?.gender || null,
      address: currentSupplier?.address || null,
      city: currentSupplier?.city || null,
      country: currentSupplier?.country || null,
      postal_code: currentSupplier?.postal_code || null,
      contact_person: currentSupplier?.contact_person || null,
      iban: currentSupplier?.iban || null,
      bic: currentSupplier?.bic || null,
      debtor_number: currentSupplier?.debtor_number || null,
      payment_terms: currentSupplier?.payment_terms || null,
      payment_instruction: currentSupplier?.payment_instruction || null,
      payment_method: currentSupplier?.payment_method || null,
      minimum_order_amount: currentSupplier?.minimum_order_amount || null,
      account_holder_name: currentSupplier?.account_holder_name || null,
      account_holder_city: currentSupplier?.account_holder_city || null,
      vat_number: currentSupplier?.vat_number || null,
      kvk_number: currentSupplier?.kvk_number || null,
      facebook: currentSupplier?.facebook || null,
      linkedin: currentSupplier?.linkedin || null,
      twitter: currentSupplier?.twitter || null,
      instagram: currentSupplier?.instagram || null,
      pinterest: currentSupplier?.pinterest || null,
      tiktok: currentSupplier?.tiktok || null,
      website: currentSupplier?.website || null,
      memo: currentSupplier?.memo || null,
    }),
    [currentSupplier]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema),
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
      if (currentSupplier) {
        const response = await axiosInstance.put(`/suppliers/${currentSupplier.id}/`, data);
      } else {
        const response = await axiosInstance.post(`/suppliers/`, data);
      }
      enqueueSnackbar(currentSupplier ? 'Update success!' : 'Create success!');
      reset();
      router.push(paths.dashboard.supplier.root);
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
              <RHFTextField name="name" label=" Name" />
              <RHFTextField name="contact_person" label="contact_person" />
              <RHFTextField name="email_general" label="Email" />
              <RHFTextField name="phone" label="Phone Number" />
              <RHFTextField name="mobile_phone" label="Mobile Number" />


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
              <RHFTextField name="iban" label="iban" />
              <RHFTextField name="bic" label="bic" />
              <RHFTextField name="account_holder_name" label="account_holder_name" />
              <RHFTextField name="account_holder_city" label="account_holder_city" />
              <RHFTextField name="vat_number" label="vat_number" />
              <RHFTextField name="kvk_number" label="kvk_number" />
              <RHFTextField name="debtor_number" label="debtor_number" />

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
              <RHFTextField name="payment_terms" label="payment_terms" />
              <RHFTextField name="payment_instruction" label="payment_instruction" />
              <RHFTextField name="payment_method" label="payment_method" />
              <RHFTextField name="order_method" label="order_method" />
              <RHFTextField name="delivery_time_of_order" label="delivery_time_of_order" type="number" />
              <RHFTextField name="minimum_order_amount" label="minimum_order_amount" type="number" />
              <RHFTextField name="percentage_to_add" label="percentage_to_add" type="number" />

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
              <RHFTextField name="website" label="website" />
              <RHFTextField name="memo" label="memo" />
              <RHFTextField name="supplier_extra_info" label="supplier_extra_info" />
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
              <RHFSwitch
                name="hasGivenPaymentAuth"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    hasGivenPaymentAuth
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="has_connection_with_supplier_system"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    has_connection_with_supplier_system
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentSupplier ? 'Create Supplier' : 'Save Changes'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
