import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { Divider, MenuItem } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

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
    gender: Yup.string().required('Gender is required'),
    address: Yup.string().notRequired(),
    city: Yup.string().notRequired(),
    country: Yup.string().notRequired(),
    postal_code: Yup.string().notRequired(),
    contact_person: Yup.string().notRequired(),
    iban: Yup.string().notRequired(),
    bic: Yup.string().notRequired(),
    debtor_number: Yup.string().notRequired(),
    payment_terms: Yup.string().notRequired(),
    payment_instruction: Yup.string().notRequired(),
    payment_method: Yup.string().notRequired(),
    minimum_order_amount: Yup.string().notRequired(),
    account_holder_name: Yup.string().notRequired(),
    account_holder_city: Yup.string().notRequired(),
    vat_number: Yup.string().notRequired(),
    kvk_number: Yup.string().notRequired(),
    facebook: Yup.string().notRequired(),
    linkedin: Yup.string().notRequired(),
    twitter: Yup.string().notRequired(),
    instagram: Yup.string().notRequired(),
    pinterest: Yup.string().notRequired(),
    tiktok: Yup.string().notRequired(),
    website: Yup.string().notRequired(),
    memo: Yup.string().notRequired(),
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
              <RHFTextField name="email_general" label="Email" />
              <RHFTextField name="phone" label="Phone Number" />
              <RHFTextField name="mobile_phone" label="Mobile Number" />
              <RHFSelect name="gender" label="Gender">
                <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </RHFSelect>
              <RHFTextField name="contact_person" label="contact_person" />
              <RHFTextField name="address" label="address" />
              <RHFTextField name="postal_code" label="postal_code" />
              <RHFTextField name="city" label="city" />
              <RHFTextField name="country" label="country" />
              <RHFTextField name="iban" label="iban" />
              <RHFTextField name="bic" label="bic" />
              <RHFTextField name="account_holder_name" label="account_holder_name" />
              <RHFTextField name="account_holder_city" label="account_holder_city" />
              <RHFTextField name="vat_number" label="vat_number" />
              <RHFTextField name="kvk_number" label="kvk_number" />
              <RHFTextField name="debtor_number" label="debtor_number" />
              <RHFTextField name="payment_terms" label="payment_terms" />
              <RHFTextField name="payment_instruction" label="payment_instruction" />
              <RHFTextField name="payment_method" label="payment_method" />
              <RHFTextField name="minimum_order_amount" label="minimum_order_amount" />
              <RHFTextField name="facebook" label="facebook" />
              <RHFTextField name="linkedin" label="linkedin" />
              <RHFTextField name="twitter" label="twitter" />
              <RHFTextField name="instagram" label="instagram" />
              <RHFTextField name="pinterest" label="pinterest" />
              <RHFTextField name="tiktok" label="tiktok" />
              <RHFTextField name="memo" label="memo" />
              <RHFTextField name="website" label="website" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentSupplier ? 'Create Category' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
